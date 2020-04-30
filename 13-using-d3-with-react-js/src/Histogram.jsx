import React from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'

import Chart from "./Chart/Chart"
import Bars from "./Chart/Bars"
import Axis from "./Chart/Axis"
import Gradient from "./Chart/Gradient"
import { useChartDimensions, accessorPropsType, useUniqueId } from './Chart/utils';

const gradientColors = ["#9980FA", "rgb(226, 222, 243)"]
const Histogram = ({ data, xAccessor, label }) => {

  return (
    <div className="Histogram placeholder">
    </div>
  )
}

Histogram.propTypes = {
  xAccessor: accessorPropsType,
  yAccessor: accessorPropsType,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
}

Histogram.defaultProps = {
  xAccessor: d => d.x,
  yAccessor: d => d.y,
}
export default Histogram
