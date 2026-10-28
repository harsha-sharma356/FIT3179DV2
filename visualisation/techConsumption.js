const spec2 = 
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "description": "Proportional symbol map of tech consumption by country, with year and metric controls.",
  "title": {
    "text": "Global tech gadget consumption",
    "subtitle": "Countries with data are shaded darker. Circle area shows the selected metric."
  },
  "width": 800,
  "height": 450,
  "projection": { "type": "equalEarth" },
  "params": [
    {
      "name": "selected_year",
      "value": 2020,
      "bind": { "input": "range", "min": 2015, "max": 2025, "step": 1, "name": "Year: " }
    },
    {
      "name": "metric",
      "value": "Smartphone Sales (Millions)",
      "bind": {
        "input": "select",
        "name": "Size by: ",
        "options": [
          "Smartphone Sales (Millions)",
          "Laptop Shipments (Millions)",
          "E-Waste Generated (Metric Tons)",
          "Average Consumer Spending on Gadgets ($)"
        ]
      }
    }
  ],
  "layer": [
    {
      "data": {
        "url": "https://vega.github.io/editor/data/world-110m.json",
        "format": { "type": "topojson", "feature": "countries" }
      },
      "mark": { "type": "geoshape", "fill": "#e5e5e5", "stroke": "white", "strokeWidth": 0.4 }
    },
    {
      "data": {
        "url": "https://vega.github.io/editor/data/world-110m.json",
        "format": { "type": "topojson", "feature": "countries" }
      },
      "transform": [
        { "filter": "indexof([840, 156, 356, 276, 826, 250, 392, 410, 76, 124], datum.id) >= 0" }
      ],
      "mark": { "type": "geoshape", "fill": "#bfc9d1", "stroke": "white", "strokeWidth": 0.4 }
    },
    {
      "data": {
        "url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/global_tech_gadget_consumption/Global_Tech_Gadget_Consumption.csv"
      },
      "transform": [
        { "filter": "datum.Year == selected_year" },
        {
          "lookup": "Country",
          "from": {
            "data": {
              "values": [
                { "Country": "USA", "lon": -98.6, "lat": 39.8 },
                { "Country": "China", "lon": 104.2, "lat": 35.9 },
                { "Country": "India", "lon": 79.0, "lat": 20.6 },
                { "Country": "Germany", "lon": 10.4, "lat": 51.2 },
                { "Country": "UK", "lon": -2.5, "lat": 54.0 },
                { "Country": "France", "lon": 2.2, "lat": 46.6 },
                { "Country": "Japan", "lon": 138.3, "lat": 36.2 },
                { "Country": "South Korea", "lon": 127.8, "lat": 36.5 },
                { "Country": "Brazil", "lon": -52.0, "lat": -12.0 },
                { "Country": "Canada", "lon": -96.0, "lat": 58.0 }
              ]
            },
            "key": "Country",
            "fields": ["lon", "lat"]
          }
        },
        { "calculate": "toNumber(datum[metric])", "as": "value" },
        { "calculate": "metric", "as": "metric_name" },
        { "filter": "isValid(datum.lon) && isValid(datum.value)" }
      ],
      "mark": {
        "type": "circle",
        "fill": "#2b6cb0",
        "opacity": 0.65,
        "stroke": "white",
        "strokeWidth": 0.8
      },
      "encoding": {
        "longitude": { "field": "lon", "type": "quantitative" },
        "latitude": { "field": "lat", "type": "quantitative" },
        "size": {
          "field": "value",
          "type": "quantitative",
          "scale": {
            "domainMin": 0,
            "domainMax": {
              "expr": "metric == 'Smartphone Sales (Millions)' ? 500 : metric == 'Laptop Shipments (Millions)' ? 150 : metric == 'E-Waste Generated (Metric Tons)' ? 2000 : 3000"
            },
            "range": [20, 4500]
          },
          "legend": {
            "title": "Selected metric",
            "orient": "bottom-left",
            "symbolFillColor": "#2b6cb0",
            "symbolOpacity": 0.65
          }
        },
        "order": { "field": "value", "type": "quantitative", "sort": "descending" },
        "tooltip": [
          { "field": "Country", "title": "Country" },
          { "field": "Year", "title": "Year" },
          { "field": "metric_name", "title": "Metric" },
          { "field": "value", "title": "Value", "format": ",.1f" }
        ]
      }
    }
  ],
  "config": { "view": { "stroke": null } }
}


    // Embed the visualization into the div with ID 'vis'
vegaEmbed('#gadget', spec2).then(result => {
  console.log(result);
}).catch(console.error);