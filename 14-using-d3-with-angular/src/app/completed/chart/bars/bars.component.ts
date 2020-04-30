import { Component, Input } from '@angular/core'
import { useAccessor } from '../utils'
import { AccessorType } from '../../../utils/types'

@Component({
  selector: '[appBars]',
  template: `
    <svg:rect
      *ngFor="let bar of data; trackBy: keyAccessor"
      [attr.x]="useAccessor(xAccessor, bar, $index)"
      [attr.y]="useAccessor(yAccessor, bar, $index)"
      [attr.width]="max(useAccessor(widthAccessor, bar, $index), 0)"
      [attr.height]="max(useAccessor(heightAccessor, bar, $index), 0)"
      [attr.fill]="fill || '#9980FA'">
    </svg:rect>
  `,
  styleUrls: ['./bars.component.css']
})
export class BarsComponent {
  @Input() data: object[]
  @Input() keyAccessor: AccessorType
  @Input() xAccessor: AccessorType
  @Input() yAccessor: AccessorType
  @Input() widthAccessor: AccessorType
  @Input() heightAccessor: AccessorType
  @Input() fill?: string
  private useAccessor: Function = useAccessor
  private max = Math.max
}
