import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Imagen } from 'src/app/models/image.model';
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

  @Input() image : Imagen

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
    if (this.image) this.form.setValue(this.image);
  }

   // -----Tomar/Seleccionar imagen ---
  async takeImage() {
    const dataUrl = (await this.utilsSvc.takePicture('Imagen de perfil')).dataUrl;
    this.form.controls.image.setValue(dataUrl);
  }

  submit() {
    if (this.form.valid) {
      if(this.image) this.updateImage();
      else this.createImage();
    }
  }

async createImage() {

  let path = `users/${this.user.uid}/image`;

  const loading = await this.utilsSvc.loading();
  await loading.present();

  const dataUrl = this.form.value.image as string;   // aseguramos string
  const imagePath = `${this.user.uid}/${Date.now()}`;

  // ⬇️ ahora con 3 parámetros
  const imageUrl = await this.firebaseSvc.uploadImage(path, imagePath, dataUrl);
  this.form.controls.image.setValue(imageUrl);


      delete this.form.value.id

      this.firebaseSvc.addDocument(path, this.form.value).then(async res => {

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

async updateImage() {

  let path = `users/${this.user.uid}/image/${this.image.id}`;

  const loading = await this.utilsSvc.loading();
  await loading.present();

  // --- si cambió la imagen, subir la nueva y obtener la url ---
  if (this.form.value.image !== this.image.image) {
    const dataUrl = this.form.value.image as string;
    const imagePath = await this.firebaseSvc.getFilePath(this.image.image);

    // ⬇️ igual que antes, 3 parámetros
    const imageUrl = await this.firebaseSvc.uploadImage(path, imagePath, dataUrl);
    this.form.controls.image.setValue(imageUrl);
  }


      delete this.form.value.id

      this.firebaseSvc.updateDocument(path, this.form.value).then(async res => {

        this.utilsSvc.dismissModal({ success: true });

        this.utilsSvc.presentToast({
          message: 'Perfil actualizado exitosamente',
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