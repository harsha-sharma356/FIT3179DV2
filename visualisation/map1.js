const spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": "Chicken nugger",
  "width": 800,
  "height": 400,
  "projection": {"type": "mercator"},
  "data": {
    "url": "./IOT DEVICE REGISTER KAGGLE/iot-device-register.geojson",
    "format": {"type": "topojson"}
  },
  "mark": {"type": "geoshape"},
}

    // Embed the visualization into the div with ID 'vis'
vegaEmbed('#vis1', spec).then(result => {
  console.log(result);
}).catch(console.error);