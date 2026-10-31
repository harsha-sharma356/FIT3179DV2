// Regional proportional symbol map (Albers conic projection).
// Shared data source: tech_countries.csv (same as the main #gadget map).
// Controls: region view + "size by" metric + year.
const smallerSymbolMap2Spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "Regional proportional symbol map of tech & connectivity (Albers conic).",
  "title": {
    "text": "Regional Tech & Connectivity — Albers",
    "font": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    "fontWeight": "normal"
  },
  "width": 560,
  "height": 420,
  "padding": 5,
  "autosize": "none",

  "signals": [
    {
      "name": "view",
      "value": "World",
      "bind": {"input": "select", "options": [
        "World", "East Asia & Pacific", "South Asia", "Europe & Central Asia",
        "Middle East & North Africa", "Sub-Saharan Africa",
        "Latin America & Caribbean", "North America"
      ], "name": "Region: "}
    },
    {
      "name": "metric",
      "value": "internet_pct",
      "bind": {"input": "select", "options": [
        "mobile_millions", "mobile_per100", "internet_millions", "internet_pct",
        "fiveg_pct", "ewaste_kt", "ewaste_kg_pc", "smartphone_imports_usd_m", "population_millions"
      ], "labels": [
        "Mobile subscriptions (millions)", "Mobile per 100 people", "Internet users (millions)",
        "Internet users (%)", "5G coverage (%)", "E-waste (kt)", "E-waste per capita (kg)",
        "Smartphone imports (US$m)", "Population (millions)"
      ], "name": "Size by: "}
    },
    {
      "name": "year",
      "value": 2022,
      "bind": {"input": "range", "min": 2015, "max": 2025, "step": 1, "name": "Year: "}
    },
    {
      "name": "centerLon",
      "update": "view === 'East Asia & Pacific' ? 120 : view === 'South Asia' ? 78 : view === 'Europe & Central Asia' ? 40 : view === 'Middle East & North Africa' ? 40 : view === 'Sub-Saharan Africa' ? 20 : view === 'Latin America & Caribbean' ? -70 : view === 'North America' ? -100 : 10"
    },
    {
      "name": "parallels",
      "update": "view === 'North America' ? [30, 55] : view === 'Latin America & Caribbean' ? [-25, 5] : view === 'Europe & Central Asia' ? [40, 60] : view === 'Sub-Saharan Africa' ? [-20, 10] : view === 'Middle East & North Africa' ? [15, 40] : view === 'East Asia & Pacific' ? [10, 40] : view === 'South Asia' ? [5, 35] : [10, 45]"
    },
    {
      "name": "projScale",
      "update": "view === 'World' ? 115 : view === 'South Asia' ? 520 : view === 'Sub-Saharan Africa' ? 450 : view === 'North America' ? 450 : view === 'Middle East & North Africa' ? 340 : view === 'Europe & Central Asia' ? 300 : view === 'Latin America & Caribbean' ? 300 : 230"
    }
  ],

  "projections": [{
    "name": "proj",
    "type": "albers",
    "rotate": [{"signal": "-centerLon"}, 0],
    "parallels": {"signal": "parallels"},
    "scale": {"signal": "projScale"},
    "translate": [280, 210]
  }],

  "data": [
    {"name": "sphere", "values": [{"type": "Sphere"}]},
    {"name": "graticule", "transform": [{"type": "graticule", "step": [15, 15]}]},
    {"name": "world", "url": "https://vega.github.io/editor/data/world-110m.json", "format": {"type": "topojson", "feature": "countries"}},
    {
      "name": "points",
      "url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/tech_countries.csv",
      "format": {"type": "csv", "parse": "auto"},
      "transform": [
        {"type": "filter", "expr": "datum.year == year"},
        {"type": "filter", "expr": "view === 'World' || datum.region === view"},
        {"type": "formula", "as": "value", "expr": "toNumber(datum[metric])"},
        {"type": "filter", "expr": "isValid(datum.value) && isValid(datum.lon) && isValid(datum.lat)"},
        {"type": "geopoint", "projection": "proj", "fields": ["lon", "lat"], "as": ["x", "y"]}
      ]
    }
  ],

  "scales": [
    {"name": "size", "type": "sqrt", "zero": true,
     "domain": {"data": "points", "field": "value"},
     "range": [0, 2600]}
  ],

  "legends": [
    {"size": "size", "title": {"signal": "metric"}, "orient": "bottom-left",
     "symbolFillColor": "#10b981", "symbolOpacity": 0.7, "format": "~s"}
  ],

  "marks": [
    {"type": "shape", "from": {"data": "sphere"},
     "encode": {"enter": {"fill": {"value": "#d1fae5"}, "stroke": {"value": "#a7f3d0"}, "strokeWidth": {"value": 1}}},
     "transform": [{"type": "geoshape", "projection": "proj"}]},
    {"type": "shape", "from": {"data": "graticule"},
     "encode": {"enter": {"fill": {"value": null}, "stroke": {"value": "#cbd5e1"}, "strokeWidth": {"value": 0.4}}},
     "transform": [{"type": "geoshape", "projection": "proj"}]},
    {"type": "shape", "from": {"data": "world"},
     "encode": {"enter": {"fill": {"value": "#e5e7eb"}, "stroke": {"value": "#ffffff"}, "strokeWidth": {"value": 0.5}}},
     "transform": [{"type": "geoshape", "projection": "proj"}]},
    {
      "type": "symbol", "from": {"data": "points"},
      "encode": {
        "enter": {"x": {"field": "x"}, "y": {"field": "y"}},
        "update": {
          "size": {"scale": "size", "field": "value"},
          "fill": {"value": "#10b981"},
          "fillOpacity": {"value": 0.7},
          "stroke": {"value": "#ffffff"},
          "strokeWidth": {"value": 0.8},
          "tooltip": {"signal": "datum.country + ' (' + datum.year + ') — ' + metric + ': ' + format(datum.value, ',.1f')"}
        },
        "hover": {"fillOpacity": {"value": 1}}
      }
    }
  ]
};

vegaEmbed('#symbolMap2', smallerSymbolMap2Spec).then(result => {
  console.log(result);
}).catch(console.error);