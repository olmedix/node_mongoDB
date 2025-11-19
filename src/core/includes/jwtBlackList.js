const revokedTokens = new Set();

export function revokeToken(token){
  revokedTokens.add(token);
}

export function isTockenRevoked(token){
  return revokedTokens.has(token);
}