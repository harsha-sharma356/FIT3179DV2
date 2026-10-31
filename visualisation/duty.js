const specDuty = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Share of time each smart-home appliance is on",
  title: {
    text: "Appliance Duty Cycle",
    font: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "normal"
  },
  width: 500,
  height: 320,
  data: { url: "data/smart_home_dataset/preprocessed_dataset.csv" },
  transform: [
    {
      fold: ["Television", "Dryer", "Oven", "Refrigerator", "Microwave"],
      as: ["appliance", "on_flag"]
    },
    { calculate: "toNumber(datum.on_flag)", as: "on_num" }
  ],
  mark: { type: "bar" },
  encoding: {
    x: { field: "appliance", type: "nominal", title: "Appliance" },
    y: { aggregate: "mean", field: "on_num", type: "quantitative", title: "Share of intervals on", axis: { format: ".0%" } },
    color: { field: "appliance", type: "nominal", legend: null, scale: { scheme: "tableau10" } },
    tooltip: [
      { field: "appliance", title: "Appliance" },
      { aggregate: "mean", field: "on_num", title: "Duty cycle", format: ".1%" }
    ]
  }
};

vegaEmbed('#vis-duty', specDuty).catch(console.error);