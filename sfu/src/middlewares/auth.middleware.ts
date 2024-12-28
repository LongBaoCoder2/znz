import "dotenv/config";
import { DataStoredInToken, RequestWithUser } from '../interfaces/auth.interface';
import { NextFunction, Response, Request } from 'express';
import { HttpException } from '../exceptions/HttpException';
import jwt from 'jsonwebtoken';
import { getUserById } from "@sfu/data-access/user";
import { childLogger } from "@sfu/core/logger";

const sfuLogger = childLogger("sfu");
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const Authorization = req.header('Authorization')?.split('Bearer ')[1] || req.cookies['Authorization'] || null;
    sfuLogger.info(`Authorization: ${Authorization}`);

    if (Authorization !== null) {
      sfuLogger.info(`getInAuth`);
      const secretKey: string = process.env.SECRET_KEY || "Hi";
      const verificationResponse = jwt.verify(Authorization, secretKey) as DataStoredInToken;
      const userId = verificationResponse._id;
      sfuLogger.info(`userId: ${userId}`);
      const findUser = await getUserById(userId);
      sfuLogger.info(`findUser: ${findUser}`);


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
  } catch (error: any) {
    res.status(404).json({ message: 'not-logged-in' });
    sfuLogger.error(error.message);
  }
};

export default authMiddleware;
