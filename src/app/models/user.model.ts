export interface User {
  uid: string;
  name: string;
  lastName?: string;
  password: string;
  email: string;
  phone?: string;      // 👈 AGREGA ESTA LÍNEA
  image?: string;
  babies?: any[];
}
