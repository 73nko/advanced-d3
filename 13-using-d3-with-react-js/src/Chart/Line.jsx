import React from "react"
import PropTypes from "prop-types"
import * as d3 from "d3"
import { accessorPropsType } from "./utils";

const Line = ({ type, data, xAccessor, yAccessor, y0Accessor, interpolation, ...props }) => {
  return (
    <path {...props}
      className={`Line Line--type-${type}`}
    />
  )
}

Line.propTypes = {
  type: PropTypes.oneOf(["line", "area"]),
  data: PropTypes.array,
  xAccessor: accessorPropsType,
  yAccessor: accessorPropsType,
  y0Accessor: accessorPropsType,
  interpolation: PropTypes.func,
}

Line.defaultProps = {
  type: "line",
  y0Accessor: 0,
  interpolation: d3.curveMonotoneX,
}

export default Line
