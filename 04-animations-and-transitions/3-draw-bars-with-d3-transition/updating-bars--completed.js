async function drawBars() {

  // 1. Access data
  const dataset = await d3.json("./../../my_weather_data.json")

  // 2. Create chart dimensions

  const width = 500
  let dimensions = {
    width: width,
    height: width * 0.6,
    margin: {
      top: 30,
      right: 10,
      bottom: 50,
      left: 50,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  // 3. Draw canvas

  const wrapper = d3.select("#wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
      .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  // init static elements
  bounds.append("g")
      .attr("class", "bins")
  bounds.append("line")
      .attr("class", "mean")
  bounds.append("g")
      .attr("class", "x-axis")
      .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .append("text")
      .attr("class", "x-axis-label")
      .attr("x", dimensions.boundedWidth / 2)
      .attr("y", dimensions.margin.bottom - 10)

  const drawHistogram = metric => {
    const metricAccessor = d => d[metric]
    const yAccessor = d => d.length

    // 4. Create scales

    const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, metricAccessor))
      .range([0, dimensions.boundedWidth])
      .nice()

    const binsGenerator = d3.histogram()
      .domain(xScale.domain())
      .value(metricAccessor)
      .thresholds(12)

    const bins = binsGenerator(dataset)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, yAccessor)])
      .range([dimensions.boundedHeight, 0])
      .nice()

    // 5. Draw data

    const exitTransition = d3.transition()
      .duration(600)

    const updateTransition = exitTransition.transition()
      .duration(600)

    const barPadding = 1

    let binGroups = bounds.select(".bins")
      .selectAll(".bin")
      .data(bins)

    const oldBinGroups = binGroups.exit()
    oldBinGroups.selectAll("rect")
        .style("fill", "orangered")
      .transition(exitTransition)
        .attr("y", dimensions.boundedHeight)
        .attr("height", 0)

    oldBinGroups.selectAll("text")
      .transition(exitTransition)
      .attr("y", dimensions.boundedHeight)

    oldBinGroups
      .transition(exitTransition)
        .remove()

    const newBinGroups = binGroups.enter().append("g")
        .attr("class", "bin")

    newBinGroups.append("rect")
        .attr("height", 0)
        .attr("x", d => xScale(d.x0) + barPadding)
        .attr("y", dimensions.boundedHeight)
        .attr("width", d => d3.max([
          0,
          xScale(d.x1) - xScale(d.x0) - barPadding
        ]))
        .style("fill", "yellowgreen")

    newBinGroups.append("text")
        .attr("x", d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
        .attr("y", dimensions.boundedHeight)

    // update binGroups to include new points
    binGroups = newBinGroups.merge(binGroups)

    const barRects = binGroups.select("rect")
      .transition(updateTransition)
        .attr("x", d => xScale(d.x0) + barPadding)
        .attr("y", d => yScale(yAccessor(d)))
        .attr("height", d => dimensions.boundedHeight - yScale(yAccessor(d)))
        .attr("width", d => d3.max([
          0,
          xScale(d.x1) - xScale(d.x0) - barPadding
        ]))
      .transition()
        .style("fill", "cornflowerblue")

    const barText = binGroups.select("text")
      .transition(updateTransition)
        .attr("x", d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
        .attr("y", d => yScale(yAccessor(d)) - 5)
        .text(d => yAccessor(d) || "")

    const mean = d3.mean(dataset, metricAccessor)

    const meanLine = bounds.selectAll(".mean")
      .transition(updateTransition)
        .attr("x1", xScale(mean))
        .attr("x2", xScale(mean))
        .attr("y1", -20)
        .attr("y2", dimensions.boundedHeight)

    // 6. Draw peripherals

    const xAxisGenerator = d3.axisBottom()
      .scale(xScale)

    const xAxis = bounds.select(".x-axis")
      .transition(updateTransition)
      .call(xAxisGenerator)


    const xAxisLabel = xAxis.select(".x-axis-label")
        .text(metric)
  }

  const metrics = [
    "windSpeed",
    "moonPhase",
    "dewPoint",
    "humidity",
    "uvIndex",
    "windBearing",
    "temperatureMin",
    "temperatureMax",
  ]
  let selectedMetricIndex = 0
  drawHistogram(metrics[selectedMetricIndex])

  const button = d3.select("body")
    .append("button")
      .text("Change metric")

  button.node().addEventListener("click", onClick)
  function onClick() {
    selectedMetricIndex = (selectedMetricIndex + 1) % metrics.length
    drawHistogram(metrics[selectedMetricIndex])
  }
}
drawBars()