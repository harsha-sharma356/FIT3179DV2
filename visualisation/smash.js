const specSmash = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Mean listed price of Spanish smart-home products by macro-category",
  title: {
    text: "Mean Listed Price of Spanish Smart-Home Products by Category",
    font: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "normal"
  },
  width: 500,
  height: 400,
  data: {
    url: "data/doi-10.21950-jtiqq5/smash_2024_v02.tsv",
    format: { type: "tsv" }
  },
  transform: [
    { calculate: "toNumber(datum.price)", as: "price_num" },
    { filter: "isValid(datum.price_num) && datum.price_num > 0" },
    { filter: "isValid(datum['Macro-Category-EN']) && datum['Macro-Category-EN'] != ''" }
  ],
  mark: { type: "bar" },
  encoding: {
    y: { field: "Macro-Category-EN", type: "nominal", title: "Macro category", sort: "-x" },
    x: { aggregate: "mean", field: "price_num", type: "quantitative", title: "Mean listed price (EUR)" },
    color: { aggregate: "count", type: "quantitative", title: "Listings", scale: { scheme: "blues" } },
    tooltip: [
      { field: "Macro-Category-EN", title: "Category" },
      { aggregate: "mean", field: "price_num", title: "Mean price (€)", format: ",.0f" },
      { aggregate: "count", title: "Listings" }
    ]
  }
};

vegaEmbed('#vis-smash', specSmash).catch(console.error);