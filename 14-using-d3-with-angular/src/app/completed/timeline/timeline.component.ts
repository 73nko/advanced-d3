import { Component, Input, ViewChild, ElementRef, AfterContentInit, OnChanges, SimpleChanges, HostListener } from '@angular/core'
import * as d3 from "d3"
import { getUniqueId } from '../chart/utils'
import { DimensionsType, ScaleType, AccessorType } from '../../utils/types'

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})
export class TimelineComponent implements AfterContentInit, OnChanges {
  @Input() data: Array<object>
  @Input() label: string
  @Input() xAccessor: AccessorType
  @Input() yAccessor: AccessorType
  public dimensions: DimensionsType
  public xScale: ScaleType
  public yScale: ScaleType
  public xAccessorScaled: AccessorType
  public yAccessorScaled: AccessorType
  public y0AccessorScaled: AccessorType
  public formatDate: (date: object) => string = d3.timeFormat("%-b %-d")
  public gradientId: string = getUniqueId("Timeline-gradient")
  public gradientColors: string[] = ["rgb(226, 222, 243)", "#f8f9fa"]
  @ViewChild('container', {static: true}) container: ElementRef

  constructor() {
    this.dimensions = {
      marginTop: 40,
      marginRight: 30,
      marginBottom: 75,
      marginLeft: 75,
      height: 300,
      width: 600,
    }
    this.dimensions = {
      ...this.dimensions,
      boundedHeight: Math.max(this.dimensions.height
        - this.dimensions.marginTop
        - this.dimensions.marginBottom, 0),
      boundedWidth: Math.max(this.dimensions.width
        - this.dimensions.marginLeft
        - this.dimensions.marginRight, 0),
    }
  }

  @HostListener('window:resize') windowResize() {
    this.updateDimensions()
  }

  updateDimensions() {
    const width = this.container.nativeElement.offsetWidth
    this.dimensions.width = width
    this.dimensions.boundedWidth = Math.max(
      this.dimensions.width
        - this.dimensions.marginLeft
        - this.dimensions.marginRight,
      0
    )
    this.updateScales()
  }

  ngAfterContentInit() {
    this.updateDimensions()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateScales()
  }

  updateScales() {
    this.xScale = d3.scaleTime()
      .domain(d3.extent(this.data, this.xAccessor))
      .range([0, this.dimensions.boundedWidth])

    this.yScale = d3.scaleLinear()
      .domain(d3.extent(this.data, this.yAccessor))
      .range([this.dimensions.boundedHeight, 0])
      .nice()

    this.xAccessorScaled = d => this.xScale(this.xAccessor(d))
    this.yAccessorScaled = d => this.yScale(this.yAccessor(d))
    this.y0AccessorScaled = this.yScale(this.yScale.domain()[0])
  }

}
