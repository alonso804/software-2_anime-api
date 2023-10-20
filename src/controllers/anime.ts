import axios, { AxiosError } from 'axios';
import type { Request, Response } from 'express';

type Anime = {
  data: {
    title: string;
    type: string;
    source: string;
    episodes: number;
    status: string;
    airing: boolean;
  };
};

class AnimeController {
  static async find(req: Request, res: Response): Promise<void> {
    try {
      const response = await axios.get(`${process.env.JIKAN_API_URI}/anime/${req.params.id}`);

      const { data } = response.data as Anime;

      res.status(200).json({
        title: data.title,
        type: data.type,
        source: data.source,
        episodes: data.episodes,
        status: data.status,
        airing: data.airing,
      });
      return;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          res.status(404).json({ message: 'Anime not found' });
          return;
        }
      }

      throw error;
    }
  }
}

export default AnimeController;
