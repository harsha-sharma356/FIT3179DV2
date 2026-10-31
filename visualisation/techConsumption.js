// ---------------------------------------------------------------------------
// Global tech & connectivity map – reads tech_countries.csv made by build_dataset.py
//   * ~200 countries, 2015-2025 (World Bank API + optional ITU / e-waste / Comtrade files)
//   * size = any metric, colour = any metric
//   * World view + 7 regions, click a bubble/bar to pick a country
//   * top-12 ranking for the selected year, trend of the picked country vs its region
// Bubbles sit at each country's CAPITAL city.
//
// Everything lives inside one function, so it cannot clash with other scripts on the page
// (no global const METRICS / REGIONS / DATA_URL ...). Errors are printed into the chart box.
// ---------------------------------------------------------------------------
(function () {
  "use strict";

  const SELECTOR = "#gadget";
  const DATA_URL = "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/tech_countries.csv";

  // [csv column, label shown in the dropdowns]
  const METRICS = [
    ["mobile_millions",          "Mobile subscriptions (millions)"],
    ["mobile_per100",            "Mobile subscriptions per 100 people"],
    ["internet_millions",        "Internet users (millions)"],
    ["internet_pct",             "Internet users (% of population)"],
    ["fiveg_pct",                "5G population coverage (%)"],
    ["ewaste_kt",                "E-waste generated (kilotonnes)"],
    ["ewaste_kg_pc",             "E-waste per capita (kg)"],
    ["smartphone_imports_usd_m", "Smartphone imports (US$ millions)"],
    ["population_millions",      "Population (millions)"]
  ];
  const FIELDS = METRICS.map(m => m[0]);
  const LABELS = METRICS.map(m => m[1]);

  // Map views. lon/lat = centre, scale = zoom, bubble = max bubble area in px².
  const REGIONS = {
    "World":                      {lon:  10, lat:   0, scale: 115, bubble:  900},
    "East Asia & Pacific":        {lon: 120, lat:   5, scale: 230, bubble: 1800},
    "South Asia":                 {lon:  78, lat:  25, scale: 520, bubble: 2400},
    "Europe & Central Asia":      {lon:  40, lat:  52, scale: 300, bubble: 1800},
    "Middle East & North Africa": {lon:  40, lat:  28, scale: 340, bubble: 2000},
    "Sub-Saharan Africa":         {lon:  20, lat:  -3, scale: 450, bubble: 2000},
    "Latin America & Caribbean":  {lon: -70, lat: -10, scale: 300, bubble: 2000},
    "North America":              {lon: -100, lat: 45, scale: 450, bubble: 2600}
  };

  // helpers: turn the tables above into Vega expression strings
  const regionExpr = (prop, sig) =>
    Object.keys(REGIONS).map(k => sig + " === '" + k + "' ? " + REGIONS[k][prop] + " : ").join("") + "0";
  const labelExpr = sig =>
    METRICS.map(m => sig + " === '" + m[0] + "' ? '" + m[1] + "' : ").join("") + sig;
  const tooltipSignal =
    "{'Country': datum.country, 'Region': datum.region, 'Year': datum.year, " +
    METRICS.map(m => "'" + m[1] + "': isValid(datum['" + m[0] + "']) ? format(datum['" + m[0] + "'], ',.1f') : 'n/a'").join(", ") +
    "}";

  // use the schema version of whichever Vega is actually loaded (avoids v5/v6 mismatch warnings)
  const vegaMajor = (window.vega && window.vega.version) ? String(window.vega.version).split(".")[0] : "5";

  const spec = {
    "$schema": "https://vega.github.io/schema/vega/v" + vegaMajor + ".json",
    "description": "Global tech & connectivity proportional symbol map with ranking and trend panels.",
    "title": {
      "text": {"signal": "'Tech & connectivity — World overview, ' + year"},
      "font": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      "fontWeight": "normal",
      "anchor": "start"
    },
    "width": 1400,
    "height": 530,
    "padding": 5,
    "autosize": "pad",

    "signals": [
      // region parameter shown in the mini map (region "zoom" selector below the world map)
      {"name": "zoomRegion", "value": "World",
       "bind": {"input": "select", "options": Object.keys(REGIONS), "name": "Mini-map region: "}},
      {"name": "year", "value": 2022,
       "bind": {"input": "range", "min": 2015, "max": 2024, "step": 1, "name": "Year: "},
       "on": [{"events": {"type": "timer", "throttle": 900},
               "update": "play ? (year >= 2025 ? 2015 : year + 1) : year"}]},
      {"name": "play", "value": false, "bind": {"input": "checkbox", "name": "Play years: "}},
      {"name": "sizeMetric", "value": "mobile_millions",
       "bind": {"input": "select", "options": FIELDS, "labels": LABELS, "name": "Size by: "}},
      {"name": "colorMetric", "value": "internet_pct",
       "bind": {"input": "select", "options": FIELDS, "labels": LABELS, "name": "Colour by: "}},
      {"name": "sizeLabel",  "update": labelExpr("sizeMetric")},
      {"name": "colorLabel", "update": labelExpr("colorMetric")},
      // country shown in the trend panel; click a bubble or a bar to change it
      {"name": "picked", "value": "USA",
       "on": [{"events": "@bubble:click, @bar:click", "update": "datum.iso3"}]},
      // zoom map view: centred on the clicked region
      {"name": "centerLon", "update": regionExpr("lon", "zoomRegion")},
      {"name": "centerLat", "update": regionExpr("lat", "zoomRegion")},
      {"name": "projZoomScale", "update":
        "zoomRegion === 'World' ? 60 : (zoomRegion === 'South Asia' ? 520 : zoomRegion === 'Sub-Saharan Africa' ? 450 : zoomRegion === 'North America' ? 480 : 340)"},
      {"name": "zoomLabel", "update": "zoomRegion"}
    ],

    "projections": [
      {
        "name": "proj",
        "type": "equalEarth",
        "scale": 115,
        "translate": [320, 180]
      },
      {
        "name": "projZoom",
        "type": "azimuthalEquidistant",
        "rotate": [{"signal": "-centerLon"}, {"signal": "-centerLat"}],
        "scale": {"signal": "projZoomScale"},
        "translate": [150, 75]
      }
    ],

    "data": [
      {"name": "sphere", "values": [{"type": "Sphere"}]},
      {"name": "world",
       "url": "https://vega.github.io/editor/data/world-110m.json",
       "format": {"type": "topojson", "feature": "countries"}},
      {
        "name": "all",
        "url": DATA_URL,
        "format": {"type": "csv", "parse": "auto"},
        "transform": [
          {"type": "formula", "as": "sizeVal",  "expr": "datum[sizeMetric]"},
          {"type": "formula", "as": "colorVal", "expr": "datum[colorMetric]"}
        ]
      },
      {
        "name": "scoped", "source": "all",
        "transform": [{"type": "filter", "expr": "true"}]
      },
      {
        "name": "current", "source": "scoped",
        "transform": [
          {"type": "filter", "expr": "datum.year == year && isValid(datum.sizeVal) && isValid(datum.lon)"},
          {"type": "geopoint", "projection": "proj", "fields": ["lon", "lat"], "as": ["x", "y"]},
          {"type": "collect", "sort": {"field": "sizeVal", "order": "descending"}}
        ]
      },
      {
        "name": "zoomData", "source": "all",
        "transform": [
          {"type": "filter", "expr": "zoomRegion === 'World' || datum.region === zoomRegion"},
          {"type": "filter", "expr": "datum.year == year && isValid(datum.sizeVal) && isValid(datum.lon)"},
          {"type": "geopoint", "projection": "projZoom", "fields": ["lon", "lat"], "as": ["zx", "zy"]},
          {"type": "collect", "sort": {"field": "sizeVal", "order": "descending"}}
        ]
      },
      {
        "name": "top", "source": "current",
        "transform": [
          {"type": "window", "sort": {"field": "sizeVal", "order": "descending"},
           "ops": ["row_number"], "fields": [null], "as": ["rank"]},
          {"type": "filter", "expr": "datum.rank <= 12"}
        ]
      },
      {
        "name": "pickedSeries", "source": "all",
        "transform": [{"type": "filter", "expr": "datum.iso3 === picked && isValid(datum.sizeVal)"}]
      }
    ],

    "scales": [
      {"name": "size", "type": "sqrt", "zero": true,
       "domain": {"data": "scoped", "field": "sizeVal"},
       "range": [0, 900]},
      {"name": "color", "type": "sequential", "zero": false,
       "domain": {"data": "all", "field": "colorVal"},
       "range": {"scheme": "viridis"}},
      {"name": "zoomSize", "type": "sqrt", "zero": true,
       "domain": {"data": "zoomData", "field": "sizeVal"},
       "range": [0, 700]}
    ],

    "legends": [
      {"size": "size", "title": {"signal": "'Size: ' + sizeLabel"}, "titleLimit": 280,
       "format": "~s", "orient": "bottom-left",
       "symbolFillColor": "#9ca3af", "symbolStrokeColor": "#374151", "symbolOpacity": 0.7},
      {"fill": "color", "type": "gradient", "title": {"signal": "'Colour: ' + colorLabel"},
       "titleLimit": 280, "orient": "top-left", "direction": "horizontal",
       "gradientLength": 180, "format": "~s"}
    ],

    "marks": [
      // ---------- map panel
      {
        "type": "group", "name": "mapPanel",
        "encode": {"enter": {
          "x": {"value": 0}, "y": {"value": 0}, "width": {"value": 640}, "height": {"value": 360},
          "clip": {"value": true}, "stroke": {"value": "#e5e7eb"}}},
        "marks": [
          {"type": "shape", "from": {"data": "sphere"},
           "encode": {"enter": {"fill": {"value": "#dbeafe"}, "stroke": {"value": "#bfdbfe"}, "strokeWidth": {"value": 1}}},
           "transform": [{"type": "geoshape", "projection": "proj"}]},
          {"type": "shape", "from": {"data": "world"},
           "encode": {"enter": {"fill": {"value": "#e5e7eb"}, "stroke": {"value": "#ffffff"}, "strokeWidth": {"value": 0.5}}},
           "transform": [{"type": "geoshape", "projection": "proj"}]},
          {
            "type": "symbol", "name": "bubble", "from": {"data": "current"},
            "encode": {
              "update": {
                "x": {"field": "x"}, "y": {"field": "y"},
                "size": {"scale": "size", "field": "sizeVal"},
                "fill": [{"test": "isValid(datum.colorVal)", "scale": "color", "field": "colorVal"},
                         {"value": "#9ca3af"}],
                "fillOpacity": {"value": 0.7},
                "stroke": [{"test": "datum.iso3 === picked", "value": "#ef4444"}, {"value": "#374151"}],
                "strokeWidth": [{"test": "datum.iso3 === picked", "value": 2.5}, {"value": 0.7}],
                "cursor": {"value": "pointer"},
                "tooltip": {"signal": tooltipSignal}
              },
              "hover": {"fillOpacity": {"value": 1}}
            }
          },
          {
            "type": "text", "from": {"data": "top"}, "interactive": false,
            "encode": {"update": {
              "x": {"field": "x"}, "y": {"field": "y"},
              "dy": {"signal": "sqrt(scale('size', datum.sizeVal)) / 2 + 10"},
              "text": {"field": "country"}, "align": {"value": "center"},
              "fontSize": {"value": 10}, "fill": {"value": "#374151"},
              "opacity": {"signal": "datum.rank > 6 ? 0 : 1"}}}
          }
        ]
      },

      // ---------- mini region map (small strip directly UNDER the world map)
      {
        "type": "group", "name": "miniPanel",
        "title": {"text": {"signal": "'Region zoom: ' + zoomLabel"},
                  "anchor": "start", "fontSize": 11, "fontWeight": "normal", "limit": 600},
        "encode": {"enter": {
          "x": {"value": 0}, "y": {"value": 362}, "width": {"value": 640}, "height": {"value": 360},
          "clip": {"value": true}, "stroke": {"value": "#e5e7eb"}}},
        "marks": [
          {"type": "shape", "from": {"data": "sphere"},
           "encode": {"enter": {"fill": {"value": "#dbeafe"}, "stroke": {"value": "#bfdbfe"}, "strokeWidth": {"value": 1}}},
           "transform": [{"type": "geoshape", "projection": "projZoom"}]},
          {"type": "shape", "from": {"data": "world"},
           "encode": {"enter": {"fill": {"value": "#e5e7eb"}, "stroke": {"value": "#ffffff"}, "strokeWidth": {"value": 0.4}}},
           "transform": [{"type": "geoshape", "projection": "projZoom"}]},
          {
            "type": "symbol", "from": {"data": "zoomData"},
            "encode": {
              "update": {
                "x": {"field": "zx"}, "y": {"field": "zy"},
                "size": {"scale": "zoomSize", "field": "sizeVal"},
                "fill": [{"test": "isValid(datum.colorVal)", "scale": "color", "field": "colorVal"}, {"value": "#9ca3af"}],
                "fillOpacity": {"value": 0.8},
                "stroke": [{"test": "datum.iso3 === picked", "value": "#ef4444"}, {"value": "#374151"}],
                "strokeWidth": {"value": 0.8},
                "tooltip": {"signal": tooltipSignal}
              },
              "hover": {"fillOpacity": {"value": 1}}
            }
          }
        ]
      },

      // ---------- top-12 ranking for the selected year
      {
        "type": "group", "name": "rankPanel",
        "title": {"text": {"signal": "'Top 12 in ' + year + ': ' + sizeLabel"},
                  "anchor": "start", "fontSize": 11, "fontWeight": "normal", "limit": 320},
        "encode": {"enter": {"x": {"value": 790}, "y": {"value": 30}, "width": {"value": 300}, "height": {"value": 200}}},
        "scales": [
          {"name": "yBar", "type": "band", "range": "height", "padding": 0.2,
           "domain": {"data": "top", "field": "country",
                      "sort": {"op": "max", "field": "sizeVal", "order": "descending"}}},
          {"name": "xBar", "type": "linear", "range": "width", "zero": true, "nice": true,
           "domain": {"data": "scoped", "field": "sizeVal"}}
        ],
        "axes": [
          {"orient": "left", "scale": "yBar", "domain": false, "ticks": false, "labelLimit": 110},
          {"orient": "bottom", "scale": "xBar", "grid": true, "tickCount": 4, "format": "~s"}
        ],
        "marks": [{
          "type": "rect", "name": "bar", "from": {"data": "top"},
          "encode": {"update": {
            "x": {"value": 0}, "x2": {"scale": "xBar", "field": "sizeVal"},
            "y": {"scale": "yBar", "field": "country"}, "height": {"scale": "yBar", "band": 1},
            "fill": [{"test": "isValid(datum.colorVal)", "scale": "color", "field": "colorVal"},
                     {"value": "#9ca3af"}],
            "stroke": [{"test": "datum.iso3 === picked", "value": "#ef4444"}, {"value": null}],
            "strokeWidth": {"value": 2},
            "cursor": {"value": "pointer"},
            "tooltip": {"signal": tooltipSignal}}}
        }]
      },

      // ---------- trend: picked country (red) vs every country in the region (grey)
      {
        "type": "group", "name": "trendPanel",
        "title": {"text": {"signal":
          "'Trend: ' + (length(data('pickedSeries')) ? data('pickedSeries')[0].country : picked) + ' — ' + sizeLabel"},
          "anchor": "start", "fontSize": 11, "fontWeight": "normal", "limit": 320},
        "encode": {"enter": {"x": {"value": 790}, "y": {"value": 296}, "width": {"value": 300}, "height": {"value": 140}}},
        "scales": [
          {"name": "xT", "type": "linear", "domain": [2015, 2025], "range": "width"},
          {"name": "yT", "type": "linear", "range": "height", "zero": true, "nice": true,
           "domain": {"data": "scoped", "field": "sizeVal"}}
        ],
        "axes": [
          {"orient": "bottom", "scale": "xT", "values": [2015, 2020, 2025], "format": "d"},
          {"orient": "left", "scale": "yT", "grid": true, "tickCount": 4, "format": "~s"}
        ],
        "marks": [
          {"type": "group",
           "from": {"facet": {"name": "series", "data": "scoped", "groupby": "iso3"}},
           "marks": [{
             "type": "line", "from": {"data": "series"}, "sort": {"field": "datum.year"},
             "encode": {
               "enter": {"stroke": {"value": "#9ca3af"}, "strokeWidth": {"value": 0.8}, "strokeOpacity": {"value": 0.35}},
               "update": {"x": {"scale": "xT", "field": "year"}, "y": {"scale": "yT", "field": "sizeVal"},
                          "defined": {"signal": "isValid(datum.sizeVal)"}}}
           }]},
          {"type": "line", "from": {"data": "pickedSeries"}, "sort": {"field": "datum.year"},
           "encode": {"update": {
             "x": {"scale": "xT", "field": "year"}, "y": {"scale": "yT", "field": "sizeVal"},
             "stroke": {"value": "#ef4444"}, "strokeWidth": {"value": 2}}}},
          {"type": "rule",
           "encode": {"update": {
             "x": {"scale": "xT", "signal": "year"}, "y": {"value": 0}, "y2": {"signal": "height"},
             "stroke": {"value": "#6b7280"}, "strokeDash": {"value": [4, 3]}, "strokeWidth": {"value": 1}}}}
        ]
      }
    ]
  };

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
    if (!el) { console.error("symbolMapSpec: no element matches " + SELECTOR); return; }
    if (typeof vegaEmbed !== "function") {
      showError(el, new Error("vegaEmbed is not loaded. Load vega, vega-lite and vega-embed <script> tags BEFORE this file."));
      return;
    }
    vegaEmbed(el, spec, {actions: {export: true, source: false, compiled: false, editor: false}})
      .then(function (r) { console.log("gadget map ready; Vega " + r.view.constructor.name, r); })
      .catch(function (err) { showError(el, err); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();