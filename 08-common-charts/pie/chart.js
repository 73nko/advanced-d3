async function drawPie() {

  // 1. Access data

  const dataset = await d3.json("./../../my_weather_data.json")

  const iconAccessor = d => d.icon
  const datasetByIcon = d3.nest()
    .key(iconAccessor)
    .entries(dataset)
    .sort((a,b) => b.values.length - a.values.length)
  const combinedDatasetByIcon = [
    ...datasetByIcon.slice(0, 4),
    {
      key: "other",
      values: d3.merge(datasetByIcon.slice(4).map(d => d.values))
    }
  ]

  // 2. Create chart dimensions

  const width = 500
  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 60,
      right: 60,
      bottom: 60,
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

  // 4. Create scales

  const arcGenerator = d3.pie()
      .padAngle(0.005)
      .value(d => d.values.length)

  const arcs = arcGenerator(combinedDatasetByIcon)

  const interpolateWithSteps = numberOfSteps => new Array(numberOfSteps).fill(null).map((d, i) => i / (numberOfSteps - 1))
  const colorScale = d3.scaleOrdinal()
      .domain(arcs.sort((a,b) => a.data.values.length - b.data.values.length).map(d => d.data.key))
      .range(interpolateWithSteps(datasetByIcon.length).map(d3.interpolateLab("#f3a683", "#3dc1d3")))

  const radius = dimensions.boundedWidth / 2
  const arc = d3.arc()
    .innerRadius(radius * 0.7) // set to 0 for a pie chart
    .outerRadius(radius)

  // 5. Draw data

  const centeredGroup = bounds.append("g")
      .attr("transform", `translate(${dimensions.boundedHeight / 2}, ${dimensions.boundedWidth / 2})`)

  centeredGroup.selectAll("path")
    .data(arcs)
    .enter().append("path")
      .attr("fill", d => d.data.key == "other" ? "#dadadd" : colorScale(d.data.key))
      .attr("d", arc)
    .append("title")
      .text(d => d.data.key)

  const iconGroups = centeredGroup.selectAll("g")
    .data(arcs)
      .enter().append("g")
      .attr("transform", d => `translate(${arc.centroid(d)})`)

  iconGroups.append("path")
      .attr("class", "icon")
      .attr("d", d => iconPaths[d.data.key])
      .attr("transform", d => `translate(-25, -32) scale(0.5)`)

  // 6. Draw peripherals

  bounds.append("text")
      .attr("class", "title")
      .text("2018 Weather")
      .attr("transform", `translate(${dimensions.boundedWidth / 2}, ${dimensions.boundedHeight / 2})`)

  bounds.append("text")
      .attr("class", "title-small")
      .text("New York City, NY")
      .attr("transform", `translate(${dimensions.boundedWidth / 2}, ${dimensions.boundedHeight / 2 + 30})`)

  iconGroups.append("text")
      .attr("class", "label")
      .text(d => d.data.values.length)
      .attr("transform", d => `translate(0, 20)`)

}
drawPie()