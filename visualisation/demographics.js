const demoSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "description": "Survey respondents as a share of each age group (donut)",
  "title": {
    "text": "Respondents by Age Group",
    "font": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    "fontWeight": "normal"
  },
  "width": 360,
  "height": 320,
  "data": {
    "url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/GDPR_priv/answers_aggregated_by_person.csv"
  },
  "transform": [
    { "filter": "datum.age !== 'PASS'" },
    {
      "joinaggregate": [{ "op": "count", "as": "total" }]
    },
    { "calculate": "1 / datum.total", "as": "_share" }
  ],
  "mark": { "type": "arc", "innerRadius": 70, "outerRadius": 130, "padAngle": 0.5, "cornerRadius": 4 },
  "encoding": {
    "theta": { "aggregate": "count", "type": "quantitative", "title": "Respondents" },
    "color": {
      "field": "age",
      "type": "nominal",
      "title": "Age group",
      "sort": ["16-24", "25-34", "35-54", "55+"],
      "scale": { "scheme": "tableau10" }
    },
    "order": { "field": "age", "sort": ["16-24", "25-34", "35-54", "55+"] },
    "tooltip": [
      { "field": "age", "title": "Age group" },
      { "aggregate": "count", "title": "Respondents", "format": "," },
      { "aggregate": "sum", "field": "_share", "title": "Share", "format": ".1%" }
    ]
  }
};

vegaEmbed('#demoStats', demoSpec).then(result => {
  console.log(result);
}).catch(console.error);
