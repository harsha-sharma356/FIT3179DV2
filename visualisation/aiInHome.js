// AI in the home: edge/cloud offloading for smart appliances
// (The voice-assistant ratings chart was replaced with imagery in index.html.)

const specAiIndustry = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": {
    "text": "Research publications mentioning AI in smart homes, by year",
    "subtitle": "Live from OpenAlex (title/abstract/full-text search). The latest year is partial."
  },
  "width": 600,
  "height": 360,
  "layer": [
    {
      "data": {
        "url": "https://api.openalex.org/works?search=%22smart%20home%22%20AND%20%22artificial%20intelligence%22&filter=publication_year:2010-2026&group_by=publication_year",
        "format": {"type": "json", "property": "group_by"}
      },
      "transform": [
        {"calculate": "toNumber(datum.key)", "as": "year"},
        {"calculate": "'\"smart home\" AND \"artificial intelligence\"'", "as": "series"}
      ],
      "mark": {"type": "line", "point": {"filled": true, "size": 50}, "strokeWidth": 2}
    },
    {
      "data": {
        "url": "https://api.openalex.org/works?search=%22smart%20home%22&filter=publication_year:2010-2026&group_by=publication_year",
        "format": {"type": "json", "property": "group_by"}
      },
      "transform": [
        {"calculate": "toNumber(datum.key)", "as": "year"},
        {"calculate": "'\"smart home\" (all publications)'", "as": "series"}
      ],
      "mark": {"type": "line", "point": {"filled": true, "size": 50}, "strokeWidth": 2, "strokeDash": [6, 4]}
    }
  ],
  "encoding": {
    "x": {
      "field": "year",
      "type": "quantitative",
      "title": "Publication year",
      "axis": {"format": "d", "tickMinStep": 1}
    },
    "y": {
      "field": "count",
      "type": "quantitative",
      "title": "Number of works"
    },
    "color": {
      "field": "series",
      "type": "nominal",
      "title": "Search query",
      "legend": {"orient": "top-left"}
    },
    "tooltip": [
      {"field": "series", "type": "nominal", "title": "Query"},
      {"field": "year", "type": "quantitative", "title": "Year", "format": "d"},
      {"field": "count", "type": "quantitative", "title": "Works", "format": ","}
    ]
  }
}

vegaEmbed('#vis-ai-industry', specAiIndustry).catch(console.error);