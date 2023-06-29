import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { config } from '@/server/Config';

export function authorizeUser(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).send('Authorization token required');
    }

    const decodedToken: any = verify(token, config.api.secret!);

    if (req.params.id !== decodedToken.gitlabId) {
      return res.status(403).send('User not authorized to modify this data');
    }

    return next();
  } catch (err) {
    console.error(err);
    return res.status(400).send('Invalid token');
  }
}

export default authorizeUser;
