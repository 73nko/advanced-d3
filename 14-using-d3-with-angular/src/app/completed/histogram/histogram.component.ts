import { Component, Input, ViewChild, ElementRef, AfterContentInit, OnChanges, SimpleChanges, HostListener } from '@angular/core'
import * as d3 from "d3"
import { DimensionsType, getUniqueId } from '../chart/utils';
import { ScaleType, AccessorType } from '../../utils/types';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.css'],
})
export class HistogramComponent implements AfterContentInit, OnChanges {
  @Input() data: Array<object>
  @Input() label: string
  @Input() xAccessor: AccessorType
  public dimensions: DimensionsType
  public xAccessorScaled: AccessorType
  public yAccessorScaled: AccessorType
  public xScale: ScaleType
  public yScale: ScaleType
  public widthAccessorScaled: AccessorType
  public heightAccessorScaled: AccessorType
  public keyAccessor: AccessorType
  public bins: object[]
  public gradientId: string = getUniqueId("Histogram-gradient")
  public gradientColors: string[] = ["#9980FA", "rgb(226, 222, 243)"]
  @ViewChild('container', {static: true}) container: ElementRef

  constructor() {
    this.dimensions = {
      marginTop: 40,
      marginRight: 30,
      marginBottom: 75,
      marginLeft: 75,
      height: 500,
      width: 600,
    }
    this.dimensions = {
      ...this.dimensions,
      boundedHeight: Math.max(this.dimensions.height - this.dimensions.marginTop - this.dimensions.marginBottom, 0),
      boundedWidth: Math.max(this.dimensions.width - this.dimensions.marginLeft - this.dimensions.marginRight, 0),
    }
  }

  @HostListener('window:resize') windowResize() {
    this.updateDimensions()
  }

  updateDimensions() {
    const width = this.container.nativeElement.offsetWidth
    this.dimensions.width = this.container.nativeElement.offsetWidth
    this.dimensions.boundedWidth = Math.max(this.dimensions.width - this.dimensions.marginLeft - this.dimensions.marginRight, 0)
    this.updateScales()
  }

  ngAfterContentInit() {
    this.updateDimensions()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateScales()
  }

  updateScales() {
    if (!this.data) return

    const numberOfThresholds = 9

    this.xScale = d3.scaleLinear()
      .domain(d3.extent(this.data, this.xAccessor))
      .range([0, this.dimensions.boundedWidth])
      .nice(numberOfThresholds)

    const binsGenerator = d3.histogram()
      .domain(this.xScale.domain())
      .value(this.xAccessor)
      .thresholds(this.xScale.ticks(numberOfThresholds))

    this.bins = binsGenerator(this.data)

    const yAccessor = d => d.length
    this.yScale = d3.scaleLinear()
      .domain([0, d3.max(this.bins, yAccessor)])
      .range([this.dimensions.boundedHeight, 0])
      .nice()

    const barPadding = 2

    this.xAccessorScaled = d => this.xScale(d.x0) + barPadding
    this.yAccessorScaled = d => this.yScale(yAccessor(d))
    this.widthAccessorScaled = d => this.xScale(d.x1) - this.xScale(d.x0) - barPadding
    this.heightAccessorScaled = d => this.dimensions.boundedHeight - this.yScale(yAccessor(d))
    this.keyAccessor = i => i
  }

}
