import { GameError } from '../../game/game-error';
import { GameMessage } from '../../game/game-message';
import { Effect } from '../../game/store/effects/effect';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { EnergyType, SuperType, TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { Card, ChoosePokemonPrompt, PlayerType, ShuffleDeckPrompt, SlotType } from '../../game';
import { State } from '../../game/store/state/state';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import {EndTurnEffect} from '../../game/store/effects/game-phase-effects';

function* playCard(next: Function, store: StoreLike, state: State,
  effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  
  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }
    
  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, name: 'Fire Energy' },
    { min: 0, max: 4, allowCancel: false }
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
    
  store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });

  const endTurnEffect = new EndTurnEffect(player);
  return store.reduceEffect(state, endTurnEffect);
}

export class Kiawe extends TrainerCard {

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'SUM';

  public name: string = 'Kiawe';

  public fullName: string = 'Kiawe BUS';

  public text: string =
    'Search your deck for up to 4 [R] Energy cards and attach them to 1 of your Pokémon. Then, shuffle your deck. Your turn ends.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
