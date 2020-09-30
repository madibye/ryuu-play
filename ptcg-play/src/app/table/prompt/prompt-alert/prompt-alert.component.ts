import { Component, OnInit, Input } from '@angular/core';
import { AlertPrompt } from 'ptcg-server';

import { GameService } from '../../../api/services/game.service';
import { LocalGameState } from '../../../shared/session/session.interface';

@Component({
  selector: 'ptcg-prompt-alert',
  templateUrl: './prompt-alert.component.html',
  styleUrls: ['./prompt-alert.component.scss']
})
export class PromptAlertComponent implements OnInit {

  @Input() prompt: AlertPrompt;
  @Input() gameState: LocalGameState;

  constructor(private gameService: GameService) { }

  public confirm() {
    const gameId = this.gameState.gameId;
    const id = this.prompt.id;
    this.gameService.resolvePrompt(gameId, id, true);
  }

  ngOnInit() {
  }

}
