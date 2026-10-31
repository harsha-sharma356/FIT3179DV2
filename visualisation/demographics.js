const demoSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "description": "Survey respondent counts by age group and gender",
  "title": {
    "text": "Respondent Demographics by Age Group and Gender",
    "font": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    "fontWeight": "normal"
  },
  "width": 520,
  "height": 320,
  "data": {
    "url": "data/GDPR_priv/answers_aggregated_by_person.csv"
  },
  "transform": [
    { "filter": "datum.age !== 'PASS' && datum.gender !== 'PASS'" }
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
      "aggregate": "count",
      "type": "quantitative",
      "title": "Respondents"
    },
    "color": {
      "field": "gender",
      "type": "nominal",
      "title": "Gender",
      "scale": { "scheme": "tableau10" }
    },
    "tooltip": [
      { "field": "age", "title": "Age" },
      { "field": "gender", "title": "Gender" },
      { "aggregate": "count", "title": "Respondents" }
    ]
  }
};

vegaEmbed('#demoStats', demoSpec).then(result => {
  console.log(result);
}).catch(console.error);
