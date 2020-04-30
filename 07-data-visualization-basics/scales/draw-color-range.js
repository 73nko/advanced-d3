const drawColorRange = (container, colorScale, scaleName) => {
  const height = 30
  const width = 300

  const svg = container.append("svg")
      .attr("height", height)
      .attr("width", width)

  const gradientId = `gradient--${scaleName}`
  const defs = svg.append("defs")
  const gradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%")
      .attr("spreadMethod", "pad")

  if (typeof colorScale == "function") {
      const numberOfStops = 30
      const stops = new Array(numberOfStops).fill(0).map((d,i) => i * (1 / (numberOfStops - 1)))

      stops.forEach(stop => {
          gradient.append('stop')
              .attr('offset', stop)
              .attr('stop-color', colorScale(stop))
              .attr('stop-opacity', 1)
      })
  } else if (typeof colorScale == "object") {
      // support
      colorScale.forEach((color, i) => {
          gradient.append('stop')
              .attr('offset', i * (1 / (colorScale.length - 1)))
              .attr('stop-color', color)
              .attr('stop-opacity', 1)
          gradient.append('stop')
              .attr('offset', (i + 1) * (1 / (colorScale.length - 1)))
              .attr('stop-color', color)
              .attr('stop-opacity', 1)
      })
  } else {
      console.log("drawColorRange can only handle scales that are functions or arrays")
  }

  const rect = svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", `url(#${gradientId})`)
}