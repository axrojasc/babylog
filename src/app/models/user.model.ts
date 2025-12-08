export interface User {
  uid: string;
  name: string;
  lastName?: string;
  password: string;
  email: string;
  phone?: string;      
  image?: string;
  babies?: any[];
}
