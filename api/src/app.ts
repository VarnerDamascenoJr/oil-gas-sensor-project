import express, { Request, Response, NextFunction }  from 'express';
import bodyParser from 'body-parser';
import { expressjwt } from 'express-jwt';
import sensorDataRoutes from './routes/sensorDataRoutes';
import authRoutes from './routes/authRoutes';
import homeRoutes from './routes/new'
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();
const SECRET_KEY = 'pode-ser-qualquer-valor';

app.use(bodyParser.json());
app.use(cors());
app.use('/',homeRoutes)
app.use('/auth', authRoutes);
app.use('/data', expressjwt({ secret: SECRET_KEY, algorithms: ['HS256'] }), sensorDataRoutes);
//app.use('/data', sensorDataRoutes); CASO QUEIRA TESTAR SEM FAZER QUALQUER TIPO DE LOGIN/REGISTER

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token');
  } else {
    next(err);
  }
});

export default app;