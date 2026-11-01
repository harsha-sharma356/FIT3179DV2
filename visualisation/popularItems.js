// Popular smart-home items from the SMASH dataset
// (5218 smart-home devices listed on Spanish e-commerce platforms).
//   1. most common device types (Macro-Category-EN) - treemap
//   2. most popular brands -> macro-category network

const SMASH_URL = "https://raw.githubusercontent.com/harsha-sharma356/FIT3179DV2/main/data/doi-10.21950-jtiqq5/smash_2024_v02.tsv";
const TITLE_FONT = "Inter, -apple-system, BlinkMacSystemFont, sans-serif";

const specPopularTypes = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  description: "Treemap of smart-home device listings by macro-category (SMASH)",
  title: {
    text: "Most Common Smart-Home Device Types",
    font: TITLE_FONT,
    fontWeight: "normal",
    anchor: "start"
  },
  width: 640,
  height: 380,
  padding: 5,

  data: [
    {
      name: "tree",
      url: SMASH_URL,
      format: { type: "tsv" },
      transform: [
        { type: "filter", expr: "isValid(datum['Macro-Category-EN']) && datum['Macro-Category-EN'] != ''" },
        { type: "aggregate", groupby: ["Macro-Category-EN"], ops: ["count"], fields: [null], as: ["count"] },
        { type: "nest", generate: true },
        {
          type: "treemap",
          field: "count",
          sort: { field: "count", order: "descending" },
          method: "squarify",
          ratio: 1.6,
          padding: 2,
          paddingOuter: 0,
          round: true,
          size: [{ signal: "width" }, { signal: "height" }]
        }
      ]
    },
    {
      name: "leaves",
      source: "tree",
      transform: [
        { type: "filter", expr: "datum.depth == 1" },
        { type: "formula", as: "cx", expr: "0.5 * (datum.x0 + datum.x1)" },
        { type: "formula", as: "cy", expr: "0.5 * (datum.y0 + datum.y1)" }
      ]
    }
  ],

  scales: [
    {
      name: "color",
      type: "ordinal",
      domain: { data: "leaves", field: "Macro-Category-EN" },
      range: { scheme: "tableau10" }
    }
  ],

  marks: [
    {
      type: "rect",
      from: { data: "leaves" },
      encode: {
        enter: {
          fill: { scale: "color", field: "Macro-Category-EN" },
          stroke: { value: "#ffffff" },
          strokeWidth: { value: 1.5 },
          tooltip: { signal: "{'Category': datum['Macro-Category-EN'], 'Listings': format(datum.count, ',')}" }
        },
        update: {
          x: { field: "x0" },
          y: { field: "y0" },
          x2: { field: "x1" },
          y2: { field: "y1" }
        }
      }
    },
    {
      type: "text",
      from: { data: "leaves" },
      encode: {
        enter: {
          align: { value: "center" },
          baseline: { value: "middle" },
          fill: { value: "#ffffff" },
          fontSize: { value: 12 },
          fontWeight: { value: "bold" },
          limit: { value: 140 }
        },
        update: {
          x: { field: "cx" },
          y: { field: "cy" },
          text: { signal: "datum['Macro-Category-EN'] + '\\n' + format(datum.count, ',')" }
        }
      }
    }
  ]
};

const specPopularBrands = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  description: "Network of top smart-home brands and the macro-categories they sell (SMASH)",
  title: {
    text: "Most Popular Smart-Home Brands and Their Categories",
    font: TITLE_FONT,
    fontWeight: "normal",
    anchor: "start"
  },
  width: 640,
  height: 420,
  padding: 10,

  signals: [
    { name: "minLinks", value: 3, bind: { input: "range", min: 1, max: 10, step: 1, name: "Min. listings per link: " } },
    { name: "focusCat", value: "All", bind: { input: "select", options: ["All", "Wearable devices", "Smart security", "Smart lighting", "Home appliances", "Smart home", "Routers and Networks", "Smart plugs and switches"], name: "Browse type: " } }
  ],

  data: [
    {
      name: "raw",
      url: SMASH_URL,
      format: { type: "tsv" },
      transform: [
        { type: "filter", expr: "isValid(datum.brand) && datum.brand != '' && isValid(datum['Macro-Category-EN']) && datum['Macro-Category-EN'] != ''" }
      ]
    },
    {
      name: "totals",
      source: "raw",
      transform: [
        { type: "aggregate", groupby: ["brand"], ops: ["count"], fields: [null], as: ["count"] },
        { type: "window", sort: { field: "count", order: "descending" }, ops: ["row_number"], fields: [null], as: ["rank"] },
        { type: "filter", expr: "datum.rank <= 8" }
      ]
    },
    {
      name: "links",
      source: "raw",
      transform: [
        { type: "aggregate", groupby: ["brand", "Macro-Category-EN"], ops: ["count"], fields: [null], as: ["count"] },
        { type: "filter", expr: "datum.count >= minLinks" },
        { type: "lookup", from: "totals", key: "brand", fields: ["brand"], values: ["rank"], as: ["rank"] },
        { type: "filter", expr: "datum.rank != null && datum.rank <= 8" },
        { type: "filter", expr: "focusCat == 'All' || datum['Macro-Category-EN'] == focusCat" },
        { type: "formula", as: "value", expr: "datum.count" }
      ]
    },
    {
      name: "nodes",
      source: "links",
      transform: [
        { type: "formula", as: "pair", expr: "[{id: datum.brand, group: 0}, {id: datum['Macro-Category-EN'], group: 1}]" },
        { type: "flatten", fields: ["pair"] },
        { type: "formula", as: "id", expr: "datum.pair.id" },
        { type: "formula", as: "group", expr: "datum.pair.group" },
        { type: "aggregate", groupby: ["id", "group"], ops: ["sum"], fields: ["count"], as: ["size"] },
        { type: "window", sort: { field: ["group", "size"], order: ["ascending", "descending"] }, groupby: ["group"], ops: ["row_number"], fields: [null], as: ["i"] },
        { type: "joinaggregate", groupby: ["group"], ops: ["count"], fields: [null], as: ["cnt"] },
        { type: "formula", as: "radius", expr: "clamp(7 + 2.5 * sqrt(datum.size), 9, 28)" },
        { type: "formula", as: "type", expr: "datum.group == 0 ? 'Brand' : 'Type'" },
        { type: "formula", as: "x", expr: "datum.group == 0 ? 110 : width - 160" },
        { type: "formula", as: "y", expr: "40 + (datum.i - 1) * ((height - 80) / max(1, datum.cnt - 1))" }
      ]
    },
    {
      name: "edges",
      source: "links",
      transform: [
        { type: "lookup", from: "nodes", key: "id", fields: ["brand"], values: ["x", "y"], as: ["sx", "sy"] },
        { type: "lookup", from: "nodes", key: "id", fields: ["Macro-Category-EN"], values: ["x", "y"], as: ["tx", "ty"] },
        { type: "formula", as: "path", expr: "'M' + datum.sx + ',' + datum.sy + 'L' + datum.tx + ',' + datum.ty" }
      ]
    }
  ],

  scales: [
    { name: "nodeFill", type: "ordinal", domain: ["Brand", "Type"], range: ["#2563eb", "#f59e0b"] },
    { name: "nodeSize", type: "sqrt", domain: { data: "nodes", field: "size" }, range: [50, 1100] },
    { name: "edgeWidth", type: "sqrt", domain: { data: "links", field: "value" }, range: [0.5, 8] }
  ],

  legends: [
    { fill: "nodeFill", title: "Node type", symbolType: "square", orient: "bottom" },
    { size: "nodeSize", title: "Listings", symbolType: "circle", orient: "bottom" }
  ],

  marks: [
    {
      type: "path",
      from: { data: "edges" },
      encode: {
        enter: {
          path: { field: "path" },
          stroke: { value: "#94a3b8" },
          strokeWidth: { scale: "edgeWidth", field: "value" },
          strokeOpacity: { value: 0.55 },
          tooltip: { signal: "{'Link': datum.brand + ' → ' + datum['Macro-Category-EN'], 'Listings': format(datum.value, ',')}" }
        }
      }
    },
    {
      type: "symbol",
      from: { data: "nodes" },
      encode: {
        enter: {
          shape: { value: "circle" },
          fill: { scale: "nodeFill", field: "type" },
          stroke: { value: "#ffffff" },
          strokeWidth: { value: 1.5 },
          size: { scale: "nodeSize", field: "size" },
          tooltip: { signal: "{'Node': datum.id, 'Listings': format(datum.size, ',')}" }
        },
        update: { x: { field: "x" }, y: { field: "y" } }
      }
    },
    {
      type: "text",
      from: { data: "nodes" },
      encode: {
        enter: {
          text: { field: "id" },
          align: { signal: "datum.group == 0 ? 'right' : 'left'" },
          baseline: { value: "middle" },
          dx: { signal: "datum.group == 0 ? -(datum.radius + 5) : (datum.radius + 5)" },
          fontSize: { value: 11 },
          fontWeight: { value: "bold" },
          fill: { value: "#334155" }
        },
        update: { x: { field: "x" }, y: { field: "y" } }
      }
    }
  ]
};

vegaEmbed('#vis-popular-types', specPopularTypes, { renderer: "svg" }).catch(console.error);
vegaEmbed('#vis-popular-brands', specPopularBrands, { renderer: "svg" }).catch(console.error);