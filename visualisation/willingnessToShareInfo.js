const willingnessSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "description": "Average willingness to share special vs other data by age",
  "width": 520,
  "height": 320,
  "data": {
    "url": "data/GDPR_priv/answers_aggregated_by_person.csv"
  },
  "transform": [
    { "filter": "datum.age !== 'PASS'" },
    {
      "fold": ["Special Protected Data", "Other Data"],
      "as": ["data_category", "willingness"]
    },
    { "filter": "isValid(datum.willingness)" }
  ],
  "mark": { "type": "bar" },
  "encoding": {
    "x": {
      "field": "age",
      "type": "nominal",
      "title": "Age group",
      "sort": ["16-24", "25-34", "35-54", "55+"]
    },
    "y": {
      "aggregate": "mean",
      "field": "willingness",
      "type": "quantitative",
      "title": "Mean willingness (-1 refuse, 1 share)"
    },
    "color": {
      "field": "data_category",
      "type": "nominal",
      "title": "Data type",
      "scale": { "scheme": "tableau10" }
    },
    "xOffset": { "field": "data_category" },
    "tooltip": [
      { "field": "age", "title": "Age" },
      { "field": "data_category", "title": "Data type" },
      { "aggregate": "mean", "field": "willingness", "title": "Mean willingness", "format": ".2f" }
    ]
  }
};

vegaEmbed('#willingnessToShare', willingnessSpec).then(result => {
  console.log(result);
}).catch(console.error);
