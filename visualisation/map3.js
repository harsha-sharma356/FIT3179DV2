const spec3 = 
  {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "Global choropleth map showing tech consumption metrics with a year slider.",
  "width": 600,
  "height": 450,
  "data": {
    "url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/global_tech_gadget_consumption/Global_Tech_Gadget_Consumption.csv"
  },
  "projection": {
    "type": "equalEarth"
  },
  "layer": [
    {
      "data": {
        "url": "https://raw.githubusercontent.com/vega/vega-datasets/master/data/world-110m.json",
        "format": {
          "type": "topojson",
          "feature": "countries"
        }
      },
      "mark": {
        "type": "geoshape",
        "stroke": "white",
        "strokeWidth": 0.5,
        "fill": "#ddd"
      }
    },
  ]
}


console.log(JSON.stringify(spec3))
    // Embed the visualization into the div with ID 'vis'
vegaEmbed('#vis3', spec3).then(result => {
  console.log(result);
}).catch(console.error);