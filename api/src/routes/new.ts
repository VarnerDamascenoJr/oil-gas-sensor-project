import { Router } from 'express';
import { handleHome } from '../controllers/sensorDataController';


const router = Router();

router.get('/',handleHome);

export default router;