export function createJwtBlacklistRepo(mongoDB) {
  const col = mongoDB.getCollection("jwtBlackList"); 

  return {
    async revokeToken(token, exp) {
      await col.insertOne({
        token,
        exp,         
        createdAt: new Date(),
      });
    },

    async isTokenRevoked(token) {
      const doc = await col.findOne({ token });
      return !!doc;
    },
  };
}
