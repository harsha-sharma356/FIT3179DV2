const spec44 = 
  {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {"url": "https://media.githubusercontent.com/media/harsha-sharma356/FIT3179DV2/refs/heads/main/data/global_ev_adoption/global_ev_adoption_behavior_2026.csv"},
  "transform": [
    {
      "calculate": "toNumber(datum.age)",
      "as": "age1"
    }
  ],
  "mark": "boxplot",
  "encoding": {
    "x": {
      "field": "technology_affinity_score",
      "type": "quantitative",
      "title": "Technology Affinity Score"
    },
    "y": {
      "field": "ev_adoption_likelihood",
      "type": "ordinal",
      "title": "Likelihood of Adopting EV",
      "sort": ["Low", "Medium", "High"]
    }
  }
}

print("we added this")
vegaEmbed('#vis99', spec44).then(result => {
  console.log(result);
  print("we added this")
}).catch(console.error);