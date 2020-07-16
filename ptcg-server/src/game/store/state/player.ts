import { CardList } from "./card-list";
import { PokemonCardList } from "./pokemon-card-list";

export class Player {

  id: number = 0;

  name: string = '';

  deck: CardList = new CardList();

  hand: CardList = new CardList();

  discard: CardList = new CardList();

  stadium: CardList = new CardList();

  active: PokemonCardList = new PokemonCardList();

  bench: PokemonCardList[] = [];

  prizes: CardList[] = [];

  retreatedTurn: number = 0;

  energyPlayedTurn: number = 0;

  supporterPlayedTurn: number = 0;
  
  stadiumPlayedTurn: number = 0;

  stadiumUsedTurn: number = 0;

  getPrizeLeft(): number {
    return this.prizes.reduce((left, p) => left + p.cards.length, 0);
  }

}
