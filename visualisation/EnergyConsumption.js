const spec5 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "Stacked area chart of energy consumption by source from OWID data",
  "title": {
    "text": "Global Energy Consumption by Source",
    "font": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    "fontWeight": "normal"
  },
  "data": {
    "url": "https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv"
  },
  "transform": [
    {
      "filter": "datum.country === 'World'"
    },
    {
      "filter": "datum.year >= 1990"
    },
    {
      "fold": [
        "coal_consumption",
        "oil_consumption",
        "gas_consumption",
        "nuclear_consumption",
        "hydro_consumption",
        "solar_consumption",
        "wind_consumption",
        "biofuel_consumption"
      ],
      "as": ["Energy_Source", "TWh"]
    }
  ],
  "mark": {
    "type": "area",
    "interpolate": "monotone"
  },
  "encoding": {
    "x": {
      "field": "year",
      "type": "temporal",
      "timeUnit": "year",
      "title": "Year"
    },
    "y": {
      "field": "TWh",
      "type": "quantitative",
      "title": "Electricity / Energy Consumption (TWh)",
      "stack": "zero"
    },
    "color": {
      "field": "Energy_Source",
      "type": "nominal",
      "title": "Energy Source",
      "scale": {
        "scheme": "tableau10"
      }
    },
    "tooltip": [
      {"field": "year", "title": "Year"},
      {"field": "Energy_Source", "title": "Source"},
      {"field": "TWh", "title": "Consumption (TWh)", "format": ",.2f"}
    ]
  },
  "width": 800,
  "height": 400
}

    // Embed the visualization into the div with ID 'vis'
vegaEmbed('#energy', spec5).then(result => {
  console.log(result);
}).catch(console.error);