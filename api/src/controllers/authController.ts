import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
//coloquei apenas este para exemplioficar
const SECRET_KEY = 'pode-ser-qualquer-valor';

export const registerUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    res.status(201).send('User registered');
  } catch (error) {
    res.status(500).send(error);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
};