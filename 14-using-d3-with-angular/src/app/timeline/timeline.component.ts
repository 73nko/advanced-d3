import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core'
import * as d3 from "d3"
import { getUniqueId } from '../chart/utils';
import { DimensionsType, ScaleType, AccessorType } from '../utils/types';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})
export class TimelineComponent {
  @Input() data: object[]
  @Input() label: string
  @Input() xAccessor: AccessorType
  @Input() yAccessor: AccessorType

}
