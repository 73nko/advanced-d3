async function drawBars() {

  // 1. Access data

  const dataset = await d3.json("./../../my_weather_data.json")

  const dateParser = d3.timeParse("%Y-%m-%d")
  const formatAsMonth = d3.timeFormat("%m")
  const dataByMonth = d3.nest()
    .key(d => formatAsMonth(dateParser(d.date)))
    .entries(dataset)

  const yAccessor = d => d.temperatureMax
  const monthAccessor = d => d.month

  const dataByMonthWithStats = dataByMonth.map(month => {
    const monthYValues = month.values.map(yAccessor).sort((a,b) => a - b)
    const q1 = d3.quantile(monthYValues, 0.25)
    const median = d3.median(monthYValues)
    const q3 = d3.quantile(monthYValues, 0.75)
    const iqr = q3 - q1
    const [min, max] = d3.extent(monthYValues)
    const rangeMin = d3.max([min, q1 - iqr * 1.5])
    const rangeMax = d3.min([max, q3 + iqr * 1.5])
    const outliers = month.values.filter(d => yAccessor(d) < rangeMin || yAccessor(d) > rangeMax)

    return {
      ...month,
      month: +month.key,
      q1, median, q3, iqr, min, max, rangeMin, rangeMax, outliers
    }
  })

  // 2. Create chart dimensions

  const width = 700
  let dimensions = {
    width: width,
    height: width * 0.6,
    margin: {
      top: 30,
      right: 10,
      bottom: 30,
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

  // 4. Create scales

  const xScale = d3.scaleLinear()
    .domain([1, dataByMonth.length])
    .rangeRound([0, dimensions.boundedWidth])
    .nice()

  const binsGenerator = d3.histogram()
    .value(monthAccessor)
    .thresholds(dataByMonth.length)

  const bins = binsGenerator(dataByMonthWithStats)

  const yScale = d3.scaleLinear()
    .domain([
      0,
      d3.max(dataset, yAccessor),
    ])
    .range([dimensions.boundedHeight, 0])
    .nice()

  // 5. Draw data

  const barPadding = 6

  let binGroups = bounds.selectAll(".bin")
    .data(bins)

  binGroups.exit()
      .remove()

  const newBinGroups = binGroups.enter().append("g")
      .attr("class", "bin")

  // update binGroups to include new points
  binGroups = newBinGroups.merge(binGroups)

  const getBarWidth = bar => xScale(bar.x1) - xScale(bar.x0)
  const rangeLines = binGroups.append("line")
      .attr("class", "line")
      .attr("x1", d => xScale(d.x0) + getBarWidth(d) / 2)
      .attr("x2", d => xScale(d.x0) + getBarWidth(d) / 2)
      .attr("y1", d => yScale(d[0].rangeMin))
      .attr("y2", d => yScale(d[0].rangeMax))

  const barRects = binGroups.append("rect")
      .attr("x", d => xScale(d.x0) + barPadding / 2)
      .attr("y", d => yScale(d[0].q3))
      .attr("width", d => getBarWidth(d) - barPadding)
      .attr("height", d => yScale(d[0].q1) - yScale(d[0].q3))

    const medians = binGroups.append("line")
      .attr("class", "median")
      .attr("x1", d => xScale(d.x0) + barPadding / 2)
      .attr("x2", d => xScale(d.x0) + barPadding / 2 + getBarWidth(d) - barPadding)
      .attr("y1", d => yScale(d[0].median))
      .attr("y2", d => yScale(d[0].median))

    const rangeMins = binGroups.append("line")
      .attr("class", "line")
      .attr("x1", d => xScale(d.x0) + barPadding / 2 + getBarWidth(d) * 0.3)
      .attr("x2", d => xScale(d.x1) - barPadding / 2 - getBarWidth(d) * 0.3)
      .attr("y1", d => yScale(d[0].rangeMin))
      .attr("y2", d => yScale(d[0].rangeMin))

    const rangeMaxes = binGroups.append("line")
      .attr("class", "line")
      .attr("x1", d => xScale(d.x0) + barPadding / 2 + getBarWidth(d) * 0.3)
      .attr("x2", d => xScale(d.x1) - barPadding / 2 - getBarWidth(d) * 0.3)
      .attr("y1", d => yScale(d[0].rangeMax))
      .attr("y2", d => yScale(d[0].rangeMax))

    const outliers = binGroups.append("g")
        .attr("transform", d => `translate(${xScale(d.x0) + getBarWidth(d) / 2}, 0)`)
      .selectAll("circle")
      .data(d => d[0].outliers)
      .enter().append("circle")
        .attr("class", "outlier")
        .attr("cy", d => yScale(yAccessor(d)))
        .attr("r", 2)

    const parseMonth = d3.timeParse("%m")
    const formatMonth = d3.timeFormat("%b")
    const labels = binGroups.append("text")
        .attr("class", "label")
        .attr("transform", d => `translate(${xScale(d.x0) + getBarWidth(d) / 2}, -15)`)
        .text(d => formatMonth(parseMonth(d[0].month)))

  // 6. Draw peripherals

  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
    .ticks(4)

  const yAxis = bounds.append("g")
      .attr("class", "y-axis")
    .call(yAxisGenerator)

  const yAxisLabel = yAxis.append("text")
      .attr("class", "y-axis-label")
      .attr("x", -dimensions.boundedHeight / 2)
      .attr("y", -dimensions.margin.left + 10)
      .html("Maximum Temperature (&deg;F)")
}
drawBars()