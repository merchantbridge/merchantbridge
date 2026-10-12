export const MERCHANTBRIDGE_ADMIN_AVATAR = "/icon.png";
export function isMerchantBridgeAdmin(role: string | null | undefined) {
  return role === "admin" || role === "super_admin";
}
