async function createEvent() {
  const rectColors = [
    "yellowgreen",
    "cornflowerblue",
    "seagreen",
    "slateblue",
  ]

  // create and bind data to our rects
  const rects = d3.select("#svg")
    .selectAll(".rect")
    .data(rectColors)
    .enter().append("rect")
      .attr("height", 100)
      .attr("width", 100)
      .attr("x", (d,i) => i * 110)
      .attr("fill", "lightgrey")

  // create listeners
  // rect.on("mouseenter", function (datum) {
  rects
      .on("mousemove", function(datum) {
        d3.select(this).style("fill", datum)
      })
      .on("mouseout", function() {
        d3.select(this).style("fill", "lightgrey")
      })

    // destroy our events after 3 seconds
    setTimeout(() => {
      rects
        .dispatch("mouseout")
        .on("mousemove", null)
        .on("mouseout", null)
    }, 3000)
}
createEvent()