const specUpgrade = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Willingness to adopt smart home technology by US region",
  title: {
    text: "Willingness to Adopt Smart Home Tech by Region",
    font: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "bold",
    align: "right"
  },
  width: 500,
  height: 380,
  data: { url: "data/upgradeE/UPGRADE-E_V2.csv" },
  transform: [
    { filter: "indexof(['Yes','No','Maybe'], datum.willing_smart_tech) >= 0" },
    { filter: "isValid(datum.region) && datum.region != ''" }
  ],
  mark: { type: "bar" },
  encoding: {
    x: { field: "region", type: "nominal", title: "Region" },
    y: { aggregate: "count", type: "quantitative", title: "Respondents", stack: "normalize" },
    color: {
      field: "willing_smart_tech",
      type: "nominal",
      title: "Willing to adopt smart tech",
      scale: { domain: ["Yes", "Maybe", "No"], range: ["#2563eb", "#f59e0b", "#94a3b8"] }
    },
    tooltip: [
      { field: "region", title: "Region" },
      { field: "willing_smart_tech", title: "Response" },
      { aggregate: "count", title: "Respondents" }
    ]
  }
};

vegaEmbed('#vis-upgrade', specUpgrade).catch(console.error);