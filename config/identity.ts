export const MERCHANTBRIDGE_ADMIN_AVATAR = "/images/logo-full.png";
export function isMerchantBridgeAdmin(role: string | null | undefined) {
  return role === "admin" || role === "super_admin";
}
