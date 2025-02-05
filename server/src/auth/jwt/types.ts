export interface TokensResponse {
  jwt: { token: string; expirationTime: number };
  refresh: { token: string; expirationTime: number };
}

export interface RefreshToken {
  id: number;
  token: string;
  expirationDate: Date;
  userId: number;
  isActive: boolean;
}

export interface RefreshTokenTable {
  id: number;
  token: string;
  expirationDate: Date;
  userId: number;
  isActive: boolean;
}

export interface JwtPayload {
  id: number;
}
