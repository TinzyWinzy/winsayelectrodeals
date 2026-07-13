export type UserRole =
  | "SUPER_ADMIN"
  | "MANAGER"
  | "SALES_AGENT"
  | "MARKETING"
  | "TECHNICIAN"
  | "VIEWER";

const roleRank: Record<UserRole, number> = {
  VIEWER: 0,
  TECHNICIAN: 1,
  MARKETING: 2,
  SALES_AGENT: 3,
  MANAGER: 4,
  SUPER_ADMIN: 5,
};

export function isUserRole(value: unknown): value is UserRole {
  return (
    value === "SUPER_ADMIN" ||
    value === "MANAGER" ||
    value === "SALES_AGENT" ||
    value === "MARKETING" ||
    value === "TECHNICIAN" ||
    value === "VIEWER"
  );
}

export function roleAtLeast(role: UserRole, minimumRole: UserRole): boolean {
  return roleRank[role] >= roleRank[minimumRole];
}
