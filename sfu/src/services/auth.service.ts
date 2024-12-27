import "dotenv/config";
import { CreateUserDto } from "../dtos/create-user.dto";
import { LoginUserDto } from "../dtos/loginUsers.dto";
import { User } from "../interfaces/users.interface";
import { HttpException } from "../exceptions/HttpException";
import { DataStoredInToken, TokenData } from "../interfaces/auth.interface";
import { createUser, getUserByUsername, verifyUserNamePassword } from "@sfu/data-access/user";
import jwt from "jsonwebtoken";

class AuthService {
  // Tạo refresh token
  public createRefreshToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user.id };
    const secretKey: string = process.env.REFRESH_SECRET_KEY || "RefreshSecret";
    const expiresIn: number = 7 * 24 * 60 * 60; // 7 days

    return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  // acccess token
  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user.id };
    const secretKey: string = process.env.SECRECT_KEY || "Hi";
    const expiresIn: number = 15 * 60; // 15p

    return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public async signup(userData: CreateUserDto): Promise<User> {

    const findUserByUsername = await getUserByUsername(userData.username);
    if (findUserByUsername) throw new HttpException(409, `You're username ${userData.username} already exists`);
    console.log(
      `userData.username: ${userData.username} - userData.password: ${userData.password}`
    );
    const createUserData: User = await createUser(userData.username, userData.password);

    return {
      id: createUserData.id,
      username: createUserData.username
    };
  }

  public async login(
    userData: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const findUser = await getUserByUsername(userData.username);
    if (!findUser) throw new HttpException(409, `You're user name ${userData.username} not found`);

    const salt = findUser.pwdSalt;
    if (!salt) {
      throw new HttpException(409, "Password salt is missing");
    }

    const isPasswordMatching = await verifyUserNamePassword(userData.username, userData.password);
    if (!isPasswordMatching) throw new HttpException(409, "Wrong password");

    // Tạo access token và refresh token
    const accessTokenData = this.createToken(findUser);
    const refreshTokenData = this.createRefreshToken(findUser);

    return {
      user: {
        id: findUser.id,
        username: findUser.username,
      },
      accessToken: accessTokenData.token,
      refreshToken: refreshTokenData.token,
    };
  }

  public async logout(userData: User): Promise<{ message: string }> {
    if (!userData.username) {
      throw new HttpException(409, `Username is not valid`);
    }
    const findUser = await getUserByUsername(userData.username);

    if (!findUser) throw new HttpException(409, `You're Username ${userData.username} not found`);

    return { message: "success" };
  }

  // Xác thực refresh token và tạo access token mới
  public async refresh(refreshToken: string): Promise<string> {
    try {
      const secretKey: string = process.env.REFRESH_SECRET_KEY || "RefreshSecret";
      const decoded = jwt.verify(refreshToken, secretKey) as DataStoredInToken;

      const user: User = { id: decoded._id, username: "" }; // Lấy thông tin user từ database nếu cần
      const accessTokenData = this.createToken(user);

      return accessTokenData.token;
    } catch (error) {
      throw new HttpException(403, "Refresh token không hợp lệ");
    }
  }
}

export default AuthService;
