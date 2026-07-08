import type { PublicAuthOrganization, PublicAuthUser } from "@/types/auth";

export interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

export interface AuthMeResponse {
  display_name?: string;
  email: string;
  id: string;
  name?: string;
  organization?: {
    id: string;
    name: string;
  };
}

export interface StoredAuthSession {
  accessToken: string;
  expiresAt: number;
  organization?: PublicAuthOrganization;
  refreshToken: string;
  tokenType: string;
  user: PublicAuthUser;
}

export function mapMeToPublicUser(me: AuthMeResponse): PublicAuthUser {
  return {
    id: me.id,
    email: me.email,
    displayName: me.display_name ?? me.name ?? me.email,
  };
}

export function mapMeToPublicOrg(
  me: AuthMeResponse
): PublicAuthOrganization | undefined {
  if (!me.organization) {
    return;
  }
  return {
    id: me.organization.id,
    name: me.organization.name,
  };
}

export function toStoredSession(
  tokens: AuthTokenResponse,
  me: AuthMeResponse
): StoredAuthSession {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenType: tokens.token_type,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    user: mapMeToPublicUser(me),
    organization: mapMeToPublicOrg(me),
  };
}
