import bcrypt from 'bcrypt';
import {db} from "../database/database.config.js";
import tokenService from "./token-service.js";
import {CollectionsNames} from "../database/collections.names.enum.js";
import UserDto from '../dtos/user-dto.js';
import ApiError from '../exceptions/api-error.js';


const AuthService = {
  async register(body) {
    try {
      const { name, email, password } = body;

      const userWithSameEmail = await db
          .collection(CollectionsNames.USERS)
          .where('email', '==', email)
          .get();

      if (!userWithSameEmail.empty) {
        return Promise.reject(ApiError.BadRequest(`User with ${email} email already exists`));
      }

      const hashedPassword = await bcrypt.hash(password, 3);

      const newUserRef = await db.collection(CollectionsNames.USERS).add({
        name,
        email,
        password: hashedPassword,
      });

      const newUserDoc = await newUserRef.get();
      const newUserData = newUserDoc.data();

      const userDto = new UserDto({ id: newUserRef.id, ...newUserData });
      const tokens = tokenService.generateTokens({ ...userDto });

      await tokenService.saveToken(newUserRef.id, tokens.refreshToken);

      return { ...tokens, user: userDto };
    } catch (error) {
      throw error;
    }
  },

  async login(body) {
    try {
      const { email, password } = body;
      const userQuery = await db
          .collection(CollectionsNames.USERS)
          .where('email', '==', email)
          .get();

      if (userQuery.empty) {
        return Promise.reject(ApiError.BadRequest(`No user found with ${email} email`));
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();

      const isPasswordEquals = await bcrypt.compare(password, userData.password);
      if (!isPasswordEquals) {
        return Promise.reject(ApiError.BadRequest(`Wrong password for user with ${email} email`));
      }

      const userDto = new UserDto({ id: userDoc.id, ...userData });
      const tokens = tokenService.generateTokens({ ...userDto });

      await tokenService.saveToken(userDoc.id, tokens.refreshToken);

      return { ...tokens, user: userDto };
    } catch (error) {
      throw error;
    }
  },

  async logout(refreshToken) {
    try {
      const userData = tokenService.validateRefreshToken(refreshToken);
      if (!userData) {
        return Promise.reject(ApiError.UnauthorizedError());
      }

      const tokenFromDb = await tokenService.findToken(refreshToken);
      if (!tokenFromDb) {
        return Promise.reject(ApiError.UnauthorizedError());
      }

      await tokenService.removeToken(refreshToken);
    } catch (error) {
      throw error;
    }
  },

  async refresh(refreshToken) {
    try {
      if (!refreshToken) {
        return Promise.reject(ApiError.UnauthorizedError());
      }

      const userData = tokenService.validateRefreshToken(refreshToken);
      const tokenFromDb = await tokenService.findToken(refreshToken);

      if (!userData || !tokenFromDb) {
        return Promise.reject(ApiError.UnauthorizedError());
      }

      const userDoc = await db.collection(CollectionsNames.USERS).doc(userData.id).get();
      if (!userDoc.exists) {
        return Promise.reject(ApiError.UnauthorizedError());
      }

      const userDto = new UserDto({ id: userDoc.id, ...userDoc.data() });
      const tokens = tokenService.generateTokens({ ...userDto });

      await tokenService.saveToken(userDoc.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw error;
    }
  },
};

export default AuthService;
