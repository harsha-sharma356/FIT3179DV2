const binMapSpec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "Hexbin map of home battery usable capacity (CER, Jul 2025 to Sep 2026) by postcode centroid, Australia",
  "title": {
    "text": "Home Battery Usable Capacity by Postcode (Australia)",
    "font": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    "fontWeight": "normal"
  },
  "width": 700,
  "height": 600,
  "padding": 5,
  "autosize": "none",

  "signals": [
    {
      "name": "hexR",
      "value": 14,
      "bind": {"input": "range", "min": 8, "max": 32, "step": 2, "name": "Hex radius (px)"}
    }
  ],

  "projections": [
    {
      "name": "projection",
      "type": "azimuthalEquidistant",
      "rotate": [-134, 25, 0],
      "scale": 900,
      "translate": [350, 300]
    }
  ],

  "data": [
    {
      "name": "world",
      "url": "https://vega.github.io/vega-datasets/data/world-110m.json",
      "format": {"type": "topojson", "feature": "countries"}
    },
    {
      "name": "sphere",
      "values": [{"type": "Sphere"}]
    },
    {
      "name": "graticule",
      "transform": [{"type": "graticule", "step": [10, 10]}]
    },

    {
      "name": "postcodes",
      "url": "https://raw.githubusercontent.com/matthewproctor/australianpostcodes/master/australian_postcodes.csv",
      "format": {"type": "csv", "parse": {"postcode": "number", "long": "number", "lat": "number"}},
      "transform": [
        {
          "type": "filter",
          "expr": "isValid(datum.postcode) && datum.long > 112 && datum.long < 154 && datum.lat < -9 && datum.lat > -45"
        },
        {
          "type": "aggregate",
          "groupby": ["postcode"],
          "ops": ["mean", "mean"],
          "fields": ["long", "lat"],
          "as": ["lon", "lat"]
        }
      ]
    },

    {
      "name": "points",
      "url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/sgu-battery-capacity-2011-to-present-and-totals.csv",
      "format": {"type": "csv"},
      "transform": [
        {
          "type": "formula",
          "as": "postcode",
          "expr": "toNumber(datum['Small Unit Installation Postcode'])"
        },
        {
          "type": "formula",
          "as": "capacity",
          "expr": "toNumber(replace(datum['Total usable capacity in kWh'], regexp(',', 'g'), ''))"
        },
        {"type": "filter", "expr": "isValid(datum.postcode) && isValid(datum.capacity)"},
        {
          "type": "lookup",
          "from": "postcodes",
          "key": "postcode",
          "fields": ["postcode"],
          "values": ["lon", "lat"],
          "as": ["lon", "lat"]
        },
        {"type": "filter", "expr": "isValid(datum.lon) && isValid(datum.lat)"},
        {
          "type": "geopoint",
          "projection": "projection",
          "fields": ["lon", "lat"],
          "as": ["x", "y"]
        },
        {"type": "filter", "expr": "isValid(datum.x) && isValid(datum.y)"}
      ]
    },

    {
      "name": "hexes",
      "source": "points",
      "transform": [
        {"type": "formula", "as": "fq", "expr": "(sqrt(3) / 3 * datum.x - datum.y / 3) / hexR"},
        {"type": "formula", "as": "fr", "expr": "(2 / 3 * datum.y) / hexR"},
        {"type": "formula", "as": "fs", "expr": "-datum.fq - datum.fr"},
        {"type": "formula", "as": "rq", "expr": "round(datum.fq)"},
        {"type": "formula", "as": "rr", "expr": "round(datum.fr)"},
        {"type": "formula", "as": "rs", "expr": "round(datum.fs)"},
        {"type": "formula", "as": "dq", "expr": "abs(datum.rq - datum.fq)"},
        {"type": "formula", "as": "dr", "expr": "abs(datum.rr - datum.fr)"},
        {"type": "formula", "as": "ds", "expr": "abs(datum.rs - datum.fs)"},
        {
          "type": "formula", "as": "q",
          "expr": "(datum.dq > datum.dr && datum.dq > datum.ds) ? -datum.rr - datum.rs : datum.rq"
        },
        {
          "type": "formula", "as": "r",
          "expr": "(!(datum.dq > datum.dr && datum.dq > datum.ds) && datum.dr > datum.ds) ? -datum.rq - datum.rs : datum.rr"
        },
        {"type": "formula", "as": "cx", "expr": "hexR * sqrt(3) * (datum.q + datum.r / 2)"},
        {"type": "formula", "as": "cy", "expr": "hexR * 1.5 * datum.r"},
        {
          "type": "aggregate",
          "groupby": ["cx", "cy"],
          "ops": ["sum", "count"],
          "fields": ["capacity", "capacity"],
          "as": ["total", "postcodes"]
        }
      ]
    }
  ],

  "scales": [
    {
      "name": "color",
      "type": "sqrt",
      "domain": {"data": "hexes", "field": "total"},
      "range": {"scheme": "yelloworangered"},
      "zero": false
    }
  ],

  "legends": [
    {
      "fill": "color",
      "type": "gradient",
      "title": "Home battery capacity per hex (kWh)",
      "orient": "bottom-right",
      "gradientLength": 180
    }
  ],

  "marks": [
    {
      "type": "shape",
      "from": {"data": "sphere"},
      "encode": {
        "enter": {
          "fill": {"value": "#e0f2fe"},
          "stroke": {"value": "#bae6fd"},
          "strokeWidth": {"value": 1}
        }
      },
      "transform": [{"type": "geoshape", "projection": "projection"}]
    },
    {
      "type": "shape",
      "from": {"data": "graticule"},
      "encode": {
        "enter": {
          "fill": {"value": null},
          "stroke": {"value": "#cbd5e1"},
          "strokeWidth": {"value": 0.5}
        }
      },
      "transform": [{"type": "geoshape", "projection": "projection"}]
    },
    {
      "type": "shape",
      "from": {"data": "world"},
      "encode": {
        "enter": {
          "fill": {"value": "#e2e8f0"},
          "stroke": {"value": "#ffffff"},
          "strokeWidth": {"value": 0.8}
        }
      },
      "transform": [{"type": "geoshape", "projection": "projection"}]
    },
    {
      "type": "path",
      "from": {"data": "hexes"},
      "encode": {
        "update": {
          "x": {"field": "cx"},
          "y": {"field": "cy"},
          "path": {
            "signal": "'M0,' + (-hexR) + 'L' + (0.8660254 * hexR) + ',' + (-0.5 * hexR) + 'L' + (0.8660254 * hexR) + ',' + (0.5 * hexR) + 'L0,' + hexR + 'L' + (-0.8660254 * hexR) + ',' + (0.5 * hexR) + 'L' + (-0.8660254 * hexR) + ',' + (-0.5 * hexR) + 'Z'"
          },
          "fill": {"scale": "color", "field": "total"},
          "fillOpacity": {"value": 0.85},
          "stroke": {"value": "#ffffff"},
          "strokeWidth": {"value": 0.75},
          "tooltip": {"signal": "'Battery capacity: ' + format(datum.total / 1000, ',.1f') + ' MWh (' + datum.postcodes + ' postcodes)'"}
        },
        "hover": {"fillOpacity": {"value": 1}}
      }
    }
  ]
}

    // Embed the visualization into the div with ID 'vis'
vegaEmbed('#vis', binMapSpec).then(result => {
  console.log(result);
}).catch(console.error);

