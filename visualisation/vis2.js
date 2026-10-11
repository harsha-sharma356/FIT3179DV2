const spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "Small multiples line chart showing global tech gadget consumption metrics across countries and years.",
  "width": 250,
  "height": 150,
  "data": {
    "url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/global_tech_gadget_consumption/Global_Tech_Gadget_Consumption.csv"
  },
  "facet": {
    "field": "Country",
    "type": "nominal",
    "columns": 3
  },
  "spec": {
    "mark": {
      "type": "line",
      "point": true,
      "tooltip": true
    },
    "encoding": {
      "x": {
        "field": "Year",
        "type": "ordinal",
        "title": "Year"
      },
      "y": {
        "field": "Smartphone Sales (Millions)",
        "type": "quantitative",
        "title": "Smartphone Sales (Millions)"
      },
      "color": {
        "field": "Country",
        "type": "nominal",
        "legend": null
      }
    }
    "filter"
  },
  "config": {
    "axis": {
      "labelAngle": 0
    }
  }
}
    // Embed the visualization into the div with ID 'vis'
vegaEmbed('#vis', spec).then(result => {
  console.log(result);
}).catch(console.error);