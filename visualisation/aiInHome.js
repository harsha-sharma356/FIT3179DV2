// AI in the home: voice assistant ratings and edge-offloading
const specAiCountry = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Amazon Alexa voice-assistant ratings by device variation",
  title: {
    text: "Amazon Alexa Ratings by Device",
    font: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "normal"
  },
  width: 500,
  height: 380,
  data: { url: "https://raw.githubusercontent.com/harsha-sharma356/FIT3179DV2/main/data/alexaReviewsKaggle/amazon_alexa.tsv", format: { type: "tsv" } },
  transform: [
    { calculate: "datum.variation ? datum.variation : 'Other'", as: "device" }
  ],
  mark: { type: "bar" },
  encoding: {
    x: { aggregate: "mean", field: "rating", type: "quantitative", title: "Average rating (1–5)", scale: { domain: [0, 5] } },
    y: { field: "device", type: "nominal", title: "Alexa device", sort: "-x" },
    color: {
      aggregate: "count",
      type: "quantitative",
      title: "Reviews",
      scale: { scheme: "blues" }
    },
    tooltip: [
      { field: "device", title: "Device" },
      { aggregate: "mean", field: "rating", title: "Avg rating", format: ".2f" },
      { aggregate: "count", title: "Reviews" }
    ]
  }
};

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
  data: { url: "https://raw.githubusercontent.com/harsha-sharma356/FIT3179DV2/main/data/smart_home_dataset/preprocessed_dataset.csv" },
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

vegaEmbed('#vis-ai-country', specAiCountry).catch(console.error);
vegaEmbed('#vis-ai-industry', specAiIndustry).catch(console.error);