import { Component, Input, SimpleChanges, OnChanges } from '@angular/core'

@Component({
  selector: '[appGradient]',
  template: `
    <svg:linearGradient
      [id]="id"
      gradientUnits="userSpaceOnUse"
      spreadMethod="pad"
      [attr.x1]="x1"
      [attr.x2]="x2"
      [attr.y1]="y1"
      [attr.y2]="y2">
      <svg:stop
        *ngFor="let stop of colorStops"
        [attr.offset]="stop.offset"
        [attr.stop-color]="stop.color">
      </svg:stop>
    </svg:linearGradient>
  `,
})
export class GradientComponent implements OnChanges {
  @Input() id: string
  @Input() colors: string[]
  @Input() x1?: string[]
  @Input() x2?: string[]
  @Input() y1?: string[]
  @Input() y2?: string[]
  private colorStops: object[]

  ngOnChanges(changes: SimpleChanges): void {
    this.updateColorStops()
  }

  updateColorStops() {
    this.colorStops = this.colors.map((color, index) => ({
      offset: `${index * 100 / (this.colors.length - 1)}%`,
      color: color,
    }))
  }
}
