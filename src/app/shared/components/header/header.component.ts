import { Component, inject, Input } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent {
  @Input() title!: string;
  @Input() backButton!: string;
  @Input() isModal: boolean;

  utilsSvc = inject(UtilsService);

  dismissModal() {
    this.utilsSvc.dismissModal();
  }

}
