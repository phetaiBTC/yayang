import { SetMetadata } from '@nestjs/common';

export type Role = 'admin' | 'staff';

export const ROLES_KEY = 'roles';

/** Restrict a route/controller to the given roles. Use with RolesGuard. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
