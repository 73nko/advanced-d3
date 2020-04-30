async function drawBars() {

  // 1. Access data

  let dataset = await d3.json("./../../my_weather_data.json")

  const dateParser = d3.timeParse("%Y-%m-%d")
  const dateAccessor = d => dateParser(d.date)
  dataset = dataset.sort((a,b) => dateAccessor(a) - dateAccessor(b))
  const metrics = [
    "windBearing",
    "moonPhase",
    "pressure",
    "humidity",
    "windSpeed",
    "temperatureMax",
  ]

  // 2. Create chart dimensions

  const width = 600
  let dimensions = {
    width: width,
    height: width,
    radius: width / 2,
    margin: {
      top: 80,
      right: 80,
      bottom: 80,
      left: 80,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom
  dimensions.boundedRadius = dimensions.radius - ((dimensions.margin.left + dimensions.margin.right) / 2)

  // 3. Draw canvas

  const wrapper = d3.select("#wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
      .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  // 4. Create scales

  const metricScales = metrics.map(metric => (
    d3.scaleLinear()
    .domain(d3.extent(dataset, d => +d[metric]))
    .range([0, dimensions.boundedRadius])
    .nice()
  ))

  // 6. Draw peripherals
  // We're drawing our axes early here so they don't overlap our radar line

  const axis = bounds.append("g")

  const gridCircles = d3.range(4).map((d, i) => (
    axis.append("circle")
      .attr("cx", dimensions.boundedRadius)
      .attr("cy", dimensions.boundedRadius)
      .attr("r", dimensions.boundedRadius * (i / 3))
      .attr("class", "grid-line")
  ))

  const gridLines = metrics.map((metric, i) => {
    const angle = i * ((Math.PI * 2) / metrics.length) - Math.PI * 0.5
    return axis.append("line")
      .attr("x1", dimensions.boundedWidth / 2)
      .attr("x2", Math.cos(angle) * dimensions.boundedRadius + dimensions.boundedWidth / 2)
      .attr("y1", dimensions.boundedHeight / 2)
      .attr("y2", Math.sin(angle) * dimensions.boundedRadius + dimensions.boundedWidth / 2)
      .attr("class", "grid-line")
  })

  const labels = metrics.map((metric, i) => {
    const angle = i * ((Math.PI * 2) / metrics.length) - Math.PI * 0.5
    const x = Math.cos(angle) * (dimensions.boundedRadius * 1.1) + dimensions.boundedWidth / 2
    const y = Math.sin(angle) * (dimensions.boundedRadius * 1.1) + dimensions.boundedHeight / 2
    return axis.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("class", "metric-label")
      .style("text-anchor",
        i == 0 || i == metrics.length / 2 ? "middle" :
        i < metrics.length / 2            ? "start"  :
                                            "end"

      )
      .text(metric)
    })

  // 5. Draw data

  const line = bounds.append("path")
      .attr("class", "line")

  const drawLine = (day) => {
    const lineGenerator = d3.lineRadial()
        .angle((metric, i) => i * ((Math.PI * 2) / metrics.length))
        .radius((metric, i) => metricScales[i](+day[metric] || 0))
        .curve(d3.curveLinearClosed)

    const line = bounds.select(".line")
        .datum(metrics)
        .attr("d", lineGenerator)
        .style("transform", `translate(${dimensions.boundedRadius}px, ${dimensions.boundedRadius}px)`)
  }

  let activeDayIndex = 0
  const title = d3.select("#title")
  const dateFormatter = d3.timeFormat("%B %-d, %Y")

  const updateChart = () => {
    title.text(dateFormatter(dateAccessor(dataset[activeDayIndex])))
    drawLine(dataset[activeDayIndex])
  }

  updateChart()

  d3.select("#show-next-day").on("click", e => {
    activeDayIndex = (activeDayIndex + 1) % dataset.length
    updateChart()
  })
}
drawBars()