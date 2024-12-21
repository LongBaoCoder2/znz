import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { DataStoredInToken, RequestWithUser } from '../interfaces/auth.interface';

class AuthRoute {

    public path = '/auth/';
    public router = Router();
    public authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // this.router.post(`${this.path}signup`, validationMiddleware(CreateUserDto, 'body'), this.authController.signup);
        // this.router.post(`${this.path}login`, validationMiddleware(LoginUserDto, 'body'), this.authController.login);
        // this.router.post(`${this.path}logout`, authMiddleware, this.authController.logout);
        // this.router.get(`${this.path}auth`, authMiddleware, this.authController.auth);

        this.router.post(`${this.path}signup`, this.authController.register);
        this.router.post(`${this.path}login`, this.authController.login);
        this.router.post(`${this.path}logout`, authMiddleware, this.authController.logout);
        this.router.get(`${this.path}auth`, authMiddleware, this.authController.auth)
    }
};

export default AuthRoute;