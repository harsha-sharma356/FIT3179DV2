const spec44 = 
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 520,
  "height": 200,
  "data": {"url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/global_ev_adoption/global_ev_adoption_behavior_2026.csv"},
  "transform": [
    {"filter": "isValid(datum.technology_affinity_score) && isValid(datum.ev_adoption_likelihood)"}
  ],
  "mark": {"type": "rect", "tooltip": true},
  "encoding": {
    "x": {
      "field": "technology_affinity_score",
      "type": "quantitative",
      "bin": {"step": 1},
      "title": "Technology Affinity Score"
    },
    "y": {
      "field": "ev_adoption_likelihood",
      "type": "ordinal",
      "sort": ["High", "Medium", "Low"],
      "title": "Likelihood of Adopting EV"
    },
    "color": {
      "aggregate": "count",
      "type": "quantitative",
      "title": "Respondents",
      "scale": {"scheme": "greens"}
    }
  }
}

vegaEmbed('#demographic', spec44).then(result => {
  console.log(result);
  print("we added this")
}).catch(console.error);