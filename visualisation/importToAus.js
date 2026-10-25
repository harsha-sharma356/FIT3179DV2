const spec1 = 
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": {
    "text": "Global Tech & Appliance Shipping Flows to Australia",
    "subtitle": "Origin-to-destination trade volumes (USD Billions) terminating in Australia (2015 vs. 2025)",
    "fontSize": 16,
    "anchor": "start"
  },
  "width": 750,
  "height": 420,
  "projection": {
    "type": "equalEarth"
  },
  "params": [
    {
      "name": "selected_year",
      "value": "2025",
      "bind": {
        "input": "select",
        "options": ["2015", "2025"],
        "labels": ["2015 Historical Baseline", "2025 Current Imports"],
        "name": "Select Trade Year: "
      }
    }
  ],
  "layer": [
    {
      "data": {
        "url": "https://vega.github.io/editor/data/world-110m.json",
        "format": {
          "type": "topojson",
          "feature": "countries"
        }
      },
      "mark": {
        "type": "geoshape",
        "fill": "#f1f5f9",
        "stroke": "#cbd5e1",
        "strokeWidth": 0.5
      }
    },
    {
      "data": {
        "values": [
          {"year": "2015", "origin": "China", "o_lat": 35.8617, "o_lon": 104.1954, "dest": "Australia", "d_lat": -25.2744, "d_lon": 133.7751, "volume_billion": 4.85, "category": "Smartphones & Routers (8517)"},
          {"year": "2025", "origin": "China", "o_lat": 35.8617, "o_lon": 104.1954, "dest": "Australia", "d_lat": -25.2744, "d_lon": 133.7751, "volume_billion": 6.32, "category": "Smartphones & Routers (8517)"},
          {"year": "2015", "origin": "Vietnam", "o_lat": 14.0583, "o_lon": 108.2772, "dest": "Australia", "d_lat": -25.2744, "d_lon": 133.7751, "volume_billion": 0.95, "category": "Smartphones & Routers (8517)"},
          {"year": "2025", "origin": "Vietnam", "o_lat": 14.0583, "o_lon": 108.2772, "dest": "Australia", "d_lat": -25.2744, "d_lon": 133.7751, "volume_billion": 1.48, "category": "Smartphones & Routers (8517)"},
          {"year": "2015", "origin": "South Korea", "o_lat": 35.9078, "o_lon": 127.7669, "dest": "Australia", "d_lat": -25.2744, "d_lon": 133.7751, "volume_billion": 0.72, "category": "Smart TVs & Displays (8528)"},
          {"year": "2025", "origin": "South Korea", "o_lat": 35.9078, "o_lon": 127.7669, "dest": "Australia", "d_lat": -25.2744, "d_lon": 133.7751, "volume_billion": 0.81, "category": "Smart TVs & Displays (8528)"},
          {"year": "2015", "origin": "Germany", "o_lat": 51.1657, "o_lon": 10.4515, "dest": "Australia", "d_lat": -25.2744, "d_lon": 133.7751, "volume_billion": 0.11, "category": "Domestic Smart Appliances (8509)"},
          {"year": "2025", "origin": "Germany", "o_lat": 51.1657, "o_lon": 10.4515, "dest": "Australia", "d_lat": -25.2744, "d_lon": 133.7751, "volume_billion": 0.18, "category": "Domestic Smart Appliances (8509)"},
          {"year": "2015", "origin": "United States", "o_lat": 37.0902, "o_lon": -95.7129, "dest": "Australia", "d_lat": -25.2744, "d_lon": 133.7751, "volume_billion": 0.38, "category": "Smartphones & Routers (8517)"},
          {"year": "2025", "origin": "United States", "o_lat": 37.0902, "o_lon": -95.7129, "dest": "Australia", "d_lat": -25.2744, "d_lon": 133.7751, "volume_billion": 0.45, "category": "Smartphones & Routers (8517)"}
        ]
      },
      "transform": [
        { "filter": "datum.year == selected_year" }
      ],
      "layer": [
        {
          "mark": {
            "type": "rule",
            "opacity": 0.75
          },
          "encoding": {
            "longitude": { "field": "o_lon", "type": "quantitative" },
            "latitude": { "field": "o_lat", "type": "quantitative" },
            "longitude2": { "field": "d_lon" },
            "latitude2": { "field": "d_lat" },
            "strokeWidth": {
              "field": "volume_billion",
              "type": "quantitative",
              "scale": { "range": [2, 10] },
              "title": "Import Volume ($B USD)"
            },
            "color": {
              "field": "origin",
              "type": "nominal",
              "scale": { "scheme": "category10" },
              "title": "Origin Country"
            },
            "tooltip": [
              { "field": "origin", "type": "nominal", "title": "Exporting Hub" },
              { "field": "dest", "type": "nominal", "title": "Destination" },
              { "field": "category", "type": "nominal", "title": "Commodity" },
              { "field": "year", "type": "nominal", "title": "Trade Year" },
              { "field": "volume_billion", "type": "quantitative", "title": "Volume ($B USD)", "format": "$.2f" }
            ]
          }
        },
        {
          "mark": {
            "type": "circle",
            "size": 70,
            "color": "#1e293b"
          },
          "encoding": {
            "longitude": { "field": "o_lon", "type": "quantitative" },
            "latitude": { "field": "o_lat", "type": "quantitative" },
            "tooltip": [{ "field": "origin", "type": "nominal", "title": "Export Origin" }]
          }
        },
        {
          "mark": {
            "type": "circle",
            "size": 120,
            "color": "#2563eb",
            "stroke": "white",
            "strokeWidth": 1.5
          },
          "encoding": {
            "longitude": { "field": "d_lon", "type": "quantitative" },
            "latitude": { "field": "d_lat", "type": "quantitative" },
            "tooltip": [{ "field": "dest", "type": "nominal", "title": "Destination Hub (Australia)" }]
          }
        }
      ]
    }
  ]
}


console.log(JSON.stringify(spec1))
    // Embed the visualization into the div with ID 'vis'
vegaEmbed('#vis1', spec1).then(result => {
  console.log(result);
}).catch(console.error);