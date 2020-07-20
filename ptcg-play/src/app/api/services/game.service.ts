import { Injectable } from '@angular/core';
import { Action, UserInfo, GameState, State, CardTarget } from 'ptcg-server';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AlertService } from '../../shared/alert/alert.service';
import { ApiError } from '../api.error';
import { SocketService } from '../socket.service';
import { SessionService } from '../../shared/session/session.service';

export interface GameUserInfo {
  gameId: number;
  userInfo: UserInfo;
}

@Injectable()
export class GameService {

  constructor(
    private alertService: AlertService,
    private sessionService: SessionService,
    private socketService: SocketService
  ) { }

  public join(gameId: number): Observable<GameState> {
    return new Observable<GameState>(observer => {
      this.socketService.emit('game:join', gameId)
        .pipe(finalize(() => observer.complete()))
        .subscribe((gameState: GameState) => {
          this.appendGameState(gameState);
          observer.next(gameState);
        }, (error: any) => {
          observer.error(error);
        });
    });
  }

  public appendGameState(gameState: GameState) {
    const gameId = gameState.gameId;
    const games = this.sessionService.session.gameStates;
    const index = games.findIndex(g => g.gameId === gameId);
    if (index === -1) {
      const gameStates = [...games, gameState];
      this.startListening(gameState.gameId);
      this.sessionService.set({ gameStates });
    }
  }

  public removeGameState(gameId: number) {
    const games = this.sessionService.session.gameStates;
    const index = games.findIndex(g => g.gameId === gameId);
    if (index !== -1) {
      const gameStates = games.filter(table => table.gameId !== gameId);
      this.stopListening(gameId);
      this.sessionService.set({ gameStates });
    }
  }

  public leave(gameId: number) {
    this.socketService.emit('game:leave', gameId)
      .subscribe(() => {
        this.removeGameState(gameId);
      }, (error: ApiError) => this.alertService.toast(error.message));
  }

  public ability(gameId: number, ability: string, target: CardTarget) {
    this.socketService.emit('game:action:ability', { gameId, ability, target })
      .subscribe(() => {}, (error: ApiError) => this.alertService.toast(error.message));
  }

  public attack(gameId: number, attack: string) {
    this.socketService.emit('game:action:attack', { gameId, attack })
      .subscribe(() => {}, (error: ApiError) => this.alertService.toast(error.message));
  }

  public play(gameId: number, deck: string[]) {
    this.socketService.emit('game:action:play', { gameId, deck })
      .subscribe(() => {}, (error: ApiError) => this.alertService.toast(error.message));
  }

  public resolvePrompt(gameId: number, promptId: number, result: any) {
    this.socketService.emit('game:action:resolvePrompt', {gameId, id: promptId, result})
      .subscribe(() => {}, (error: ApiError) => this.alertService.toast(error.message));
  }

  public playCardAction(gameId: number, handIndex: number, target: CardTarget) {
    this.socketService.emit('game:action:playCard', {gameId, handIndex, target})
      .subscribe(() => {}, (error: ApiError) => this.alertService.toast(error.message));
  }

  public reorderBenchAction(gameId: number, from: number, to: number) {
    this.socketService.emit('game:action:reorderBench', {gameId, from, to})
      .subscribe(() => {}, (error: ApiError) => this.alertService.toast(error.message));
  }

  public reorderHandAction(gameId: number, order: number[]) {
    this.socketService.emit('game:action:reorderHand', {gameId, order})
      .subscribe(() => {}, (error: ApiError) => this.alertService.toast(error.message));
  }

  public retreatAction(gameId: number, to: number) {
    this.socketService.emit('game:action:retreat', {gameId, to})
      .subscribe(() => {}, (error: ApiError) => this.alertService.toast(error.message));
  }

  public passTurnAction(gameId: number) {
    this.socketService.emit('game:action:passTurn', {gameId})
      .subscribe(() => {}, (error: ApiError) => this.alertService.toast(error.message));
  }

  public appendLogAction(gameId: number, message: string) {
    this.socketService.emit('game:action:appendLog', {gameId, message})
      .subscribe(() => {}, (error: ApiError) => this.alertService.toast(error.message));
  }

  public dispatch(action: Action) { }

  private startListening(id: number) {
    this.socketService.on(`game[${id}]:join`, (userInfo: UserInfo) => this.onJoin(id, userInfo));
    this.socketService.on(`game[${id}]:leave`, (userInfo: UserInfo) => this.onLeave(id, userInfo));
    this.socketService.on(`game[${id}]:stateChange`, (state: State) => this.onStateChange(id, state));
  }

  private stopListening(id: number) {
    this.socketService.off(`game[${id}]:join`);
    this.socketService.off(`game[${id}]:leave`);
    this.socketService.off(`game[${id}]:stateChange`);
  }

  private onStateChange(gameId: number, state: State) {
    console.log('gameService, onStateChange', gameId, state);
    const index = this.sessionService.session.gameStates.findIndex(g => g.gameId === gameId);
    if (index !== -1) {
      const gameStates = this.sessionService.session.gameStates.slice();
      gameStates[index] = { ...gameStates[index], state };
      this.sessionService.set({ gameStates });
    }
  }

  private onJoin(gameId: number, userInfo: UserInfo) {
    const index = this.sessionService.session.gameStates.findIndex(g => g.gameId === gameId);
    if (index === -1) {
      return;
    }
    const game = this.sessionService.session.gameStates[index];
    const userIndex = game.users.findIndex(u => u.clientId === userInfo.clientId);
    if (userIndex === -1) {
      const users = [ ...game.users, userInfo ];
      const gameStates = this.sessionService.session.gameStates.slice();
      gameStates[index] = { ...gameStates[index], users };
      this.sessionService.set({ gameStates });
    }
  }

  private onLeave(gameId: number, userInfo: UserInfo) {
    const index = this.sessionService.session.gameStates.findIndex(g => g.gameId === gameId);
    if (index === -1) {
      return;
    }
    const game = this.sessionService.session.gameStates[index];
    const userIndex = game.users.findIndex(u => u.clientId === userInfo.clientId);
    if (userIndex !== -1) {
      const users = game.users.filter(u => u.clientId !== userInfo.clientId);
      const gameStates = this.sessionService.session.gameStates.slice();
      gameStates[index] = { ...gameStates[index], users };
      this.sessionService.set({ gameStates });
    }
  }

}
