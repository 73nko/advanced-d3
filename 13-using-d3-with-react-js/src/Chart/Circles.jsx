import React from "react"
import PropTypes from "prop-types"
import { accessorPropsType } from "./utils";

const Circles = ({ data, keyAccessor, xAccessor, yAccessor, radius }) => (
  <React.Fragment>
  </React.Fragment>
)

Circles.propTypes = {
  data: PropTypes.array,
  keyAccessor: accessorPropsType,
  xAccessor: accessorPropsType,
  yAccessor: accessorPropsType,
  radius: accessorPropsType,
}

Circles.defaultProps = {
  radius: 5,
}

export default Circles
