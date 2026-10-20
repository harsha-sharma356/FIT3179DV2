const spec5 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "description": "Stacked area chart showing average daily power draw by appliance.",
  "width": 800,
  "height": 400,
  "data": {
    "url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/homeE/HomeC.csv",
    "format": { "type": "csv", "parse": { "time": "number" } }
  },
  "transform": [
    { "filter": "isValid(datum.time)" },
    { "calculate": "toDate(datum.time * 1000)", "as": "datetime" },
    { "timeUnit": "yearmonthdate", "field": "datetime", "as": "date" },
    {
      "aggregate": [
        { "op": "mean", "field": "Dishwasher \\[kW\\]",   "as": "Dishwasher" },
        { "op": "mean", "field": "Furnace 1 \\[kW\\]",   "as": "Furnace 1" },
        { "op": "mean", "field": "Furnace 2 \\[kW\\]",   "as": "Furnace 2" },
        { "op": "mean", "field": "Home office \\[kW\\]", "as": "Home office" },
        { "op": "mean", "field": "Fridge \\[kW\\]",      "as": "Fridge" },
        { "op": "mean", "field": "Wine cellar \\[kW\\]", "as": "Wine cellar" },
        { "op": "mean", "field": "Garage door \\[kW\\]", "as": "Garage door" },
        { "op": "mean", "field": "Kitchen 12 \\[kW\\]",   "as": "Kitchen 12" },
        { "op": "mean", "field": "Barn \\[kW\\]",        "as": "Barn" },
        { "op": "mean", "field": "Microwave \\[kW\\]",   "as": "Microwave" },
        { "op": "mean", "field": "Living room \\[kW\\]",  "as": "Living room" }
      ],
      "groupby": ["date"]
    },
    {
      "fold": [
        "Dishwasher", "Furnace 1", "Furnace 2", "Home office", "Fridge",
        "Wine cellar", "Garage door", "Kitchen 12", "Barn", "Microwave", "Living room"
      ],
      "as": ["Appliance", "Power_kW"]
    }
  ],
  "mark": { "type": "area", "interpolate": "monotone" },
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal",
      "title": "Date"
    },
    "y": {
      "field": "Power_kW",
      "type": "quantitative",
      "title": "Average Power Consumption (kW)"
    },
    "color": {
      "field": "Appliance",
      "type": "nominal",
      "scale": { "scheme": "tableau20" },
      "title": "Appliance"
    },
    "tooltip": [
      { "field": "date", "type": "temporal", "format": "%d %b %Y", "title": "Date" },
      { "field": "Appliance", "type": "nominal" },
      { "field": "Power_kW", "type": "quantitative", "format": ".3f", "title": "Avg power (kW)" }
    ]
  }
}

    // Embed the visualization into the div with ID 'vis'
vegaEmbed('#vis', spec5).then(result => {
  console.log(result);
}).catch(console.error);