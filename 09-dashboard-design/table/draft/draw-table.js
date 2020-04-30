async function drawTable() {
  // load data
  const dateParser = d3.timeParse("%Y-%m-%d")
  const dateAccessor = d => dateParser(d.date)
  let dataset = await d3.json("./../../../my_weather_data.json")
  dataset = dataset.sort((a,b) => dateAccessor(a) - dateAccessor(b))

  const table = d3.select("#table")

  const numberOfRows= 10

  const columns = [
    {label: "Day", type: "text", format: d => d.date},
    {label: "Summary", type: "text", format: d => d.summary},
    {label: "Max Temp", type: "number", format: d => d.temperatureMax},
    {label: "Max Temp Time", type: "text", format: d => d.apparentTemperatureMaxTime},
    {label: "Wind Speed", type: "number", format: d => d.windSpeed},
    {label: "Precipitation", type: "text", format: d => d.precipType},
    {label: "UV Index", type: "number", format: d => d.uvIndex},
  ]

  table.append("thead").append("tr")
    .selectAll("thead")
    .data(columns)
    .enter().append("th")
      .text(d => d.label)
      .attr("class", d => d.type)

  const body = table.append("tbody")

  dataset.slice(0, numberOfRows).forEach(d => {
    body.append("tr")
      .selectAll("td")
      .data(columns)
      .enter().append("td")
        .text(column => column.format(d))
        .attr("class", column => column.type)
  })
}
drawTable()