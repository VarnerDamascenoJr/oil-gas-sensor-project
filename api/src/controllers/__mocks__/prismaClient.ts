
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';


export const prismaMock = mockDeep<PrismaClient>();

export type MockPrismaClient = DeepMockProxy<PrismaClient>;