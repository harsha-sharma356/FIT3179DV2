const willingnessSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "title": {
    "text": "Willingness to Share Personal Data by Age Group",
    "subtitle": "Dots show the mean, whiskers the 95% CI. The line length is the gap between data types.",
    "font": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    "fontWeight": "normal"
  },
  "width": 520,
  "height": 220,
  "data": {
    "url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/GDPR_priv/answers_aggregated_by_person.csv"
  },
  "transform": [
    { "filter": "datum.age !== 'PASS'" },
    { "fold": ["Special Protected Data", "Other Data"], "as": ["data_category", "willingness"] },
    { "filter": "isValid(datum.willingness)" },
    {
      "aggregate": [
        { "op": "mean", "field": "willingness", "as": "mean_w" },
        { "op": "ci0", "field": "willingness", "as": "lo" },
        { "op": "ci1", "field": "willingness", "as": "hi" }
      ],
      "groupby": ["age", "data_category"]
    }
  ],
  "encoding": {
    "y": {
      "field": "age", "type": "ordinal", "title": "Age group",
      "sort": ["16-24", "25-34", "35-54", "55+"]
    }
  },
  "layer": [
    {
      "data": { "values": [{ "zero": 0 }] },
      "transform": [],
      "mark": { "type": "rule", "strokeDash": [4, 4], "color": "#888" },
      "encoding": { "x": { "field": "zero", "type": "quantitative" }, "y": { "value": 0 }, "y2": { "value": 220 } }
    },
    {
      "transform": [
        { "pivot": "data_category", "value": "mean_w", "groupby": ["age"] }
      ],
      "mark": { "type": "rule", "strokeWidth": 3, "color": "#bbb" },
      "encoding": {
        "x": { "field": "Special Protected Data", "type": "quantitative" },
        "x2": { "field": "Other Data" }
      }
    },
    {
      "mark": { "type": "rule", "strokeWidth": 2, "opacity": 0.6 },
      "encoding": {
        "x": { "field": "lo", "type": "quantitative" },
        "x2": { "field": "hi" },
        "color": { "field": "data_category", "type": "nominal", "legend": {
          "title": "Data Category"
        }, "scale": { "scheme": "tableau10" } }
      }
    },
    {
      "mark": { "type": "point", "filled": true, "size": 130, "opacity": 1 },
      "encoding": {
        "x": {
          "field": "mean_w", "type": "quantitative",
          "title": "Mean willingness  (← refuse  |  share →)",
          "scale": { "domain": [-1, 1] }
        },
        "color": {
          "field": "data_category", "type": "nominal", "title": "Data type",
          "scale": { "scheme": "tableau10" }
        },
        "tooltip": [
          { "field": "age", "title": "Age" },
          { "field": "data_category", "title": "Data type" },
          { "field": "mean_w", "title": "Mean willingness", "format": ".2f" },
          { "field": "lo", "title": "95% CI low", "format": ".2f" },
          { "field": "hi", "title": "95% CI high", "format": ".2f" }
        ]
      }
    }
  ]
};

vegaEmbed('#willingnessToShare', willingnessSpec).then(result => {
  console.log(result);
}).catch(console.error);
