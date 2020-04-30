import React, { useRef } from "react"
import PropTypes from "prop-types"
import * as d3 from 'd3'
import { useChartDimensions } from "./Chart";

const Axis = ({ dimension, scale, formatTick, ...props }) => {
  const dimensions = useChartDimensions()

  const axisGeneratorsByDimension = {
    x: "axisBottom",
    y: "axisLeft",
  }
  const axisGenerator = d3[axisGeneratorsByDimension[dimension]]()
    .scale(scale)
    .tickFormat(formatTick)

  const ref = useRef()
  if (ref.current) {
    d3.select(ref.current)
      .transition()
      .call(axisGenerator)
  }

  return (
      <g {...props}
        ref={ref}
        transform={
          dimension === "x"
            ? `translate(0, ${dimensions.boundedHeight})`
            : null
        }
      />
  )
}

Axis.propTypes = {
  dimension: PropTypes.oneOf(["x", "y"]),
  scale: PropTypes.func,
}

Axis.defaultProps = {
  dimension: "x",
  scale: null,
}

export default Axis