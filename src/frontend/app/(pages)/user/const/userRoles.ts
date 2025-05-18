export const AdminRole = 'Admin' as const;
export const UserRole = 'User' as const;

export type UserRoles = typeof AdminRole | typeof UserRole;
