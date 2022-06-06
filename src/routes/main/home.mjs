import { Router } from 'express';
import MainController from '../../controllers/index.mjs';

const router = Router();
router.get('/', MainController.getSiteMap);
router.post('/', MainController.getSiteMap);
router.get('/capture', MainController.captureSite);
router.post('/capture', MainController.captureSite);

export default router;
