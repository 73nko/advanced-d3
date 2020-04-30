import React from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'

import Chart from "./Chart/Chart"
import Circles from "./Chart/Circles"
import Axis from "./Chart/Axis"
import { useChartDimensions, accessorPropsType } from './Chart/utils';

const ScatterPlot = ({ data, xAccessor, yAccessor, xLabel, yLabel }) => {

  return (
    <div className="ScatterPlot placeholder">
    </div>
  )
}

ScatterPlot.propTypes = {
  xAccessor: accessorPropsType,
  yAccessor: accessorPropsType,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
}

ScatterPlot.defaultProps = {
  xAccessor: d => d.x,
  yAccessor: d => d.y,
}
export default ScatterPlot
