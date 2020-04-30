async function drawChart() {
  // load data
  let dataset = await d3.json("./../../my_weather_data.json")
  const dateParser = d3.timeParse("%Y-%m-%d")
  const dateAccessor = d => dateParser(d.date)
  dataset = dataset.sort((a,b) => dateAccessor(a) - dateAccessor(b)).slice(0, 10)

  // set data constants
  const xAccessor = d => d.dewPoint
  const yAccessor = d => d.humidity

  const width = d3.min([
    window.innerWidth * 0.95,
    window.innerHeight * 0.95,
  ])
  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  // create chart area
  const wrapper = d3.select("#wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
      .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  bounds.append("g")
      .attr("class", "x-axis")
    .append("text")
      .attr("class", "x-axis-label")
  bounds.append("g")
      .attr("class", "y-axis")
    .append("text")
      .attr("class", "y-axis-label")

  function drawScatter(dataset) {
    // create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, xAccessor))
      .range([0, dimensions.boundedWidth])
      .nice()

    const yScale = d3.scaleLinear()
      .domain(d3.extent(dataset, yAccessor))
      .range([dimensions.boundedHeight, 0])
      .nice()

    // draw the points
    const dots = bounds.selectAll("circle")
      // .data(dataset)
      .data(dataset, d => d.date)

    const newDots = dots.enter().append("circle")
        .attr("r", 0)

    newDots.merge(dots)
    .transition().duration(1000)
      .attr("cx", d => xScale(xAccessor(d)))
      .attr("cy", d => yScale(yAccessor(d)))
        .attr("r", 5)

    dots.exit()
        .style("fill", "red")
    .transition().duration(1000)
        .attr("r", 0)
      .remove()

    // draw axes
    const xAxisGenerator = d3.axisBottom()
      .scale(xScale)

    const xAxis = bounds.select(".x-axis")
      .call(xAxisGenerator)
        .style("transform", `translateY(${dimensions.boundedHeight}px)`)

    const xAxisLabel = xAxis.select(".x-axis-label")
        .attr("x", dimensions.boundedWidth / 2)
        .attr("y", dimensions.margin.bottom - 10)
        .html("dew point (&deg;F)")

    const yAxisGenerator = d3.axisLeft()
      .scale(yScale)
      .ticks(4)

    const yAxis = bounds.select(".y-axis")
      .call(yAxisGenerator)

    const yAxisLabel = yAxis.select(".y-axis-label")
        .attr("x", -dimensions.boundedHeight / 2)
        .attr("y", -dimensions.margin.left + 10)
        .text("relative humidity")
  }
  drawScatter(dataset)

  // update the line every 1.5 seconds
  setInterval(addNewDay, 1500)
  function addNewDay() {
    dataset = [...dataset.slice(1), generateNewDataPoint(dataset)]
    drawScatter(dataset)
  }

  function generateNewDataPoint(dataset) {
    const lastDataPoint = dataset[dataset.length - 1]
    const nextDay = d3.timeDay.offset(dateAccessor(lastDataPoint), 1)

    return {
      date: d3.timeFormat("%Y-%m-%d")(nextDay),
      dewPoint: Math.random() * 50,
      humidity: Math.random() * 0.5 + 0.5,
    }
  }
}
drawChart()