const spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": "Chicken nugger",
  "width": 500,
  "height": 400,
  "projection": {"type": "mercarter"},
  "data": {
    "url": "./IOT DEVICE REGISTER KAGGLE/iot-device-register.geojson",
    "format": {"type": "topojson", "feature": "ne_110m_admin_0_countries"}
  },
  "mark": {"type": "geoshape"},
  "encoding":{
    
  }
}

    // Embed the visualization into the div with ID 'vis'
vegaEmbed('#vis', spec).then(result => {
  console.log(result);
}).catch(console.error);