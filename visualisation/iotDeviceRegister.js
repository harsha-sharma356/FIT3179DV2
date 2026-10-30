const specIot = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Registered IoT devices in Casey by suburb and device type",
  width: 500,
  height: 380,
  data: { url: "data/IOT DEVICE REGISTER KAGGLE/iot-device-register.csv" },
  transform: [
    { filter: "isValid(datum.location_suburb) && datum.location_suburb != ''" },
    {
      calculate: "isValid(datum.device_type) && datum.device_type != '' ? datum.device_type : 'Unspecified'",
      as: "type_clean"
    }
  ],
  mark: { type: "bar" },
  encoding: {
    x: { field: "location_suburb", type: "nominal", title: "Suburb" },
    y: { aggregate: "count", type: "quantitative", title: "Devices" },
    color: { field: "type_clean", type: "nominal", title: "Device type", scale: { scheme: "tableau10" } },
    tooltip: [
      { field: "location_suburb", title: "Suburb" },
      { field: "type_clean", title: "Type" },
      { aggregate: "count", title: "Devices" }
    ]
  }
};

vegaEmbed('#vis-iot', specIot).catch(console.error);