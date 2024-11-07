import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType, EnergyType } from '../../game/store/card/card-types';
import { StoreLike, State, GameMessage, Card, ChooseCardsPrompt, ChoosePokemonPrompt, PlayerType, SlotType, ShuffleDeckPrompt } from '../../game';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';

function* useSynthesis(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
    
  const player = effect.player;
    
  if (player.deck.cards.length === 0) {
    return state;
  }
    
  const hasBenched = player.bench.some(b => b.cards.length > 0);
  if (!hasBenched) {
    return state;
  }
    
  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, name: 'Grass Energy' },
    { min: 0, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });
    
  if (cards.length > 0) {
    yield store.prompt(state, new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
      PlayerType.BOTTOM_PLAYER,
      [ SlotType.ACTIVE, SlotType.BENCH ],
      { allowCancel: false }
    ), targets => {
      if (!targets || targets.length === 0) {
        return;
      }
      const target = targets[0];
      player.deck.moveCardsTo(cards, target);
      next();
    });
  }
    
  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Fomantis extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 60;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [ CardType.COLORLESS ];

  public attacks = [
    { 
      name: 'Synthesis', 
      cost: [CardType.COLORLESS], 
      damage: 0, 
      text: 'Search your deck for a [G] Energy card and attach it to 1 of your Pokémon. Then, shuffle your deck.'
    },

    { 
      name: 'Leafage', 
      cost: [CardType.GRASS, CardType.COLORLESS], 
      damage: 20, 
      text: '' 
    },
  ];

  public set: string = 'SSH';

  public name: string = 'Fomantis';

  public fullName: string = 'Fomantis SUM';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Eye Opener
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useSynthesis(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}