import { Request, Response } from 'express';
import { Controller } from '@/server/Controllers';
import Database from '@/server/Database.js';

const userController = new Controller('UserController');

userController.post('/', [], async (req: Request, res: Response) => {
  if (!Database.models.Developer) {
    res.status(404).send('User not found');
    return;
  }
  const user = await Database.models.Developer.create(req.body);
  res.json(user);
});

userController.get('/', [], async (_req: Request, res: Response) => {
  console.log(Database);

  if (!Database.models.Developer) {
    res.status(404).send('User not found');
    return;
  }
  const users = await Database.models.Developer.findAll();
  res.json(users);
});

userController.get('/:id', [], async (req: Request, res: Response) => {
  if (!Database.models.Developer) {
    res.status(404).send('User not found');
    return;
  }
  const user = await Database.models.Developer.findOne({ where: { uuid: req.params.id } });
  res.json(user);
});

userController.put('/:id', [], async (req: Request, res: Response) => {
  if (!Database.models.Developer) {
    res.status(404).send('User not found');
    return;
  }
  await Database.models.Developer.update(req.body, { where: { uuid: req.params.id } });
  const user = await Database.models.Developer.findOne({ where: { uuid: req.params.id } });
  res.json(user);
});

userController.delete('/:id', [], async (req: Request, res: Response) => {
  if (!Database.models.Developer) {
    res.status(404).send('User not found');
    return;
  }

  await Database.models.Developer.destroy({ where: { uuid: req.params.id } });
  res.json({ message: 'User deleted successfully.' });
});

export { userController };
