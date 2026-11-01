const specIot = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Registered IoT devices in Casey as a share of each device type (donut)",
  title: {
    text: "Registered IoT Devices by Type",
    font: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "normal"
  },
  width: 360,
  height: 320,
  data: { url: "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/IOT%20DEVICE%20REGISTER%20KAGGLE/iot-device-register.csv" },
  transform: [
    { filter: "isValid(datum.location_suburb) && datum.location_suburb != ''" },
    {
      calculate: "isValid(datum.device_type) && datum.device_type != '' ? datum.device_type : 'Unspecified'",
      as: "type_clean"
    },
    {
      joinaggregate: [{ op: "count", as: "total" }]
    },
    { calculate: "1 / datum.total", as: "_share" }
  ],
  mark: { type: "arc", innerRadius: 70, outerRadius: 130, padAngle: 0.5, cornerRadius: 4 },
  encoding: {
    theta: { aggregate: "count", type: "quantitative", title: "Devices" },
    color: {
      field: "type_clean",
      type: "nominal",
      title: "Device type",
      scale: { scheme: "tableau10" }
    },
    order: { field: "type_clean", type: "nominal", sort: "descending" },
    tooltip: [
      { field: "type_clean", title: "Device type" },
      { aggregate: "count", title: "Devices", format: "," },
      { aggregate: "sum", field: "_share", title: "Share", format: ".1%" }
    ]
  }
};

vegaEmbed('#vis-iot', specIot).catch(console.error);