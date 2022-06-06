import { Router } from 'express';
import homeRouter from './home.mjs';

const indexRoute = Router();
indexRoute.use('/', homeRouter);

export default indexRoute;
