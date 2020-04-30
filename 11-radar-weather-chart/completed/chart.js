async function drawChart() {

  // 1. Access data

  const dataset = await d3.json("./../../my_weather_data.json")

  const temperatureMinAccessor = d => d.temperatureMin
  const temperatureMaxAccessor = d => d.temperatureMax
  const uvAccessor = d => d.uvIndex
  const precipitationProbabilityAccessor = d => d.precipProbability
  const precipitationTypeAccessor = d => d.precipType
  const cloudAccessor = d => d.cloudCover
  const dateParser = d3.timeParse("%Y-%m-%d")
  const dateAccessor = d => dateParser(d.date)

  // 2. Create chart dimensions

  const width = 600
  let dimensions = {
    width: width,
    height: width,
    radius: width / 2,
    margin: {
      top: 120,
      right: 120,
      bottom: 120,
      left: 120,
    },
  }
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom
  dimensions.boundedRadius = dimensions.radius
    - ((dimensions.margin.left + dimensions.margin.right) / 2)

  const getCoordinatesForAngle = (angle, offset=1) => [
    Math.cos(angle - Math.PI / 2) * dimensions.boundedRadius * offset,
    Math.sin(angle - Math.PI / 2) * dimensions.boundedRadius * offset,
  ]

  // 3. Draw canvas

  const wrapper = d3.select("#wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
      .style("transform", `translate(${
        dimensions.margin.left + dimensions.boundedRadius
      }px, ${
        dimensions.margin.top + dimensions.boundedRadius
      }px)`)

  const defs = wrapper.append("defs")

  const gradientId = "temperature-gradient"
  const gradient = defs.append("radialGradient")
      .attr("id", gradientId)
  const numberOfStops = 10
  const gradientColorScale = d3.interpolateYlOrRd
  d3.range(numberOfStops).forEach(i => {
    gradient.append("stop")
        .attr("offset", `${i * 100 / (numberOfStops - 1)}%`)
        .attr("stop-color", gradientColorScale(i
          / (numberOfStops - 1)
        ))
  })

  // 4. Create scales

  const angleScale = d3.scaleTime()
    .domain(d3.extent(dataset, dateAccessor))
    .range([0, Math.PI * 2]) // this is in radians

  const radiusScale = d3.scaleLinear()
    .domain(d3.extent([
      ...dataset.map(temperatureMaxAccessor),
      ...dataset.map(temperatureMinAccessor),
    ]))
    .range([0, dimensions.boundedRadius])
    .nice()

  const getXFromDataPoint = (d, offset=1.4) => getCoordinatesForAngle(
    angleScale(dateAccessor(d)),
    offset
  )[0]
  const getYFromDataPoint = (d, offset=1.4) => getCoordinatesForAngle(
    angleScale(dateAccessor(d)),
    offset
  )[1]

  // make sure to use a sqrt scale for circle areas
  const cloudRadiusScale = d3.scaleSqrt()
    .domain(d3.extent(dataset, cloudAccessor))
    .range([1, 10])

  const precipitationRadiusScale = d3.scaleSqrt()
    .domain(d3.extent(dataset, precipitationProbabilityAccessor))
    .range([1, 8])
  const precipitationTypes = ["rain", "sleet", "snow"]
  const precipitationTypeColorScale = d3.scaleOrdinal()
    .domain(precipitationTypes)
    .range(["#54a0ff", "#636e72", "#b2bec3"])

  const temperatureColorScale = d3.scaleSequential()
    .domain(d3.extent([
      ...dataset.map(temperatureMaxAccessor),
      ...dataset.map(temperatureMinAccessor),
    ]))
    .interpolator(gradientColorScale)

  // 6. Draw peripherals

  const peripherals = bounds.append("g")

  const months = d3.timeMonths(...angleScale.domain())
  months.forEach(month => {
    const angle = angleScale(month)
    const [x, y] = getCoordinatesForAngle(angle)

    peripherals.append("line")
      .attr("x2", x)
      .attr("y2", y)
      .attr("class", "grid-line")

    const [labelX, labelY] = getCoordinatesForAngle(angle, 1.38)
    peripherals.append("text")
      .attr("x", labelX)
      .attr("y", labelY)
      .attr("class", "tick-label")
      .text(d3.timeFormat("%b")(month))
      .style("text-anchor",
        Math.abs(labelX) < 5 ? "middle" :
        labelX > 0           ? "start"  :
                               "end"
      )
  })

  const temperatureTicks = radiusScale.ticks(4)
  const gridCircles = temperatureTicks.map(d => (
    peripherals.append("circle")
      .attr("r", radiusScale(d))
      .attr("class", "grid-line")
  ))
  const tickLabelBackgrounds = temperatureTicks.map(d => {
    if (!d) return
    return peripherals.append("rect")
      .attr("y", -radiusScale(d) - 10)
      .attr("width", 40)
      .attr("height", 20)
      .attr("fill", "#f8f9fa")
  })
  const tickLabels = temperatureTicks.map(d => {
    if (!d) return
    return peripherals.append("text")
      .attr("x", 4)
      .attr("y", -radiusScale(d) + 2)
      .attr("class", "tick-label-temperature")
      .html(`${d3.format(".0f")(d)}°F`)
  })

  // 5. Draw data

  const containsFreezing = radiusScale.domain()[0] < 32
  if (containsFreezing) {
    const freezingCircle = bounds.append("circle")
      .attr("r", radiusScale(32))
      .attr("class", "freezing-circle")
  }

  const areaGenerator = d3.areaRadial()
      .angle(d => angleScale(dateAccessor(d)))
      .innerRadius(d => radiusScale(temperatureMinAccessor(d)))
      .outerRadius(d => radiusScale(temperatureMaxAccessor(d)))

  const area = bounds.append("path")
      .attr("class", "area")
      .attr("d", areaGenerator(dataset))
      .style("fill", `url(#${gradientId})`)

  const uvIndexThreshold = 8
  const uvGroup = bounds.append("g")
  const uvOffset = 0.95
  const highUvDays = uvGroup.selectAll("line")
    .data(dataset.filter(d => uvAccessor(d) > uvIndexThreshold))
    .enter().append("line")
      .attr("class", "uv-line")
      .attr("x1", d => getXFromDataPoint(d, uvOffset))
      .attr("x2", d => getXFromDataPoint(d, uvOffset + 0.1))
      .attr("y1", d => getYFromDataPoint(d, uvOffset))
      .attr("y2", d => getYFromDataPoint(d, uvOffset + 0.1))

  const cloudGroup = bounds.append("g")
  const cloudOffset = 1.27
  const cloudDots = cloudGroup.selectAll("circle")
    .data(dataset)
    .enter().append("circle")
      .attr("class", "cloud-dot")
      .attr("cx", d => getXFromDataPoint(d, cloudOffset))
      .attr("cy", d => getYFromDataPoint(d, cloudOffset))
      .attr("r", d => cloudRadiusScale(cloudAccessor(d)))

  const precipitationGroup = bounds.append("g")
  const precipitationOffset = 1.14
  const precipitationDots = precipitationGroup.selectAll("circle")
    .data(dataset.filter(precipitationTypeAccessor))
    .enter().append("circle")
      .attr("class", "precipitation-dot")
      .attr("cx", d => getXFromDataPoint(d, precipitationOffset))
      .attr("cy", d => getYFromDataPoint(d, precipitationOffset))
      .attr("r", d => precipitationRadiusScale(
        precipitationProbabilityAccessor(d)
      ))
      .style("fill", d => precipitationTypeColorScale(
        precipitationTypeAccessor(d)
      ))


  // 6. Draw peripherals, part II

  const annotationGroup = bounds.append("g")

  const drawAnnotation = (angle, offset, text) => {
    const [x1, y1] = getCoordinatesForAngle(angle, offset)
    const [x2, y2] = getCoordinatesForAngle(angle, 1.6)

    annotationGroup.append("line")
        .attr("class", "annotation-line")
        .attr("x1", x1)
        .attr("x2", x2)
        .attr("y1", y1)
        .attr("y2", y2)

    annotationGroup.append("text")
    .attr("class", "annotation-text")
    .attr("x", x2 + 6)
    .attr("y", y2)
    .text(text)
  }

  drawAnnotation(Math.PI * 0.23, cloudOffset, "Cloud Cover")
  drawAnnotation(Math.PI * 0.26, precipitationOffset, "Precipitation")

  drawAnnotation(Math.PI * 0.734, uvOffset + 0.05, `UV Index over ${
    uvIndexThreshold
  }`)
  drawAnnotation(Math.PI * 0.7, 0.5, "Temperature")
  if (containsFreezing) {
    drawAnnotation(
      Math.PI * 0.9,
      radiusScale(32) / dimensions.boundedRadius,
      "Freezing Temperatures"
    )
  }

  precipitationTypes.forEach((precipitationType, index) => {
    const labelCoordinates = getCoordinatesForAngle(
      Math.PI * 0.26,
      1.6
    )
    annotationGroup.append("circle")
        .attr("cx", labelCoordinates[0] + 15)
        .attr("cy", labelCoordinates[1] + (16 * (index + 1)))
        .attr("r", 4)
        .style("opacity", 0.7)
        .attr("fill", precipitationTypeColorScale(precipitationType))
    annotationGroup.append("text")
        .attr("class", "annotation-text")
        .attr("x", labelCoordinates[0] + 25)
        .attr("y", labelCoordinates[1] + (16 * (index + 1)))
        .text(precipitationType)
  })

  // 7. Set up interactions

  const listenerCircle = bounds.append("circle")
      .attr("class", "listener-circle")
      .attr("r", dimensions.width / 2)
      .on("mousemove", onMouseMove)
      .on("mouseleave", onMouseLeave)

  const tooltip = d3.select("#tooltip")
  const tooltipLine = bounds.append("path")
      .attr("class", "tooltip-line")

  function onMouseMove(e) {
    const [x, y] = d3.mouse(this)

    const getAngleFromCoordinates = (x, y) => Math.atan2(y, x)
    let angle = getAngleFromCoordinates(x, y) + Math.PI / 2
    if (angle < 0) angle = (Math.PI * 2) + angle

    const tooltipArcGenerator = d3.arc()
      .innerRadius(0)
      .outerRadius(dimensions.boundedRadius * 1.6)
      .startAngle(angle - 0.015)
      .endAngle(angle + 0.015)

    tooltipLine.attr("d", tooltipArcGenerator())
        .style("opacity", 1)

    const outerCoordinates = getCoordinatesForAngle(angle, 1.6)
    tooltip.style("opacity", 1)
        .style("transform", `translate(calc(${
          outerCoordinates[0] < - 50 ? "40px - 100" :
          outerCoordinates[0] > 50 ? "-40px + 0" :
          "-50"
        }% + ${
          outerCoordinates[0]
            + dimensions.margin.top
            + dimensions.boundedRadius
        }px), calc(${
          outerCoordinates[1] < - 50 ? "40px - 100" :
          outerCoordinates[1] > 50 ? "-40px + 0" :
          "-50"
        }% + ${
          outerCoordinates[1]
            + dimensions.margin.top
            + dimensions.boundedRadius
        }px))`)

    const date = angleScale.invert(angle)
    const dateString = d3.timeFormat("%Y-%m-%d")(date)
    const dataPoint = dataset.filter(d => d.date == dateString)[0]
    if (!dataPoint) return

    tooltip.select("#tooltip-date")
        .text(d3.timeFormat("%B %-d")(date))
    tooltip.select("#tooltip-temperature-min")
        .html(`${d3.format(".1f")(
          temperatureMinAccessor(dataPoint))
        }°F`)
    tooltip.select("#tooltip-temperature-max")
        .html(`${d3.format(".1f")(
          temperatureMaxAccessor(dataPoint))
        }°F`)
    tooltip.select("#tooltip-uv")
        .text(uvAccessor(dataPoint))
    tooltip.select("#tooltip-cloud")
        .text(cloudAccessor(dataPoint))
    tooltip.select("#tooltip-precipitation")
        .text(d3.format(".0%")(
          precipitationProbabilityAccessor(dataPoint)
        ))
    tooltip.select("#tooltip-precipitation-type")
        .text(precipitationTypeAccessor(dataPoint))
    tooltip.select(".tooltip-precipitation-type")
        .style("color", precipitationTypeAccessor(dataPoint)
          ? precipitationTypeColorScale(
              precipitationTypeAccessor(dataPoint)
            )
          : "#dadadd")
    tooltip.select("#tooltip-temperature-min")
        .style("color", temperatureColorScale(
          temperatureMinAccessor(dataPoint)
        ))
    tooltip.select("#tooltip-temperature-max")
        .style("color", temperatureColorScale(
          temperatureMaxAccessor(dataPoint)
        ))
  }

  function onMouseLeave() {
    tooltip.style("opacity", 0)
    tooltipLine.style("opacity", 0)
  }

}
drawChart()