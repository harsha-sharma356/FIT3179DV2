// Reasons for Buying AI: stacked importance and ranking charts.
// Both specs share the same folded "reason" fields.

// Fields are listed in descending order of "Important" responses (top = most cited).
const buyReasonsFields = [
  ["durable", "Durable"],
  ["safety_certified", "Safety certified"],
  ["low_cost_install_maintain", "Low cost to install & maintain"],
  ["fewer_health_risks", "Fewer health risks"],
  ["low_maintenance", "Low maintenance"],
  ["fits_budget", "Fits budget"],
  ["superior_performance", "Superior performance"],
  ["safe_children_pets", "Safe for children & pets"],
  ["low_upfront_cost", "Low upfront cost"],
  ["operates_during_power_failure", "Works during power failure"],
  ["trusted_brand", "Trusted brand"],
  ["can_DIY", "Can do it myself"],
  ["latest_features", "Latest (AI) features"]
];

// Map folded reason keys to readable labels
const reasonLabelExpr =
  "{" +
  buyReasonsFields
    .map((f) => `'${f[0]}': '${f[1]}'`)
    .join(", ") +
  "}[datum.reason]";

// Explicit display order (most important first)
const buyReasonsOrder = buyReasonsFields.map((f) => f[1]);

const specBuyReasons = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "How important each factor is when buying a connected/AI device",
  width: 640,
  height: 420,
  data: { url: "data/upgradeE/UPGRADE-E_V2.csv" },
  transform: [
    {
      fold: buyReasonsFields.map((f) => f[0]),
      as: ["reason", "importance"]
    },
    {
      filter:
        "indexof(['Important','Somewhat Important','Not Important'], datum.importance) >= 0"
    },
    { calculate: reasonLabelExpr, as: "reason_label" }
  ],
  mark: { type: "bar" },
  encoding: {
    x: {
      aggregate: "count",
      type: "quantitative",
      stack: "normalize",
      title: "Share of respondents",
      axis: { format: ".0%" }
    },
    y: {
      field: "reason_label",
      type: "nominal",
      title: null,
      sort: buyReasonsOrder
    },
    color: {
      field: "importance",
      type: "nominal",
      title: "Importance",
      scale: {
        domain: ["Important", "Somewhat Important", "Not Important"],
        range: ["#2563eb", "#f59e0b", "#cbd5e1"]
      }
    },
    tooltip: [
      { field: "reason_label", title: "Reason" },
      { field: "importance", title: "Importance" },
      { aggregate: "count", title: "Respondents" }
    ]
  }
};

const specBuyReasonsRank = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Ranking of reasons by share saying Important",
  width: 640,
  height: 420,
  data: { url: "data/upgradeE/UPGRADE-E_V2.csv" },
  transform: [
    {
      fold: buyReasonsFields.map((f) => f[0]),
      as: ["reason", "importance"]
    },
    { filter: "datum.importance === 'Important'" },
    { calculate: reasonLabelExpr, as: "reason_label" }
  ],
  mark: { type: "bar", color: "#2563eb" },
  encoding: {
    y: {
      field: "reason_label",
      type: "nominal",
      title: null,
      sort: buyReasonsOrder
    },
    x: {
      field: "reason",
      type: "quantitative",
      aggregate: "count",
      title: "Respondents rating 'Important'",
      axis: { format: "," }
    },
    tooltip: [
      { field: "reason_label", title: "Reason" },
      { aggregate: "count", title: "'Important' responses", format: "," }
    ]
  }
};

vegaEmbed('#vis-buy-reasons', specBuyReasons).catch(console.error);
vegaEmbed('#vis-buy-reasons-rank', specBuyReasonsRank).catch(console.error);