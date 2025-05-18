export interface UserModel {
  id?: string;
  email: string;
  passwordHash: string;
  lock: boolean;
  role: string;
}