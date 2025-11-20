const revokedTokens = new Set();

export function revokeToken(token) {
  revokedTokens.add(token);
}

export function isTockenRevoked(token) {

  let value = false;  

  if (revokedTokens.has(token.trim())) {
    value = true;
  }
  return value;
}

