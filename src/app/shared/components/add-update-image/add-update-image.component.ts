import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-image',
  templateUrl: './add-update-image.component.html',
  styleUrls: ['./add-update-image.component.scss'],
  standalone: false,
})
export class AddUpdateImageComponent  implements OnInit {

  form = new FormGroup({
    id: new FormControl(''),
    image: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
  })

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService)

  user = {} as User;

  ngOnInit() {

    this.user = this.utilsSvc.getFromLocalStorage('user');
  }

   // -----Tomar/Seleccionar imagen ---
  async takeImage() {
    const dataUrl = (await this.utilsSvc.takePicture('Imagen de perfil')).dataUrl;
    this.form.controls.image.setValue(dataUrl);
  }

  async submit() {
    if (this.form.valid) {

      let path = `users/${this.user.uid}/image`

      const loading = await this.utilsSvc.loading();
      await loading.present();

      let dataUrl = this.form.value.image;
      let imagePath = `${this.user.uid}/${Date.now()}`;
      let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
      this.form.controls.image.setValue(imageUrl);

      delete this.form.value.id

      this.firebaseSvc.updateDocument(path, this.form.value).then(async res => {

        this.utilsSvc.dismissModal({ success: true });

        this.utilsSvc.presentToast({
          message: 'Perfil creado exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        })

      }).catch(error => {
        console.log(error);

        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })

      }).finally(() => {
        loading.dismiss();
      })
    
    }
  }
}