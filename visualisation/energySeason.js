const specEnergySeason = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Mean appliance energy use by season",
  title: {
    text: "Appliance Energy Use by Season",
    font: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "normal"
  },
  width: 500,
  height: 380,
  data: { url: "data/smartHomeEnergyConsumption/smart_home_energy_consumption_large.csv" },
  mark: { type: "bar" },
  encoding: {
    y: { field: "Appliance Type", type: "nominal", title: "Appliance", sort: "-x" },
    x: {
      aggregate: "mean",
      field: "Energy Consumption (kWh)",
      type: "quantitative",
      title: "Mean energy (kWh)"
    },
    color: { field: "Season", type: "nominal", title: "Season", scale: { scheme: "tableau10" } },
    yOffset: { field: "Season" },
    tooltip: [
      { field: "Appliance Type", title: "Appliance" },
      { field: "Season", title: "Season" },
      { aggregate: "mean", field: "Energy Consumption (kWh)", title: "Mean kWh", format: ".2f" }
    ]
  }
};

vegaEmbed('#vis-energy-season', specEnergySeason).catch(console.error);