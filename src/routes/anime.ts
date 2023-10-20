import { Router } from 'express';

import AnimeController from '../controllers/anime';

const router = Router();

router.get('/get/:id', AnimeController.find);

export default router;
