import { Router } from 'express';
import apiRoute from './api.mjs';

const apiRouter = Router();
apiRouter.use('/', apiRoute);

export default apiRouter;
