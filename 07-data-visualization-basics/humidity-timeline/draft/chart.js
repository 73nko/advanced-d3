async function drawLineChart() {

  // 1. Access data

  let dataset = await d3.json("./../../../my_weather_data.json")

  const yAccessor = d => d.humidity
  const dateParser = d3.timeParse("%Y-%m-%d")
  const dateFormatter = d3.timeFormat("%Y-%m-%d")
  const xAccessor = d => dateParser(d.date)
  dataset = dataset.sort((a,b) => xAccessor(a) - xAccessor(b))
  const weeks = d3.timeWeeks(xAccessor(dataset[0]), xAccessor(dataset[dataset.length - 1]))

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
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

  const defs = bounds.append("defs")

  // 4. Create scales

  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice()

  const xScale = d3.scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])

  // create grid marks
  const yAxisGeneratorGridMarks = d3.axisLeft(yScale)
      .ticks()
      .tickSize(-dimensions.boundedWidth)
      .tickFormat("")

  const yAxisGridMarks = bounds.append("g")
      .attr("class", "y-axis-grid-marks")
    .call(yAxisGeneratorGridMarks)

  // 5. Draw data

  const dots = bounds.selectAll(".dot")
    .data(dataset)
    .enter().append("circle")
      .attr("cx", d => xScale(xAccessor(d)))
      .attr("cy", d => yScale(yAccessor(d)))
      .attr("r", 2)
      .attr("class", "dot")

  const lineGenerator = d3.area()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)))
    .curve(d3.curveBasis)

  const line = bounds.append("path")
      .attr("class", "line")
      .attr("d", lineGenerator(dataset))


  // 6. Draw peripherals

  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
    .ticks()

  const yAxis = bounds.append("g")
      .attr("class", "y-axis")
    .call(yAxisGenerator)

  const yAxisLabel = yAxis.append("text")
      .attr("y", -dimensions.margin.left + 10)
      .attr("x", -dimensions.boundedHeight / 2)
      .attr("class", "y-axis-label")
      .text("relative humidity")

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)
    .ticks()

  const xAxis = bounds.append("g")
      .attr("class", "x-axis")
      .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .call(xAxisGenerator)
}
drawLineChart()


function downsampleData(data, xAccessor, yAccessor) {
  const weeks = d3.timeWeeks(xAccessor(data[0]), xAccessor(data[data.length - 1]))

  return weeks.map((week, index) => {
    const weekEnd = weeks[index + 1] || new Date()
    const days = data.filter(d => xAccessor(d) > week && xAccessor(d) <= weekEnd)
    return {
      date: d3.timeFormat("%Y-%m-%d")(week),
      humidity: d3.mean(days, yAccessor),
    }
  })
}