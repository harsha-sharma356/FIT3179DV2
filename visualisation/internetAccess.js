const spec4 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 700,
  "height": 300,
  "projection": { "type": "equalEarth" },
  "params": [
    {
      "name": "selected_year",
      "value": 2015,
      "bind": {
        "input": "range",
        "min": 2000,
        "max": 2024,
        "step": 1,
        "name": "Select Year: "
      }
    }
  ],
  "resolve": { "scale": { "color": "independent" } },
  "layer": [
    {
      "data": {
        "url": "https://vega.github.io/editor/data/world-110m.json",
        "format": { "type": "topojson", "feature": "countries" }
      },
      "transform": [
        { "calculate": "'No data'", "as": "status" }
      ],
      "mark": { "type": "geoshape", "stroke": "white", "strokeWidth": 0.3 },
      "encoding": {
        "color": {
          "field": "status",
          "type": "nominal",
          "scale": { "domain": ["No data"], "range": ["#e5e5e5"] },
          "legend": {
            "title": null,
            "orient": "bottom",
            "direction": "horizontal",
            "symbolType": "square"
          }
        }
      }
    },
    {
      "data": {
        "url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/internetAccess/internet_access_households_cleaned.csv"
      },
      "transform": [
        { "filter": "datum.year == selected_year" },
        {
          "lookup": "country_code",
          "from": {
            "data": {
              "url": "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/refs/heads/master/all/all.csv",
              "format": { "type": "csv" }
            },
            "key": "alpha-3",
            "fields": ["country-code"]
          },
          "as": "raw_numeric_id"
        },
        { "calculate": "toNumber(datum.raw_numeric_id)", "as": "numeric_id" },
        {
          "lookup": "numeric_id",
          "from": {
            "data": {
              "url": "https://vega.github.io/editor/data/world-110m.json",
              "format": { "type": "topojson", "feature": "countries" }
            },
            "key": "id"
          },
          "as": "geo"
        },
        { "filter": "isValid(datum.geo)" }
      ],
      "mark": { "type": "geoshape", "stroke": "white", "strokeWidth": 0.3 },
      "encoding": {
        "shape": { "field": "geo", "type": "geojson" },
        "color": {
          "field": "access_category",
          "type": "ordinal",
          "scale": {
            "domain": ["Low (<25%)", "Medium (25-60%)", "High (>60%)"],
            "range": ["#c6dbef", "#6baed6", "#08519c"]
          },
          "legend": {
            "title": "Households with internet",
            "orient": "bottom",
            "direction": "horizontal",
            "symbolType": "square"
          }
        },
        "tooltip": [
          { "field": "country_name", "title": "Country" },
          { "field": "year", "title": "Year" },
          { "field": "internet_access_pct", "title": "Internet access (%)", "format": ".1f" }
        ]
      }
    }
  ]
}
vegaEmbed('#accessInternet', spec4).then(result => {
  console.log(result);
}).catch(console.error);