export const COMMUNITY_ORIGIN = "https://community.demerchantbridge.com";
export const communityUrl = (path = "/") => new URL(path, COMMUNITY_ORIGIN).href;
