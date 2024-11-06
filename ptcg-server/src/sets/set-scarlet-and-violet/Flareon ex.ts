import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, EnergyType } from '../../game/store/card/card-types';
import { StoreLike, State, Card, GameMessage, SuperType, SlotType } from '../../game';
import { ChooseCardsPrompt, ChoosePokemonPrompt, ShuffleDeckPrompt, GameError } from '../../game';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { Effect } from '../../game/store/effects/effect';
import { PlayerType } from '../../game';
import { AttackEffect } from '../../game/store/effects/game-effects';

function* useBurningCharge(next: Function, store: StoreLike, state: State,
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
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
    { min: 0, max: 2, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });
  
  if (cards.length > 0) {
    yield store.prompt(state, new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
      PlayerType.BOTTOM_PLAYER,
      [ SlotType.BENCH ],
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

export class Flareonex extends PokemonCard {

  public tags = [ CardTag.POKEMON_ex, CardTag.POKEMON_TERA ];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Eevee';

  public cardType: CardType = CardType.FIRE;

  public hp: number = 270;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    { 
      name: 'Burning Charge', 
      cost: [CardType.FIRE, CardType.COLORLESS], 
      damage: 130, 
      text: 'Search your deck for up to 2 Basic Energy and attach them to 1 of your Pokemon. Then, shuffle your deck.' },
    { 
      name: 'Carnelian', 
      cost: [CardType.FIRE, CardType.WATER, CardType.LIGHTNING], 
      damage: 280, 
      text: 'During your next turn, this Pokemon can’t attack.' }
  ];

  public set: string = 'SSH';

  public name: string = 'Flareon ex';

  public fullName: string = 'Flareon ex SV8a';

  // for preventing the pokemon from attacking on the next turn
  public readonly ATTACK_USED_MARKER = 'ATTACK_USED_MARKER';
  public readonly ATTACK_USED_2_MARKER = 'ATTACK_USED_2_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Burning Charge
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      if (effect.player.marker.hasMarker(this.ATTACK_USED_MARKER, this)) {
        throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
      }

      const generator = useBurningCharge(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Carnelian
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]){
      // Check marker
      if (effect.player.marker.hasMarker(this.ATTACK_USED_MARKER, this)) {
        throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
      }
      effect.player.marker.addMarker(this.ATTACK_USED_MARKER, this);
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.ATTACK_USED_2_MARKER, this)) {
      effect.player.marker.removeMarker(this.ATTACK_USED_MARKER, this);
      effect.player.marker.removeMarker(this.ATTACK_USED_2_MARKER, this);
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.ATTACK_USED_MARKER, this)) {
      effect.player.marker.addMarker(this.ATTACK_USED_2_MARKER, this);
    }

    return state;
  }
}