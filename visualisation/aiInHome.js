// AI in the home: edge/cloud offloading for smart appliances
// (The voice-assistant ratings chart was replaced with imagery in index.html.)

const specAiIndustry = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Smart-home AI edge-offloading decision share by appliance",
  title: {
    text: "Smart-Home AI Offloading by Appliance",
    font: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "normal"
  },
  width: 500,
  height: 380,
  data: { url: "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/smart_home_dataset/preprocessed_dataset.csv" },
  transform: [
    {
      fold: ["Television", "Dryer", "Oven", "Refrigerator", "Microwave"],
      as: ["appliance", "on_flag"]
    },
    { calculate: "toNumber(datum.on_flag)", as: "on_num" },
    { calculate: "toNumber(datum['Offloading Decision'])", as: "offload" },
    { filter: "isValid(datum.on_num) && datum.on_num === 1 && isValid(datum.offload)" }
  ],
  mark: { type: "bar" },
  encoding: {
    x: { field: "appliance", type: "nominal", title: "Appliance" },
    y: {
      aggregate: "mean",
      field: "offload",
      type: "quantitative",
      title: "Share of on-intervals offloaded to edge/cloud AI",
      axis: { format: ".0%" }
    },
    color: { field: "appliance", type: "nominal", legend: null, scale: { scheme: "tableau10" } },
    tooltip: [
      { field: "appliance", title: "Appliance" },
      { aggregate: "mean", field: "offload", title: "AI offload share", format: ".1%" }
    ]
  }
};

vegaEmbed('#vis-ai-industry', specAiIndustry).catch(console.error);