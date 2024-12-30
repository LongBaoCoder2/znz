import { NextFunction, Request, Response } from "express";
import AuthService from "../services/auth.service";
import { CreateUserDto } from "../dtos/create-user.dto";
import { LoginUserDto } from "../dtos/loginUsers.dto";
import { User } from "../interfaces/users.interface";
import { RequestWithUser } from "../interfaces/auth.interface";
import { HttpException } from "@sfu/exceptions/HttpException";
import { UserChangePasswordDto } from "@sfu/dtos/user.dto";

class AuthController {
  public authService = new AuthService();

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const signUpUserData: User = await this.authService.signup(userData);

      res.status(201).json({ data: signUpUserData, message: "register" });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: LoginUserDto = req.body;

      // Gọi AuthService để xử lý đăng nhập
      const { accessToken, refreshToken, user } = await this.authService.login(userData);

      // Lưu Access Token và Refresh Token vào cookie
      res.cookie("Authorization", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000, path: "/" }); // 15 phút
      res.cookie("Refresh", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, path: "/refresh" }); // 7 ngày

      // Trả về thông tin người dùng và token
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: User = (req as RequestWithUser).user;
      const message = await this.authService.logout(userData);
      if (message.message === "success") {
        res.clearCookie("Authorization", { path: "/" });
        res.clearCookie("Refresh", { path: "/refresh" });
        res.status(200).json({ message: "logout" });
      } else {
        res.status(400).json({ message: "failed" });
      }
    } catch (error) {
      next(error);
    }
  };

  public auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: User = (req as RequestWithUser).user;
      res.status(200).json({ data: userData, message: "auth" });
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies["Refresh"];
      if (!refreshToken) throw new HttpException(401, "Refresh token không tồn tại");

      const newAccessToken = await this.authService.refresh(refreshToken);

      res.cookie("Authorization", newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000, path: "/" }); // 15 phút

      res.status(200).json({ accessToken: newAccessToken, message: "Refresh token thành công" });
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as RequestWithUser).user.id;

      const userChangePasswordDto : UserChangePasswordDto = req.body;

      this.authService.changePassword(userId, userChangePasswordDto);

      res.status(200).json({ 
        message: "Update password successfully!" 
      });
    } catch (error: any) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ 
          message: error.message,
        });
      } else {
        res.status(500).json({ 
          message: "Error when updating password!",
        });
      }
      
    }
  };
}

export default AuthController;
