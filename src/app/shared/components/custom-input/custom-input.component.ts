import { Component, input, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  standalone: false
})
export class CustomInputComponent {
  @Input() control!: FormControl;
  @Input() type!: string;
  @Input()label!: string;
  @Input() autocomplete!: string;
  @Input() icon!: string;

}