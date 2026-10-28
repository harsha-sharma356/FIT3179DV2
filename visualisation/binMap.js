const binMapSpec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "Hexbin map of synthetic point data over Australia",
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
      "name": "points",
      "transform": [
        {"type": "sequence", "start": 0, "stop": 3000},
        {"type": "formula", "as": "city", "expr": "floor(pow(random(), 1.6) * 6)"},
        {
          "type": "formula", "as": "lon",
          "expr": "[151.2, 145.0, 153.0, 115.9, 138.6, 130.8][datum.city] + 1.2 * sqrt(-2 * log(1 - random())) * cos(2 * PI * random())"
        },
        {
          "type": "formula", "as": "lat",
          "expr": "[-33.9, -37.8, -27.5, -32.0, -34.9, -12.5][datum.city] + 1.0 * sqrt(-2 * log(1 - random())) * cos(2 * PI * random())"
        },
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
          "ops": ["count"],
          "as": ["count"]
        }
      ]
    }
  ],

  "scales": [
    {
      "name": "color",
      "type": "sqrt",
      "domain": {"data": "hexes", "field": "count"},
      "range": {"scheme": "yelloworangered"},
      "zero": false
    }
  ],

  "legends": [
    {
      "fill": "color",
      "type": "gradient",
      "title": "Points per hex",
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
          "fill": {"scale": "color", "field": "count"},
          "fillOpacity": {"value": 0.85},
          "stroke": {"value": "#ffffff"},
          "strokeWidth": {"value": 0.75},
          "tooltip": {"signal": "'Points: ' + datum.count"}
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