import homeController from '@sfu/controllers/home.controller';
import { Router } from 'express';


const path = '/index/';
const homeRoute = Router();

homeRoute.get(path, homeController.indexHandler);

export default homeRoute;