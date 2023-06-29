import { Request, Response } from 'express';
import { ValidationError } from 'sequelize';
import { Controller } from '@/server/Controllers';
import Database from '@/server/Database.js';

const userController = new Controller('UserController');

userController.post('/', [], async (req: Request, res: Response) => {
  if (!Database.models.Developer) {
    res.status(404).send('Could not create developer, model not found');
    return;
  }
  try {
    const user = await Database.models.Developer.create(req.body);
    res.json(user);
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).send(err.message);
    } else {
      console.error(err);
    }
  }
});

userController.get('/', [], async (_req: Request, res: Response) => {
  if (!Database.models.Developer) {
    res.status(404).send('Could not get developers, model not found');
    return;
  }
  const users = await Database.models.Developer.findAll();
  res.json(users);
});

userController.get('/:id', [], async (req: Request, res: Response) => {
  if (!Database.models.Developer) {
    res.status(404).send(`Could not get developer, model not found`);
    return;
  }

  const user = await Database.models.Developer.findOne({ where: { uuid: req.params.id } });
  res.json(user);
});

userController.put('/:id', [], async (req: Request, res: Response) => {
  if (!Database.models.Developer) {
    res.status(404).send('Could not update developer, model not found');
    return;
  }

  try {
    await Database.models.Developer.update(req.body, { where: { uuid: req.params.id } });
    const user = await Database.models.Developer.findOne({ where: { uuid: req.params.id } });
    res.json(user);
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).send(err.message);
    } else {
      console.error(err);
    }
  }
});

userController.delete('/:id', [], async (req: Request, res: Response) => {
  if (!Database.models.Developer) {
    res.status(404).send('Could not delete developer, model not found');
    return;
  }

  try {
    await Database.models.Developer.destroy({ where: { uuid: req.params.id } });
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error(err);
  }
});

export { userController };
