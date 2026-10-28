const privacySpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "description": "Privacy attitude score by age group",
  "width": 520,
  "height": 320,
  "data": {
    "url": "data/GDPR_priv/answers_aggregated_by_person.csv"
  },
  "transform": [
    { "filter": "datum.age !== 'PASS' && isValid(datum.score)" }
  ],
  "mark": { "type": "boxplot", "extent": 1.5 },
  "encoding": {
    "x": {
      "field": "age",
      "type": "nominal",
      "title": "Age group",
      "sort": ["16-24", "25-34", "35-54", "55+"]
    },
    "y": {
      "field": "score",
      "type": "quantitative",
      "title": "Privacy attitude score"
    },
    "color": {
      "field": "age",
      "type": "nominal",
      "legend": null,
      "scale": { "scheme": "tableau10" }
    },
    "tooltip": [
      { "field": "age", "title": "Age" },
      { "field": "score", "title": "Score" }
    ]
  }
};

vegaEmbed('#privacyConcerns', privacySpec).then(result => {
  console.log(result);
}).catch(console.error);
