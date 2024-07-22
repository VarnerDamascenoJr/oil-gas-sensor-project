import { Router } from 'express';
import { handleSensorData, handleCSVUpload, getAverageData, getAllSensorDataByPeriod, getAllEquipmentIds } from '../controllers/sensorDataController';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/', handleSensorData);
router.post('/csv', upload.single('file'), handleCSVUpload);
router.get('/average', getAverageData);
router.get('/sensor-data', getAllSensorDataByPeriod)
router.get('/all-equipaments', getAllEquipmentIds)

export default router;