// ---------------------------------------------------------------------------
// Home energy technology adoption by postcode – hexbin map (Australia)
// Reads au_household_tech_by_postcode.csv (made by build_au_tech_postcodes.py).
//
//  * Projection: conic EQUAL-AREA (Albers-style, parallels 18°S/36°S, central meridian 132°E).
//    Equal-area matters for a hexbin: every hex then covers the same ground area.
//  * Each hex SUMS its postcodes' counts first, THEN divides (ratio of sums) – never an average of ratios.
//  * Colour = quantile classes, so a few huge metro hexes can't wash out the rest of the country.
//  * Metrics: battery capacity (kWh), rooftop solar capacity (kW) and battery-per-kW-of-solar.
//  * Bar chart below the map: the same metric by state, with the national figure marked.
//
// Everything is inside one function (no global name clashes) and errors are printed in the chart box.
// ---------------------------------------------------------------------------
(function () {
  "use strict";

  const SELECTOR = "#vis";
  const DATA_URL = "https://raw.githubusercontent.com/harsha-sharma356/FIT3179DV2/main/data/au_household_tech_by_postcode.csv";
  const WORLD_URL = "https://vega.github.io/vega-datasets/data/world-110m.json";
  // Optional: a GeoJSON FeatureCollection of the states (lon/lat) to draw state borders, e.g. one from
  // github.com/rowanhogan/australian-states  (check the raw URL works). Leave "" to skip.
  const STATES_URL = "";

  // ---- the fields each hex sums (the two provided by the CSV)
  const SUM_LABELS = {
    bat_kwh:  "Battery capacity (kWh)",
    solar_kw: "Rooftop solar capacity (kW)"
  };

  // ---- metrics shown in the "Show:" dropdown (only those the CSV supports)
  const DEFS = [
    {key: "kwh_per_kw", label: "Battery storage per kW of rooftop solar (kWh per kW)", needs: ["bat_kwh", "solar_kw"], ratio: true, fmt: ",.2f",
     expr: "datum.solar_kw > 0 ? datum.bat_kwh / datum.solar_kw : null"},
    {key: "bat_kwh", label: "Total home battery capacity (kWh)", needs: ["bat_kwh"], ratio: false, fmt: ",.0f",
     expr: "datum.bat_kwh"},
    {key: "solar_kw", label: "Rooftop solar capacity (kW)", needs: ["solar_kw"], ratio: false, fmt: ",.0f",
     expr: "datum.solar_kw"}
  ];

  const CAPITALS = [
    {name: "Sydney", lon: 151.21, lat: -33.87}, {name: "Melbourne", lon: 144.96, lat: -37.81},
    {name: "Brisbane", lon: 153.03, lat: -27.47}, {name: "Perth", lon: 115.86, lat: -31.95},
    {name: "Adelaide", lon: 138.60, lat: -34.93}, {name: "Hobart", lon: 147.33, lat: -42.88},
    {name: "Darwin", lon: 130.84, lat: -12.46}, {name: "Canberra", lon: 149.13, lat: -35.28}
  ];

  const vegaMajor = (window.vega && window.vega.version) ? String(window.vega.version).split(".")[0] : "5";

  // ------------------------------------------------------------------ spec builder
  function buildSpec(rows, cols) {
    const has = f => cols.has(f);
    const metrics = DEFS.filter(d => d.needs.every(has) && (!d.needsAny || d.needsAny.some(has)));
    if (!metrics.length) {
      throw new Error("None of the expected columns were found in the CSV. Columns seen: " + Array.from(cols).join(", "));
    }
    const SUMS = Object.keys(SUM_LABELS).filter(has);
    const hasState = has("state");
    // the field used to hide hexes that rest on too little data
    const BASE = "solar_kw";
    const BASE_LABEL = SUM_LABELS[BASE];
    const baseSlider = {min: 0, max: 20000, step: 100, value: 500};

    const chain = (sig, pick, last) =>
      metrics.map(m => sig + " === '" + m.key + "' ? " + pick(m) + " : ").join("") + last;
    const metricLabelExpr = chain("metric", m => "'" + m.label + "'", "metric");
    const isRatioExpr = chain("metric", m => (m.ratio ? "true" : "false"), "false");
    const fmtExpr = chain("metric", m => "'" + m.fmt + "'", "',.1f'");

    const aggOps = ["count"].concat(SUMS.map(() => "sum"));
    const aggFields = [null].concat(SUMS);
    const aggAs = ["n"].concat(SUMS);
    const metricFormulas = metrics.map(m => ({type: "formula", as: "m_" + m.key, expr: m.expr}));
    const valueFormula = {type: "formula", as: "value", expr: "datum['m_' + metric]"};

    const tooltipFor = nLabel => "{'" + nLabel + "': datum.n, " +
      SUMS.map(f => "'" + SUM_LABELS[f] + "': isValid(datum['" + f + "']) ? format(datum['" + f + "'], ',.0f') : 'n/a'").join(", ") +
      ", " +
      metrics.filter(m => m.ratio).map(m => "'" + m.label + "': isValid(datum['m_" + m.key + "']) ? format(datum['m_" + m.key + "'], '" + m.fmt + "') : 'n/a'").join(", ") +
      "}";
    const tooltipSignal = tooltipFor("Postcodes in hex");
    const stateTooltip = tooltipFor("Postcodes in state");

    const hexPath = "'M0,' + (-hexR) + 'L' + (0.8660254 * hexR) + ',' + (-0.5 * hexR) + 'L' + (0.8660254 * hexR) + ',' + (0.5 * hexR) + " +
                    "'L0,' + hexR + 'L' + (-0.8660254 * hexR) + ',' + (0.5 * hexR) + 'L' + (-0.8660254 * hexR) + ',' + (-0.5 * hexR) + 'Z'";

    const data = [
      {name: "world", url: WORLD_URL, format: {type: "topojson", feature: "countries"}},
      {name: "graticule", transform: [{type: "graticule", step: [10, 10]}]},
      {name: "capitals", values: CAPITALS,
       transform: [{type: "geopoint", projection: "projection", fields: ["lon", "lat"], as: ["x", "y"]}]},
      {
        name: "points", values: rows,
        transform: [
          {type: "filter", expr: "isValid(datum.lon) && isValid(datum.lat)"},
          {type: "geopoint", projection: "projection", fields: ["lon", "lat"], as: ["x", "y"]},
          {type: "filter", expr: "isValid(datum.x) && isValid(datum.y)"}
        ]
      },
      {
        name: "hexes", source: "points",
        transform: [
          {type: "formula", as: "fq", expr: "(sqrt(3) / 3 * datum.x - datum.y / 3) / hexR"},
          {type: "formula", as: "fr", expr: "(2 / 3 * datum.y) / hexR"},
          {type: "formula", as: "fs", expr: "-datum.fq - datum.fr"},
          {type: "formula", as: "rq", expr: "round(datum.fq)"},
          {type: "formula", as: "rr", expr: "round(datum.fr)"},
          {type: "formula", as: "rs", expr: "round(datum.fs)"},
          {type: "formula", as: "dq", expr: "abs(datum.rq - datum.fq)"},
          {type: "formula", as: "dr", expr: "abs(datum.rr - datum.fr)"},
          {type: "formula", as: "ds", expr: "abs(datum.rs - datum.fs)"},
          {type: "formula", as: "q", expr: "(datum.dq > datum.dr && datum.dq > datum.ds) ? -datum.rr - datum.rs : datum.rq"},
          {type: "formula", as: "r", expr: "(!(datum.dq > datum.dr && datum.dq > datum.ds) && datum.dr > datum.ds) ? -datum.rq - datum.rs : datum.rr"},
          {type: "formula", as: "cx", expr: "hexR * sqrt(3) * (datum.q + datum.r / 2)"},
          {type: "formula", as: "cy", expr: "hexR * 1.5 * datum.r"},
          {type: "aggregate", groupby: ["cx", "cy"], ops: aggOps, fields: aggFields, as: aggAs}
        ].concat(metricFormulas, [
          valueFormula,
          {type: "formula", as: "baseN", expr: "datum['" + BASE + "']"},
          {type: "filter", expr: "isValid(datum.value) && datum.baseN >= minBase"}
        ])
      }
    ];
    if (STATES_URL) {
      data.push({name: "states", url: STATES_URL, format: {type: "json", property: "features"}});
    }
    if (hasState) {
      data.push({
        name: "byState", source: "points",
        transform: [
          {type: "filter", expr: "isValid(datum.state)"},
          {type: "aggregate", groupby: ["state"], ops: aggOps, fields: aggFields, as: aggAs}
        ].concat(metricFormulas, [valueFormula, {type: "filter", expr: "isValid(datum.value)"}])
      });
      data.push({
        name: "national", source: "points",
        transform: [{type: "aggregate", ops: aggOps, fields: aggFields, as: aggAs}].concat(metricFormulas, [valueFormula])
      });
    }

    const mapMarks = [
      {type: "shape", from: {data: "graticule"},
       encode: {enter: {fill: {value: null}, stroke: {value: "#bfdbfe"}, strokeWidth: {value: 0.5}}},
       transform: [{type: "geoshape", projection: "projection"}]},
      {type: "shape", from: {data: "world"},
       encode: {enter: {fill: {value: "#e5e7eb"}, stroke: {value: "#ffffff"}, strokeWidth: {value: 0.8}}},
       transform: [{type: "geoshape", projection: "projection"}]}
    ];
    if (STATES_URL) {
      mapMarks.push({type: "shape", from: {data: "states"},
        encode: {enter: {fill: {value: null}, stroke: {value: "#94a3b8"}, strokeWidth: {value: 0.6}}},
        transform: [{type: "geoshape", projection: "projection"}]});
    }
    mapMarks.push(
      {
        type: "path", name: "hex", from: {data: "hexes"},
        encode: {
          update: {
            x: {field: "cx"}, y: {field: "cy"},
            path: {signal: hexPath},
            fill: {scale: "color", field: "value"},
            fillOpacity: {value: 0.9},
            stroke: {value: "#ffffff"}, strokeWidth: {value: 0.75},
            tooltip: {signal: tooltipSignal}
          },
          hover: {fillOpacity: {value: 1}, stroke: {value: "#111827"}, strokeWidth: {value: 1.5}}
        }
      },
      {type: "symbol", from: {data: "capitals"}, interactive: false,
       encode: {update: {x: {field: "x"}, y: {field: "y"}, size: {value: 22},
                         fill: {value: "#111827"}, stroke: {value: "#ffffff"}, strokeWidth: {value: 1}}}},
      {type: "text", from: {data: "capitals"}, interactive: false,
       encode: {update: {x: {field: "x"}, y: {field: "y"}, dx: {value: 6}, dy: {value: 3},
                         text: {field: "name"}, fontSize: {value: 10}, fill: {value: "#111827"}}}}
    );

    const marks = [{
      type: "group", name: "mapPanel",
      encode: {enter: {x: {value: 0}, y: {value: 0}, width: {value: 700}, height: {value: 600},
                       clip: {value: true}, fill: {value: "#e0f2fe"}, stroke: {value: "#cbd5e1"}}},
      marks: mapMarks
    }];

    if (hasState) {
      marks.push({
        type: "group", name: "statePanel",
        title: {text: {signal: "'By state: ' + metricLabel"}, anchor: "start", fontSize: 11, fontWeight: "normal", limit: 260},
        encode: {enter: {x: {value: 0}, y: {value: 632}, width: {value: 700}, height: {value: 150}}},
        scales: [
          {name: "yS", type: "band", range: "height", padding: 0.2,
           domain: {data: "byState", field: "state", sort: {op: "max", field: "value", order: "descending"}}},
          {name: "xS", type: "linear", range: "width", zero: true, nice: true,
           domain: {data: "byState", field: "value"}}
        ],
        axes: [
          {orient: "left", scale: "yS", domain: false, ticks: false},
          {orient: "bottom", scale: "xS", grid: true, tickCount: 4, format: ".3~s"}
        ],
        marks: [
          {type: "rect", from: {data: "byState"},
           encode: {update: {
             x: {value: 0}, x2: {scale: "xS", field: "value"},
             y: {scale: "yS", field: "state"}, height: {scale: "yS", band: 1},
             fill: {value: "#ea580c"},
             tooltip: {signal: stateTooltip}}}},
          {type: "text", from: {data: "byState"}, interactive: false,
           encode: {update: {
             x: {scale: "xS", field: "value"}, dx: {value: 4},
             y: {scale: "yS", field: "state", band: 0.5}, baseline: {value: "middle"},
             text: {signal: "format(datum.value, " + fmtExpr + ")"},
             fontSize: {value: 10}, fill: {value: "#374151"}}}},
          {type: "rule", interactive: false,
           encode: {update: {
             x: {signal: "scale('xS', length(data('national')) ? data('national')[0].value : 0)"},
             y: {value: 0}, y2: {signal: "height"},
             stroke: {value: "#111827"}, strokeDash: {value: [4, 3]}, strokeWidth: {value: 1},
             opacity: {signal: "isRatio ? 1 : 0"}}}}
        ]
      });
      marks.push({
        type: "text", interactive: false,
        encode: {enter: {x: {value: 0}, y: {value: 820}, fontSize: {value: 10}, fill: {value: "#6b7280"},
                         text: {value: "Dashed line = national figure (rates only)"}}}
      });
    }

    return {
      "$schema": "https://vega.github.io/schema/vega/v" + vegaMajor + ".json",
      description: "Hexbin map of home energy technology adoption by postcode, Australia (CER postcode data).",
      title: {
        text: "Household energy technology by postcode (Australia)",
        subtitle: "Source: Clean Energy Regulator small-scale installation postcode data",
        font: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        fontWeight: "normal", anchor: "start", subtitleFontSize: 11, subtitleColor: "#6b7280"
      },
      width: 700, height: 840, padding: 5, autosize: "pad",

      signals: [
        {name: "hexR", value: 14, bind: {input: "range", min: 8, max: 32, step: 2, name: "Hex radius (px): "}},
        {name: "metric", value: metrics[0].key,
         bind: {input: "select", options: metrics.map(m => m.key), labels: metrics.map(m => m.label), name: "Show: "}},
        {name: "minBase", value: baseSlider.value,
         bind: {input: "range", min: baseSlider.min, max: baseSlider.max, step: baseSlider.step,
                name: "Hide hexes with less than this " + BASE_LABEL.toLowerCase() + ": "}},
        {name: "metricLabel", update: metricLabelExpr},
        {name: "isRatio", update: isRatioExpr}
      ],

      projections: [{
        name: "projection",
        type: "conicEqualArea",
        parallels: [-18, -36],
        rotate: [-132, 0],
        center: [0, -27],
        scale: 900,
        translate: [350, 300]
      }],

      data: data,

      scales: [{
        name: "color", type: "quantile",
        domain: {data: "hexes", field: "value"},
        range: {scheme: "yelloworangered", count: 7}
      }],

      legends: [{
        fill: "color", type: "symbol", symbolType: "square", symbolSize: 120,
        title: {signal: "metricLabel"}, titleLimit: 230, labelLimit: 140,
        format: ".3~s", orient: "top-right", offset: 8
      }],

      marks: marks
    };
  }

  // ------------------------------------------------------------------ render
  function showError(el, err) {
    console.error(err);
    const pre = document.createElement("pre");
    pre.style.cssText = "color:#b91c1c;background:#fef2f2;padding:12px;white-space:pre-wrap;font-size:13px";
    pre.textContent = "Chart failed to render:\n" + (err && err.message ? err.message : String(err));
    el.innerHTML = "";
    el.appendChild(pre);
  }

  function render() {
    const el = document.querySelector(SELECTOR);
    if (!el) { console.error("binMapSpec: no element matches " + SELECTOR); return; }
    if (typeof vegaEmbed !== "function" || !window.vega) {
      showError(el, new Error("vega / vegaEmbed not loaded. Load the vega, vega-lite and vega-embed <script> tags BEFORE this file."));
      return;
    }
    fetch(DATA_URL)
      .then(function (r) {
        if (!r.ok) throw new Error("Could not load " + DATA_URL + " (HTTP " + r.status + ")");
        return r.text();
      })
      .then(function (text) {
        const rows = window.vega.read(text, {type: "csv", parse: "auto"});
        if (!rows.length) throw new Error("The CSV was empty: " + DATA_URL);
        const spec = buildSpec(rows, new Set(Object.keys(rows[0])));
        return vegaEmbed(el, spec, {actions: {export: true, source: false, compiled: false, editor: false}});
      })
      .then(function (r) { console.log("household tech map ready", r); })
      .catch(function (err) { showError(el, err); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();