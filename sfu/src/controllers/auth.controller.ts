import { NextFunction, Request, Response } from 'express';
import AuthService from "../services/auth.service";
import { CreateUserDto } from "../dtos/create-user.dto";
import { LoginUserDto } from "../dtos/loginUsers.dto";
import { User } from "../interfaces/users.interface";
import { RequestWithUser } from "../interfaces/auth.interface";


class AuthController {

    public authService = new AuthService();

    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData : CreateUserDto = req.body;
            const signUpUserData: User = await this.authService.signup(userData);
            
            res.status(201).json({ data: signUpUserData, message: 'register'});
        } catch (error) {
            next(error);
        }
    };

    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: LoginUserDto = req.body;
            const { cookie, findUser } = await this.authService.login(userData);
            
            res.setHeader('Set-Cookie', [cookie]);          
            res.status(200).json({ data: findUser, message: 'login' });
        } catch (error) {
            next(error);
        }
    };

    public logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: User = (req as RequestWithUser).user;
            const message = await this.authService.logout(userData);
            if (message.message === 'success') {
                res.setHeader('Set-Cookie', ['Authorization=; Max-age=0; Path=/;']);
                res.status(200).json({ message: 'logout' });
            } else {
                res.status(400).json({ message: 'failed' });
            }
        } catch (error) {
            next(error);
        }
    };

    public auth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: User = (req as RequestWithUser).user;
            res.status(200).json({ data: userData, message: 'auth' });
        } catch (error) {
            next(error);
        }
    };

}

export default AuthController;