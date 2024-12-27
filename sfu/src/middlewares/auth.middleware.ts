import "dotenv/config";
import { DataStoredInToken, RequestWithUser } from '../interfaces/auth.interface';
import { NextFunction, Response, Request } from 'express';
import { HttpException } from '../exceptions/HttpException';
import jwt from 'jsonwebtoken';
import { getUserById } from "@sfu/data-access/user";


const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const Authorization = req.cookies['Authorization'] || req.header('Authorization')?.split('Bearer ')[1] || null;

    if (Authorization) {
      const secretKey: string = process.env.SECRET_KEY || "Hi";
      const verificationResponse = jwt.verify(Authorization, secretKey) as DataStoredInToken;
      const userId = verificationResponse._id;
      const findUser = await getUserById(userId);

      if (findUser) {
        const payload = {
          id: userId,
          username: findUser.username,
        };
        (req as RequestWithUser).user = payload;
        next();
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    res.status(404).json({ message: 'not-logged-in' });
  }
};

export default authMiddleware;
