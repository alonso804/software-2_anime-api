import type { Request, Response } from 'express';
import { REDIS_STORE_TIME } from 'src/helpers/constants';
import { logger } from 'src/logger';
import type { AnimeDocument } from 'src/models/anime';
import AnimeModel from 'src/models/anime';
import { client } from 'src/redis';

class AnimeController {
  static async find(req: Request, res: Response): Promise<void> {
    const redisRes = await client.get(`anime:${req.params.id}`);

    if (redisRes) {
      const anime = JSON.parse(redisRes) as AnimeDocument;

      if ('message' in anime) {
        logger.info({
          source: 'redis',
          status: 404,
        });

        res.status(404).json(anime);
        return;
      }

      logger.info({
        source: 'redis',
        status: 200,
      });

      res.status(200).json(JSON.parse(redisRes));
      return;
    }

    const anime = await AnimeModel.findOneById(Number(req.params.id));

    if (!anime) {
      await client.set(
        `anime:${req.params.id}`,
        JSON.stringify({
          message: 'Anime not found',
        }),
        {
          EX: REDIS_STORE_TIME,
        },
      );

      logger.info({
        source: 'mongo',
        status: 404,
      });

      res.status(404).json({ message: 'Anime not found' });
      return;
    }

    logger.info({
      source: 'mongo',
      status: 200,
    });

    await client.set(`anime:${req.params.id}`, JSON.stringify(anime), {
      EX: REDIS_STORE_TIME,
    });

    res.status(200).json(anime);
    return;
  }
}

export default AnimeController;
