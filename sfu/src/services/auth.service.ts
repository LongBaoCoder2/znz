import "dotenv/config";
import { CreateUserDto } from "../dtos/create-user.dto";
import { LoginUserDto } from "../dtos/loginUsers.dto"
import { User } from "../interfaces/users.interface";
import { createUUID, hashPassword } from "../utils/crypt";
import {  HttpException } from "../exceptions/HttpException";
import { DataStoredInToken, TokenData } from '../interfaces/auth.interface';
import { createUser, getUserByEmail, getUserByUsername, verifyUserNamePassword } from "@sfu/data-access/user";
import jwt from 'jsonwebtoken';

class AuthService {
    public async signup(userData: CreateUserDto): Promise<User> {
        const findUser = await getUserByEmail(userData.email);
        if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

        const findUserByUsername = await getUserByUsername(userData.username);
        if (findUserByUsername) throw new HttpException(409, `You're username ${userData.username} already exists`);
        console.log(`userData.username: ${userData.username} - userData.email: ${userData.email} - userData.password: ${userData.password}`);
        const createUserData: User = await createUser(userData.username, userData.email, userData.password);

        return {
            id: createUserData.id,
            email: createUserData.email,
            username: createUserData.username
        }
    }


     public async login(userData: LoginUserDto): Promise<{ cookie: string; findUser: User }> {
        const findUser =  await getUserByUsername(userData.username);
        if(!findUser) throw new HttpException(409, `You're user name ${userData.username} not found`);

        const salt = findUser.pwdSalt;
        if(!salt) {
            throw new HttpException(409, 'Password salt is missing');
        }
           
        const isPasswordMatching = await verifyUserNamePassword(userData.username, userData.password);

        if(!isPasswordMatching) throw new HttpException(409, 'Wrong password');

        const tokenData = this.createToken(findUser);
        const cookie = this.createCookie(tokenData);

        return { cookie, findUser };
    }

    public async logout(userData: User): Promise<{ message: string }> {
        
        if (!userData.email) {
            throw new HttpException(409, `Email is not valid`);
        }
        const findUser = await getUserByEmail(userData.email);

        if(!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

        
        return { message: 'success' };
    }


    public createToken(user: User): TokenData {
        const dataStoredInToken: DataStoredInToken = { _id: user.id };
        const secretKey: string = process.env.SECRECT_KEY || "Hi";
        const expiresIn: number = 60 * 60;

        return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
    }

    public createCookie(tokenData: TokenData): string {
        return `Authorization=${tokenData.token};  Max-Age=${tokenData.expiresIn}; Path=/`;
    }
};

export default AuthService;