import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { GameState, Card, MoveEnergyPrompt, CardTarget, FilterType } from 'ptcg-server';

import { GameService } from '../../../api/services/game.service';
import { PokemonData, PokemonItem } from '../choose-pokemons-pane/pokemon-data';

interface MoveEnergyResult {
  from: PokemonItem;
  to: PokemonItem;
  card: Card;
}

@Component({
  selector: 'ptcg-prompt-move-energy',
  templateUrl: './prompt-move-energy.component.html',
  styleUrls: ['./prompt-move-energy.component.scss']
})
export class PromptMoveEnergyComponent implements OnInit, OnChanges {

  @Input() prompt: MoveEnergyPrompt;
  @Input() gameState: GameState;

  public pokemonData: PokemonData;
  public selectedItem: PokemonItem | undefined;
  public allowedCancel: boolean;
  public promptId: number;
  public message: string;
  public filter: FilterType;
  public isInvalid = false;

  private min: number;
  private max: number | undefined;

  private blockedFrom: CardTarget[];
  private blockedTo: CardTarget[];
  private results: MoveEnergyResult[] = [];

  constructor(
    private gameService: GameService
  ) { }

  public cancel() {
    const gameId = this.gameState.gameId;
    const id = this.promptId;
    this.gameService.resolvePrompt(gameId, id, null);
  }

  public confirm() {
    const gameId = this.gameState.gameId;
    const id = this.promptId;
    const results = this.results.map(r => ({
      from: r.from.target,
      to: r.to.target,
      index: this.pokemonData.getCardIndex(r.card)
    }));
    this.gameService.resolvePrompt(gameId, id, results);
  }

  ngOnInit() {
  }

  public onCardClick(item: PokemonItem) {
    if (this.pokemonData.matchesTarget(item, this.blockedFrom)) {
      return;
    }
    this.pokemonData.unselectAll();
    item.selected = true;
    this.selectedItem = item;
  }

  public onCardDrop([item, card]: [PokemonItem, Card]) {
    if (item === this.selectedItem) {
      return;
    }
    if (this.pokemonData.matchesTarget(item, this.blockedTo)) {
      return;
    }
    const index = this.selectedItem.cardList.cards.indexOf(card);
    if (index === -1) {
      return;
    }
    const result: MoveEnergyResult = {
      from: this.selectedItem,
      to: item,
      card
    };
    this.moveCard(result.from, result.to, card);
    this.appendMoveResult(result);
    this.updateIsInvalid(this.results);
  }

  private moveCard(from: PokemonItem, to: PokemonItem, card: Card) {
    from.cardList = { ...from.cardList } as any;
    from.cardList.cards = [...from.cardList.cards];

    to.cardList = { ...to.cardList } as any;
    to.cardList.cards = [...to.cardList.cards];

    const index = from.cardList.cards.indexOf(card);
    from.cardList.cards.splice(index, 1);
    to.cardList.cards.push(card);
  }

  private appendMoveResult(result: MoveEnergyResult) {
    const index = this.results.findIndex(r => r.card === result.card);
    if (index === -1) {
      this.results.push(result);
      return;
    }
    const prevResult = this.results[index];
    if (prevResult.from === result.to) {
      this.results.splice(index, 1);
      return;
    }
    prevResult.to = result.to;
  }

  private updateIsInvalid(results: MoveEnergyResult[]) {
    let isInvalid = false;
    if (this.min > results.length) {
      isInvalid = true;
    }
    if (this.max !== undefined && this.max < results.length) {
      isInvalid = true;
    }
    this.isInvalid = isInvalid;
  }

  ngOnChanges() {
    if (this.prompt && this.gameState) {
      const state = this.gameState.state;
      const prompt = this.prompt;
      const playerId = prompt.playerId;
      const playerType = prompt.playerType;
      const slots = prompt.slots;

      this.pokemonData = new PokemonData(state, playerId, playerType, slots);
      this.blockedFrom = prompt.options.blockedFrom;
      this.blockedTo = prompt.options.blockedTo;
      this.allowedCancel = prompt.options.allowCancel;
      this.filter = prompt.filter;
      this.message = prompt.message;
      this.promptId = prompt.id;
      this.selectedItem = undefined;
      this.results = [];
      this.min = prompt.options.min;
      this.max = prompt.options.max;
      this.updateIsInvalid(this.results);
    }
  }

}