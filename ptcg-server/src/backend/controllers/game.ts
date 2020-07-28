import { Request, Response } from 'express';
import { AuthToken } from '../services';
import { Controller, Get } from './controller';
import { Errors } from '../common/errors';


export class Game extends Controller {

  @Get('/:id/logs')
  @AuthToken()
  public async onLogs(req: Request, res: Response) {
    const gameId: number = parseInt(req.params.id, 10);
    const game = this.core.games.find(g => g.id === gameId);
    if (game === undefined) {
      res.send({error: Errors.GAME_INVALID_ID});
      return;
    }
    const logs = game.state.logs;
    res.send({ok: true, logs });
  }

}