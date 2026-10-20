const spec4 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": 650,
  "height": 500,
  "data": {
    "url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/upgradeE/UPGRADE-E_V2.csv",
    "format": {
      "type": "csv"
    }
  },
  "transform": [
    {
      "calculate": "toNumber(datum.willing_electric_vehicle)",
      "as": "ev_score"
    },
    {
      "filter": "isValid(datum.ev_score) && datum.ev_score != 999 && datum.ev_score < 100"
    }
  ],
  "mark": "rect",
  "encoding": {
    "y": {
      "field": "assigned_state",
      "type": "nominal",
      "title": "State",
      "sort": "ascending"
    },
    "x": {
      "field": "hometype",
      "type": "nominal",
      "title": "Home Type",
      "axis": {
        "labelAngle": -45
      }
    },
    "color": {
      "field": "ev_score",
      "type": "quantitative",
      "aggregate": "mean",
      "scale": {
        "scheme": "blues"
      },
      "title": "Avg Willingness"
    },
    "tooltip": [
      {
        "field": "assigned_state",
        "type": "nominal",
        "title": "State"
      },
      {
        "field": "hometype",
        "type": "nominal",
        "title": "Home Type"
      },
      {
        "field": "ev_score",
        "type": "quantitative",
        "aggregate": "mean",
        "format": ".2f",
        "title": "Avg EV Willingness"
      }
    ]
  }
}
    // Embed the visualization into the div with ID 'vis'
vegaEmbed('#vis11', spec4).then(result => {
  console.log(result);
}).catch(console.error);