import 'zone.js'
import { Component } from '@angular/core'
import * as d3 from "d3"
import { getTimelineData, getScatterData } from "./utils/dummyData"
import { AccessorType } from './utils/types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  timelineData: Array<timelineDataPoint>
  scatterData: Array<scatterDataPoint>

  parseDate: (value: string) => object
  dateAccessor: AccessorType
  temperatureAccessor: AccessorType
  humidityAccessor: AccessorType

  constructor() {
    this.timelineData = []
    this.scatterData = []
  }

  ngOnInit() {
    this.parseDate = d3.timeParse("%m/%d/%Y")
    this.dateAccessor = d => this.parseDate(d.date)
    this.temperatureAccessor = d => d.temperature
    this.humidityAccessor = d => d.humidity
    this.getData()
    setInterval(() => this.getData(), 4000)
  }


  getData(): void {
    this.timelineData = getTimelineData()
    this.scatterData = getScatterData()
  }
}

interface timelineDataPoint {
  date: string
  temperature: number
  key: any
}

interface scatterDataPoint {
  temperature: number
  humidity: number
  key: any
}