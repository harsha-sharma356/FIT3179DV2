const specGdpr = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Count of privacy scenarios by data class and purpose class",
  title: {
    text: "Privacy Scenarios by Data and Purpose Class",
    font: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "normal"
  },
  width: 500,
  height: 380,
  data: { url: "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/GDPR_priv/answers.csv" },
  mark: { type: "rect", stroke: "white", strokeWidth: 1 },
  encoding: {
    x: { field: "purposes_class", type: "nominal", title: "Purpose class" },
    y: { field: "data_class", type: "nominal", title: "Data class" },
    color: { aggregate: "count", type: "quantitative", title: "Scenarios", scale: { scheme: "blues" } },
    tooltip: [
      { field: "data_class", title: "Data class" },
      { field: "purposes_class", title: "Purpose" },
      { aggregate: "count", title: "Scenarios" }
    ]
  }
};

vegaEmbed('#vis-gdpr', specGdpr).catch(console.error);