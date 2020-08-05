import { PokemonCard } from "../../game/store/card/pokemon-card";
import { Stage, CardType, SuperType } from "../../game/store/card/card-types";
import { StoreLike, State, ChooseCardsPrompt, Card, ShuffleDeckPrompt,
  CoinFlipPrompt, ShowCardsPrompt, StateUtils, PowerType, GameError,
  GameMessage, PokemonCardList } from "../../game";
import { AttackEffect, PowerEffect } from "../../game/store/effects/game-effects";
import { Effect } from "../../game/store/effects/effect";
import { CardMessage } from "../card-message";

function* useBabyEvolution(next: Function, store: StoreLike, state: State,
  self: Pichu, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;
  const cardList = StateUtils.findCardList(state, self);
  if (!(cardList instanceof PokemonCardList)) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }
  const hasPikachu = player.hand.cards.some(c => c.name === 'Pikachu');
  if (!hasPikachu) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    CardMessage.CHOOSE_ONE_POKEMON,
    player.hand,
    { superType: SuperType.POKEMON, name: 'Pikachu' },
    { min:1, max: 1, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length > 0) {
    player.hand.moveCardsTo(cards, cardList);
    cardList.pokemonPlayedTurn = state.turn;
    cardList.damage = 0;
  }

  return state;
}

function* useFindAFriend(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (player.deck.cards.length === 0) {
    return state;
  }

  let coinResult: boolean = false;
  yield store.prompt(state, new CoinFlipPrompt(
    player.id,
    CardMessage.COIN_FLIP
  ), result => {
    coinResult = result;
    next();
  });

  if (coinResult === false) {
    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    CardMessage.CHOOSE_ONE_POKEMON,
    player.deck,
    { superType: SuperType.POKEMON },
    { allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      CardMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      cards
    ), () => next());
  }

  player.deck.moveCardsTo(cards, player.hand);

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}


export class Pichu extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 40;

  public weakness = [{ type: CardType.FIGHTING, value: 10 }];

  public resistance = [{ type: CardType.METAL, value: -20 }];

  public retreat = [ CardType.COLORLESS ];

  public powers = [{
    name: 'Baby Evolution',
    powerType: PowerType.POKEPOWER,
    text: 'Once during your turn (before your attack), you may put Pikachu ' +
      'from your hand onto Pichu (this counts as evolving Pichu) and remove ' +
      'all damage counters from Pichu.'
  }];

  public attacks = [
    {
      name: 'Find a Friend',
      cost: [ ],
      damage: 0,
      text: 'Flip a coin. If heads, search your deck for a Pokemon, ' +
        'show it to your opponent, and put it into your hand. ' +
        'Shuffle your deck afterward.'
    }
  ];

  public set: string = 'OP9';

  public name: string = 'Pichu';

  public fullName: string = 'Pichu OP9';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      let generator: IterableIterator<State>;
      generator = useBabyEvolution(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      let generator: IterableIterator<State>;
      generator = useFindAFriend(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}