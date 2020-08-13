import { Component, OnInit, Input } from '@angular/core';
import { Player, ClientInfo } from 'ptcg-server';
import { Observable, EMPTY } from 'rxjs';

import { SessionService } from '../../../shared/session/session.service';

@Component({
  selector: 'ptcg-player-bar',
  templateUrl: './player-bar.component.html',
  styleUrls: ['./player-bar.component.scss']
})
export class PlayerBarComponent implements OnInit {

  @Input() set player(player: Player) {
    this.isEmpty = !player;
    if (this.isEmpty) {
      return;
    }

    this.deckCount = player.deck.cards.length;
    this.handCount = player.hand.cards.length;
    this.discardCount = player.discard.cards.length;
    this.name = player.name;

    this.playerInfo$ = this.sessionService.get(session => {
      return session.clients.find(c => c.clientId === player.id);
    });
  }

  @Input() active: boolean;

  public isEmpty = true;
  public deckCount: number;
  public handCount: number;
  public discardCount: number;
  public name: string;
  public playerInfo$: Observable<ClientInfo | undefined> = EMPTY;

  constructor(
    private sessionService: SessionService
  ) { }

  ngOnInit() { }

}
