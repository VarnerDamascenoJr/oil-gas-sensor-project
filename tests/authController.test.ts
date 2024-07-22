// src/tests/authController.test.ts
import { Request, Response } from 'express';
import { registerUser } from '../controllers/authController';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { loginUser } from '../controllers/authController';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

describe('registerUser', () => {
  afterEach(async () => {
    await prisma.user.deleteMany(); // Limpa os usuários após cada teste
  });

  it('should register a user', async () => {
    const req = { body: { username: 'testuser', password: 'password' } } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith('User registered');

    // Verifica se o usuário foi salvo no banco de dados
    const savedUser = await prisma.user.findUnique({ where: { username: 'testuser' } });
    expect(savedUser).toBeDefined();
    expect(savedUser!.username).toBe('testuser');
    expect(await bcrypt.compare('password', savedUser!.password)).toBeTruthy();
  });

  it('should return 500 on error', async () => {
    // Força um erro simulado no Prisma
    jest.spyOn(prisma.user, 'create').mockRejectedValueOnce(new Error('Database error'));

    const req = { body: { username: 'testuser', password: 'password' } } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('loginUser', () => {
    beforeAll(async () => {
      // Cria um usuário para teste
      const hashedPassword = await bcrypt.hash('password', 10);
      await prisma.user.create({
        data: {
          username: 'testuser',
          password: hashedPassword,
        },
      });
    });
  
    afterAll(async () => {
      await prisma.user.deleteMany(); // Limpa os usuários após os testes
    });
  
    it('should login a user with valid credentials', async () => {
      const req = { body: { username: 'testuser', password: 'password' } } as Request;
      const res = {
        json: jest.fn(),
      } as unknown as Response;
  
      await loginUser(req, res);
  
      expect(res.json).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
    });
  
    it('should return 401 for invalid credentials', async () => {
      const req = { body: { username: 'testuser', password: 'wrongpassword' } } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;
  
      await loginUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('Invalid credentials');
    });
  });