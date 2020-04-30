import dimensions from "./dimensions.js";

const dateParser = d3.timeParse("%Y-%m-%d");
const yAccessor = ({ temperatureMax }) => temperatureMax;
const xAccessor = ({ date }) => dateParser(date);
const yScale = d3.scaleLinear();
const xScale = d3.scaleTime();
const lineGenerator = d3.line();

async function drawLineChart() {
  // Fetching data
  const dataset = await d3.json("../../my_weather_data.json");

  // We create the wrapper element and give it dimensions
  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  // we create a bound element and give it the dimensions
  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px`
    );

  // Creating the x and y scales
  yScale
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0]);

  xScale
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth]);

  // A rect tos show the freefinz area
  const freezingTemperaturePlacement = yScale(32);
  const freefinzTemperatures = bounds
    .append("rect")
    .attr("x", 0)
    .attr("width", dimensions.boundedWidth)
    .attr("y", freezingTemperaturePlacement)
    .attr("height", dimensions.boundedHeight - freezingTemperaturePlacement)
    .attr("fill", "#e0f3f3");

  // creating our line
  lineGenerator.x((d) => xScale(xAccessor(d))).y((d) => yScale(yAccessor(d)));
  const line = bounds.append("path").attr("d", lineGenerator(dataset));

  // Drawinng the axes
  const yAxisGenerator = d3.axisLeft().scale(yScale);
  const xAxisGenerator = d3.axisBottom().scale(xScale);
  const yAxis = bounds.append("g").call(yAxisGenerator);
  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator)
    // we need to position the x axis at the bottom manualy
    .style("transform", `translatey(${dimensions.boundedHeight}px)`);

  // style our line
  line.attr("fill", "none").attr("stroke", "#af9358").attr("stroke-width", 2);
}

drawLineChart();
