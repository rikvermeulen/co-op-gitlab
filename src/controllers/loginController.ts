import type { DeveloperAttributes } from '@/models/user';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/server/Config';
import { Controller } from '@/server/Controllers';
import Database from '@/server/Database.js';

const loginController = new Controller('loginController');

// Login Endpoint
loginController.post('/', [], async (req: Request, res: Response) => {
  const { gitlabId } = req.body;

  if (!gitlabId) {
    res.status(400).send('GitLab ID required');
  }

  if (!Database.models.Developer) {
    res.status(404).send('Could not find developer, model not found');
    return;
  }

  // Fetch the user from your database
  const user = (await Database.models.Developer.findOne({
    where: { gitlabId: gitlabId },
  })) as DeveloperAttributes | null;

  if (!user) {
    res.status(401).send('Invalid GitLab ID');
    return;
  }

  // Sign the JWT
  const secretKey = config.api.secret; // Replace with your secret key
  const token = jwt.sign({ gitlabId: user.gitlabId }, secretKey, { expiresIn: '1h' }); // Token will expire in 1 hour

  res.json({ token });
});

export { loginController };
