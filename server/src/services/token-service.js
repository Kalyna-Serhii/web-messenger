import jwt from 'jsonwebtoken';
import {db} from "../database/database.config.js";
import {CollectionsNames} from "../database/collections.names.enum.js";

const TokenService = {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  },

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  },

  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (error) {
      return null;
    }
  },

  async saveToken(userId, refreshToken) {
    const tokenRef = db.collection(CollectionsNames.TOKENS).doc(userId);
    await tokenRef.set({ refreshToken }, { merge: true });
  },

  async removeToken(refreshToken) {
    const tokensSnapshot = await db
        .collection('tokens')
        .where('refreshToken', '==', refreshToken)
        .get();

    if (!tokensSnapshot.empty) {
      await tokensSnapshot.docs[0].ref.delete();
    }
  },

  async findToken(refreshToken) {
    const tokensSnapshot = await db
        .collection('tokens')
        .where('refreshToken', '==', refreshToken)
        .get();

    return tokensSnapshot.empty ? null : tokensSnapshot.docs[0].data();
  },
};

export default TokenService;
