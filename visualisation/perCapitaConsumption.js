const perCapita = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "description": "Connected dot plot comparing energy consumption per capita across economies",
  "data": {
    "url": "https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv"
  },
  "params": [
    {
      "name": "start_year",
      "value": 1990,
      "bind": { "input": "range", "min": 1965, "max": 2020, "step": 1, "name": "Start Year: " }
    },
    {
      "name": "end_year",
      "value": 2023,
      "bind": { "input": "range", "min": 1970, "max": 2024, "step": 1, "name": "End Year: " }
    }
  ],
  "transform": [
    { "filter": "datum.year == start_year || datum.year == end_year" },
    {
      "filter": "indexof(['World','United States','Canada','Germany','United Kingdom','Japan','Australia','China','India','Brazil','South Africa','Indonesia'], datum.country) >= 0"
    },
    { "filter": "datum.energy_per_capita != null" },
    {
      "lookup": "iso_code",
      "from": {
        "data": {
          "url": "https://api.worldbank.org/v2/country?format=json&per_page=400",
          "format": { "type": "json", "property": "1" }
        },
        "key": "id"
      },
      "as": "wb"
    },
    {
      "calculate": "!isValid(datum.iso_code) ? 'Global aggregate' : (isValid(datum.wb) && isValid(datum.wb.incomeLevel) ? datum.wb.incomeLevel.value : 'No match (check data)')",
      "as": "income_group"
    },
    {
      "calculate": "datum.year == start_year ? 'Start (' + start_year + ')' : 'End (' + end_year + ')'",
      "as": "year_label"
    }
  ],
  "encoding": {
    "y": {
      "field": "country",
      "type": "nominal",
      "title": "Country / Region",
      "sort": { "field": "energy_per_capita", "op": "max", "order": "descending" }
    }
  },
  "layer": [
    {
      "mark": { "type": "line", "strokeWidth": 2.5, "color": "#d0d0d0" },
      "encoding": {
        "x": {
          "field": "energy_per_capita",
          "type": "quantitative",
          "title": "Per Capita Energy Consumption (kWh/person)"
        },
        "detail": { "field": "country" }
      }
    },
    {
      "mark": { "type": "point", "filled": true, "size": 130 },
      "encoding": {
        "x": { "field": "energy_per_capita", "type": "quantitative" },
        "color": {
          "field": "income_group",
          "type": "nominal",
          "title": "World Bank Income Group",
          "scale": { "scheme": "tableau10" }
        },
        "shape": { "field": "year_label", "type": "nominal", "title": "Timeline" },
        "tooltip": [
          { "field": "country", "title": "Country" },
          { "field": "income_group", "title": "Income Group" },
          { "field": "year", "title": "Year" },
          { "field": "energy_per_capita", "title": "Per Capita (kWh)", "format": ",.0f" }
        ]
      }
    }
  ],
  "width": 750,
  "height": 450
}

vegaEmbed('#perCapita1', perCapita).then(result => {
  console.log(result);
}).catch(console.error);