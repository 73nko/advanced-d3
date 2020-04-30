import React from "react"
import PropTypes from "prop-types"
import { accessorPropsType, callAccessor } from "./utils";

const Bars = ({ data, keyAccessor, xAccessor, yAccessor, widthAccessor, heightAccessor, ...props }) => (
  <React.Fragment>
  </React.Fragment>
)

Bars.propTypes = {
  data: PropTypes.array,
  keyAccessor: accessorPropsType,
  xAccessor: accessorPropsType,
  yAccessor: accessorPropsType,
  widthAccessor: accessorPropsType,
  heightAccessor: accessorPropsType,
}

Bars.defaultProps = {
}

export default Bars

