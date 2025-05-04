import { UserRoles } from '../const/userRoles';

export interface CreateUpdateUserDto {
  email: string;
  password?: string; 
  role: UserRoles;
}