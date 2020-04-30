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

  // your code here

}
createEvent()