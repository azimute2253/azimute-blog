export type UserRole = 'member' | 'premium' | 'admin';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  member: 1,
  premium: 2,
  admin: 3,
};

export function hasAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
