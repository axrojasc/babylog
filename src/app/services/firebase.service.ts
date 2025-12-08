import { inject, Injectable } from '@angular/core';

// Auth
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

// Firestore
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  getFirestore,
  setDoc,
  doc,
  getDoc,
  addDoc,
  collection,
  collectionData,
  query,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';

// Storage
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  getStorage,
  uploadString,
  ref,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

import { UtilsService } from './utils.service';
import { User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  storage = inject(AngularFireStorage);
  utilsSvc = inject(UtilsService);

  // ----------------------------------------------------
  //                  AUTENTICACIÓN
  // ----------------------------------------------------

  getAuthInstance() {
    return getAuth();
  }

  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser!, { displayName });
  }

  // Google Auth
  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(getAuth(), provider);
  }

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsSvc.routerLink('/auth');
  }

  // ----------------------------------------------------
  //                    FIRESTORE
  // ----------------------------------------------------

  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  updateDocument(path: string, data: any) {
    return updateDoc(doc(getFirestore(), path), data);
  }

  deleteDocument(path: string) {
    return deleteDoc(doc(getFirestore(), path));
  }

  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  addDocument(path: string, data: any) {
    return addDoc(collection(getFirestore(), path), data);
  }

  getCollectionData(path: string, collectionQuery?: any) {
    const refCol = collection(getFirestore(), path);
    return collectionData(
      collectionQuery ? query(refCol, collectionQuery) : refCol,
      { idField: 'id' }
    );
  }

  // ----------------------------------------------------
  //                      STORAGE
  // ----------------------------------------------------

  /**
   * Sube una imagen en formato DataURL a Firebase Storage.
   * @param storagePath Carpeta destino (ej: users/UID)
   * @param fileName Nombre del archivo (ej: profile o babies/123)
   * @param dataUrl Imagen en base64 (data:image/jpeg...)
   */
  async uploadImage(storagePath: string, fileName: string, dataUrl: string): Promise<string> {
    try {
      const fullPath = `${storagePath}/${fileName}`; // ruta completa en Firebase

      const storageRef = ref(getStorage(), fullPath);

      // Subir como data_url
      await uploadString(storageRef, dataUrl, "data_url");

      // Obtener URL de descarga pública
      return await getDownloadURL(storageRef);

    } catch (error) {
      console.error("Error subiendo imagen:", error);
      throw error;
    }
  }

  async getFilePath(url: string) {
    return ref(getStorage(), url).fullPath;
  }

  deleteFile(path: string) {
    return deleteObject(ref(getStorage(), path));
  }
}
