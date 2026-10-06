const spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": "IoT Device Register",
  "width": 800,
  "height": 400,
  "projection": {"type": "mercator"},
  "data": {
    "url": "./data/IOT DEVICE REGISTER KAGGLE/iot-device-register.geojson",
    "format": {
      "type": "json",
      "property": "features"
    }
  },
  "transform": [
    {
      "lookup": "location_suburb",
      "from": {
        "data": {
          "url": "/data/LOCALITY_POINT (1).json",
          "format": {
            "type": "topojson",
            "feature": "LOCALITY_POINT"
          }
        },
        "key": "properties.PLACELABEL",
        "fields": ["geometry"]
      }
    },
    {
      "calculate": "datum.geometry && datum.geometry.coordinates ? datum.geometry.coordinates[0] : null",
      "as": "longitude"
    },
    {
      "calculate": "datum.geometry && datum.geometry.coordinates ? datum.geometry.coordinates[1] : null",
      "as": "latitude"
    },
    {
      "filter": "datum.longitude !== null && datum.latitude !== null"
    }
  ],
  "mark": "circle",
  "encoding": {
    "longitude": {"field": "longitude", "type": "quantitative"},
    "latitude": {"field": "latitude", "type": "quantitative"},
    "color": {
      "field": "category",
      "type": "nominal",
      "title": "Category"
    },
    "tooltip": [
      {"field": "location_suburb", "type": "nominal", "title": "Suburb"},
      {"field": "category", "type": "nominal", "title": "Category"}
    ]
  }
}


console.log(JSON.stringify(spec))
    // Embed the visualization into the div with ID 'vis'
vegaEmbed('#vis', spec).then(result => {
  console.log(result);
}).catch(console.error);