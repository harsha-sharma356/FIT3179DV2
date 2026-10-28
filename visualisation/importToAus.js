const spec1 = 
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "title": {
    "text": "Global Tech & Appliance Shipping Flows to Australia",
    "subtitle": "Top 10 source countries by import value (USD billions), HS 8509 + 8517 + 8528",
    "fontSize": 16,
    "anchor": "start"
  },
  "width": 750,
  "height": 420,
  "projection": { "type": "equalEarth" },
  "params": [
    {
      "name": "selected_year",
      "value": 2025,
      "bind": {
        "input": "select",
        "options": [2015, 2025],
        "labels": ["2015 Historical Baseline", "2025 Current Imports"],
        "name": "Select Trade Year: "
      }
    }
  ],
  "layer": [
    {
      "data": {
        "url": "https://vega.github.io/editor/data/world-110m.json",
        "format": { "type": "topojson", "feature": "countries" }
      },
      "mark": {
        "type": "geoshape",
        "fill": "#6b6b6c",
        "stroke": "#cbd5e1",
        "strokeWidth": 0.5
      }
    },
    {
      "data": {
        "url": "../data/TradeData_10_25_2026_18_12_12.csv",
        "format": { "type": "csv" }
      },
      "transform": [
        {
          "filter": "datum.refYear == selected_year"
        },
        {
          "aggregate": [{ "op": "sum", "field": "primaryValue", "as": "total_usd" }],
          "groupby": ["partnerISO", "partnerDesc", "refYear"]
        },
        { "calculate": "datum.total_usd / 1e9", "as": "volume_billion" },
        {
          "lookup": "partnerISO",
          "from": {
            "data": {
              "values": [
                { "iso": "CHN", "lon": 104.2, "lat": 35.9 },
                { "iso": "USA", "lon": -98.6, "lat": 39.8 },
                { "iso": "JPN", "lon": 138.3, "lat": 36.2 },
                { "iso": "KOR", "lon": 127.8, "lat": 36.5 },
                { "iso": "DEU", "lon": 10.4, "lat": 51.2 },
                { "iso": "THA", "lon": 100.9, "lat": 15.9 },
                { "iso": "MYS", "lon": 102.0, "lat": 4.2 },
                { "iso": "VNM", "lon": 108.3, "lat": 14.1 },
                { "iso": "SGP", "lon": 103.8, "lat": 1.35 },
                { "iso": "IDN", "lon": 113.9, "lat": -0.8 },
                { "iso": "IND", "lon": 78.9, "lat": 20.6 },
                { "iso": "HKG", "lon": 114.2, "lat": 22.3 },
                { "iso": "S19", "lon": 121.0, "lat": 23.7 },
                { "iso": "NZL", "lon": 174.9, "lat": -40.9 },
                { "iso": "GBR", "lon": -3.4, "lat": 55.4 },
                { "iso": "FRA", "lon": 2.2, "lat": 46.2 },
                { "iso": "ITA", "lon": 12.6, "lat": 41.9 },
                { "iso": "NLD", "lon": 5.3, "lat": 52.1 },
                { "iso": "ESP", "lon": -3.7, "lat": 40.5 },
                { "iso": "CHE", "lon": 8.2, "lat": 46.8 },
                { "iso": "SWE", "lon": 18.6, "lat": 60.1 },
                { "iso": "IRL", "lon": -8.2, "lat": 53.4 },
                { "iso": "CZE", "lon": 15.5, "lat": 49.8 },
                { "iso": "POL", "lon": 19.1, "lat": 52.0 },
                { "iso": "HUN", "lon": 19.5, "lat": 47.2 },
                { "iso": "TUR", "lon": 35.2, "lat": 39.0 },
                { "iso": "ISR", "lon": 34.9, "lat": 31.0 },
                { "iso": "ARE", "lon": 53.8, "lat": 23.4 },
                { "iso": "SAU", "lon": 45.1, "lat": 23.9 },
                { "iso": "PHL", "lon": 121.8, "lat": 12.9 },
                { "iso": "MEX", "lon": -102.5, "lat": 23.6 },
                { "iso": "CAN", "lon": -106.3, "lat": 56.1 },
                { "iso": "BRA", "lon": -51.9, "lat": -14.2 },
                { "iso": "ZAF", "lon": 22.9, "lat": -30.6 }
              ]
            },
            "key": "iso",
            "fields": ["lon", "lat"]
          },
          "as": ["o_lon", "o_lat"]
        },
        { "filter": "isValid(datum.o_lon) && isValid(datum.o_lat)" },
        {
          "window": [{ "op": "rank", "as": "rnk" }],
          "groupby": ["refYear"],
          "sort": [{ "field": "volume_billion", "order": "descending" }]
        },
        { "filter": "datum.rnk <= 10" },
        { "calculate": "151.2", "as": "d_lon" },
        { "calculate": "-33.9", "as": "d_lat" },
        { "calculate": "'Australia (Sydney gateway)'", "as": "dest" },
        { "calculate": "'HS 8509 + 8517 + 8528'", "as": "category" }
      ],
      "layer": [
        {
          "mark": { "type": "rule", "opacity": 0.75 },
          "encoding": {
            "longitude": { "field": "o_lon", "type": "quantitative" },
            "latitude": { "field": "o_lat", "type": "quantitative" },
            "longitude2": { "field": "d_lon" },
            "latitude2": { "field": "d_lat" },
            "strokeWidth": {
              "field": "volume_billion",
              "type": "quantitative",
              "scale": { "range": [2, 10] },
              "legend": { "format": "$.1f" },
              "title": "Import Volume ($B USD)"
            },
            "color": {
              "field": "partnerDesc",
              "type": "nominal",
              "scale": { "scheme": "category10" },
              "title": "Origin Country"
            },
            "tooltip": [
              { "field": "partnerDesc", "type": "nominal", "title": "Exporting Hub" },
              { "field": "dest", "type": "nominal", "title": "Destination" },
              { "field": "category", "type": "nominal", "title": "Commodity" },
              { "field": "refYear", "type": "nominal", "title": "Trade Year" },
              { "field": "volume_billion", "type": "quantitative", "title": "Volume (USD B)", "format": "$.2f" }
            ]
          }
        },
        {
          "mark": { "type": "circle", "size": 70, "color": "#1e293b" },
          "encoding": {
            "longitude": { "field": "o_lon", "type": "quantitative" },
            "latitude": { "field": "o_lat", "type": "quantitative" },
            "tooltip": [{ "field": "partnerDesc", "type": "nominal", "title": "Export Origin" }]
          }
        },
        {
          "mark": { "type": "circle", "size": 120, "color": "#2563eb", "stroke": "white", "strokeWidth": 1.5 },
          "encoding": {
            "longitude": { "field": "d_lon", "type": "quantitative" },
            "latitude": { "field": "d_lat", "type": "quantitative" },
            "tooltip": [{ "field": "dest", "type": "nominal", "title": "Destination Hub" }]
          }
        }
      ]
    }
  ]
}

console.log(JSON.stringify(spec1))
    // Embed the visualization into the div with ID 'vis'
vegaEmbed('#importAus', spec1).then(result => {
  console.log(result);
}).catch(console.error);