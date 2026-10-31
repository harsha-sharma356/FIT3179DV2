const smallerSymbolMap2Spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "Smaller-region proportional symbol map of tech gadget consumption by continent (Albers conic projection).",
  "title": {
    "text": "Tech Gadget Consumption by Continent (Albers)",
    "font": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    "fontWeight": "normal"
  },
  "width": 640,
  "height": 480,
  "padding": 5,
  "autosize": "none",

  "signals": [
    {
      "name": "continent",
      "value": "North America",
      "bind": {
        "input": "select",
        "options": ["North America", "South America", "Europe", "Asia"],
        "name": "Continent: "
      }
    },
    {
      "name": "year",
      "value": 2020,
      "bind": {"input": "range", "min": 2015, "max": 2025, "step": 1, "name": "Year: "}
    },
    {
      "name": "metric",
      "value": "E-Waste Generated (Metric Tons)",
      "bind": {
        "input": "select",
        "options": [
          "Smartphone Sales (Millions)",
          "Laptop Shipments (Millions)",
          "E-Waste Generated (Metric Tons)",
          "Average Consumer Spending on Gadgets ($)"
        ],
        "name": "Size by: "
      }
    },
    {
      "name": "centerLon",
      "update": "continent === 'North America' ? -100 : continent === 'South America' ? -60 : continent === 'Europe' ? 15 : 90"
    },
    {
      "name": "parallels",
      "update": "continent === 'North America' ? [30, 55] : continent === 'South America' ? [-25, 5] : continent === 'Europe' ? [40, 60] : [15, 55]"
    },
    {
      "name": "projScale",
      "update": "continent === 'North America' ? 800 : continent === 'South America' ? 800 : continent === 'Europe' ? 1000 : 600"
    }
  ],

  "projections": [
    {
      "name": "proj",
      "type": "albers",
      "rotate": [{"signal": "-centerLon"}, 0],
      "parallels": {"signal": "parallels"},
      "scale": {"signal": "projScale"},
      "translate": [320, 240]
    }
  ],

  "data": [
    {
      "name": "sphere",
      "values": [{"type": "Sphere"}]
    },
    {
      "name": "graticule",
      "transform": [{"type": "graticule", "step": [15, 15]}]
    },
    {
      "name": "world",
      "url": "https://vega.github.io/editor/data/world-110m.json",
      "format": {"type": "topojson", "feature": "countries"}
    },
    {
      "name": "meta",
      "values": [
        {"Country": "USA", "lon": -98.6, "lat": 39.8, "continent": "North America"},
        {"Country": "Canada", "lon": -96.0, "lat": 58.0, "continent": "North America"},
        {"Country": "Brazil", "lon": -52.0, "lat": -12.0, "continent": "South America"},
        {"Country": "Germany", "lon": 10.4, "lat": 51.2, "continent": "Europe"},
        {"Country": "UK", "lon": -2.5, "lat": 54.0, "continent": "Europe"},
        {"Country": "France", "lon": 2.2, "lat": 46.6, "continent": "Europe"},
        {"Country": "China", "lon": 104.2, "lat": 35.9, "continent": "Asia"},
        {"Country": "India", "lon": 79.0, "lat": 20.6, "continent": "Asia"},
        {"Country": "Japan", "lon": 138.3, "lat": 36.2, "continent": "Asia"},
        {"Country": "South Korea", "lon": 127.8, "lat": 36.5, "continent": "Asia"}
      ]
    },
    {
      "name": "consumption",
      "url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/global_tech_gadget_consumption/Global_Tech_Gadget_Consumption.csv",
      "format": {"type": "csv"},
      "transform": [
        {"type": "filter", "expr": "datum.Year == year"},
        {
          "type": "lookup",
          "from": "meta",
          "key": "Country",
          "fields": ["Country"],
          "values": ["lon", "lat", "continent"],
          "as": ["lon", "lat", "continent"]
        },
        {"type": "filter", "expr": "isValid(datum.lon) && datum.continent == continent"},
        {"type": "formula", "as": "value", "expr": "toNumber(datum[metric])"},
        {"type": "filter", "expr": "isValid(datum.value)"},
        {"type": "geopoint", "projection": "proj", "fields": ["lon", "lat"], "as": ["x", "y"]}
      ]
    }
  ],

  "scales": [
    {
      "name": "size",
      "type": "sqrt",
      "domain": {"data": "consumption", "field": "value"},
      "range": [40, 3200],
      "zero": false
    }
  ],

  "legends": [
    {
      "size": "size",
      "title": "Selected metric",
      "orient": "bottom-left",
      "symbolFillColor": "#10b981",
      "symbolOpacity": 0.7
    }
  ],

  "marks": [
    {
      "type": "shape",
      "from": {"data": "sphere"},
      "encode": {"enter": {"fill": {"value": "#d1fae5"}, "stroke": {"value": "#a7f3d0"}, "strokeWidth": {"value": 1}}},
      "transform": [{"type": "geoshape", "projection": "proj"}]
    },
    {
      "type": "shape",
      "from": {"data": "graticule"},
      "encode": {"enter": {"fill": {"value": null}, "stroke": {"value": "#cbd5e1"}, "strokeWidth": {"value": 0.4}}},
      "transform": [{"type": "geoshape", "projection": "proj"}]
    },
    {
      "type": "shape",
      "from": {"data": "world"},
      "encode": {
        "enter": {
          "fill": {"value": "#e5e7eb"},
          "stroke": {"value": "#ffffff"},
          "strokeWidth": {"value": 0.5}
        }
      },
      "transform": [{"type": "geoshape", "projection": "proj"}]
    },
    {
      "type": "symbol",
      "from": {"data": "consumption"},
      "encode": {
        "enter": {
          "x": {"field": "x"},
          "y": {"field": "y"}
        },
        "update": {
          "size": {"scale": "size", "field": "value"},
          "fill": {"value": "#10b981"},
          "fillOpacity": {"value": 0.65},
          "stroke": {"value": "#ffffff"},
          "strokeWidth": {"value": 0.8},
          "tooltip": {"signal": "datum.Country + ' (' + datum.Year + ') — ' + metric + ': ' + format(datum.value, ',.1f')"}
        },
        "hover": {"fillOpacity": {"value": 0.9}}
      }
    }
  ]
};

vegaEmbed('#symbolMap2', smallerSymbolMap2Spec).then(result => {
  console.log(result);
}).catch(console.error);
