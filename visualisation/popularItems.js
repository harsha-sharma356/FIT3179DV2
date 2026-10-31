// Popular smart-home items: two simple bar charts from the SMASH dataset
// (5218 smart-home devices listed on Spanish e-commerce platforms).
//   1. most common device types (Macro-Category-EN)
//   2. most popular brands (top 10)

const SMASH_URL = "https://raw.githubusercontent.com/harsha-sharma356/FIT3179DV2/main/data/doi-10.21950-jtiqq5/smash_2024_v02.tsv";
const TITLE_FONT = "Inter, -apple-system, BlinkMacSystemFont, sans-serif";

const specPopularTypes = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Count of smart-home device listings by macro-category (SMASH)",
  title: {
    text: "Most Common Smart-Home Device Types",
    font: TITLE_FONT,
    fontWeight: "normal"
  },
  width: 640,
  height: 300,
  data: { url: SMASH_URL, format: { type: "tsv" } },
  transform: [
    { filter: "isValid(datum['Macro-Category-EN']) && datum['Macro-Category-EN'] != ''" }
  ],
  mark: { type: "bar" },
  encoding: {
    y: { field: "Macro-Category-EN", type: "nominal", title: null, sort: "-x" },
    x: { aggregate: "count", type: "quantitative", title: "Number of listings" },
    color: { field: "Macro-Category-EN", type: "nominal", legend: null, scale: { scheme: "tableau10" } },
    tooltip: [
      { field: "Macro-Category-EN", title: "Category" },
      { aggregate: "count", title: "Listings", format: "," }
    ]
  }
};

const specPopularBrands = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Top 10 smart-home device brands by number of listings (SMASH)",
  title: {
    text: "Most Popular Smart-Home Brands",
    font: TITLE_FONT,
    fontWeight: "normal"
  },
  width: 640,
  height: 340,
  data: { url: SMASH_URL, format: { type: "tsv" } },
  transform: [
    { filter: "isValid(datum.brand) && datum.brand != ''" },
    { aggregate: [{ op: "count", as: "count" }], groupby: ["brand"] },
    { window: [{ op: "row_number", as: "rank" }], sort: [{ field: "count", order: "descending" }] },
    { filter: "datum.rank <= 10" }
  ],
  mark: { type: "bar", color: "#2563eb" },
  encoding: {
    y: { field: "brand", type: "nominal", title: null, sort: "-x" },
    x: { field: "count", type: "quantitative", title: "Number of listings" },
    tooltip: [
      { field: "brand", title: "Brand" },
      { field: "count", title: "Listings", format: "," }
    ]
  }
};

vegaEmbed('#vis-popular-types', specPopularTypes).catch(console.error);
vegaEmbed('#vis-popular-brands', specPopularBrands).catch(console.error);