import { User } from '../schema/user.schema';
import { UserRoles } from '../const/userRoles';

export interface UserDto {
  id: string;
  email: string;
  passwordHash: string;
  lock: boolean;
  role: UserRoles;
}

export function createUserDto(jsonSource: User): UserDto {
  return {
    id: jsonSource.id,
    email: jsonSource.email,
    passwordHash: jsonSource.passwordHash,
    lock: jsonSource.lock,
    role: jsonSource.role,
  };
}
