import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";

class AuthRoute {

    public path = '/auth/';
    public router = Router();
    public authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}signup`, this.authController.register);
        this.router.post(`${this.path}login`, this.authController.login);
        this.router.post(`${this.path}logout`, authMiddleware, this.authController.logout);
        this.router.get(`${this.path}auth`, authMiddleware, this.authController.auth);
        this.router.patch(`${this.path}password`, authMiddleware, this.authController.changePassword);
    }
};

export default AuthRoute;