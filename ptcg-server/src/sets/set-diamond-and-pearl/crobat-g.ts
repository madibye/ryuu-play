import { Effect } from "../../game/store/effects/effect";
import { PokemonCard } from "../../game/store/card/pokemon-card";
import { PowerType, StoreLike, State, ConfirmPrompt, ChoosePokemonPrompt,
  PlayerType, SlotType, StateUtils } from "../../game";
import { Stage, CardType, CardTag, SpecialCondition } from "../../game/store/card/card-types";
import { PlayPokemonEffect } from "../../game/store/effects/play-card-effects";
import { CardMessage } from "../card-message";
import { AttackEffect } from "../../game/store/effects/game-effects";
import {BetweenTurnsEffect} from "../../game/store/effects/game-phase-effects";

function* useFlashBite(next: Function, store: StoreLike, state: State, effect: PlayPokemonEffect): IterableIterator<State> {
  const player = effect.player;

  let wantToUse = false;
  yield store.prompt(state, new ConfirmPrompt(
    effect.player.id,
    CardMessage.USE_FLASH_BITE_ABILITY
  ), result => {
    wantToUse = result;
    next();
  });

  if (!wantToUse) {
    return state;
  }

  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    CardMessage.CHOOSE_OPPONENTS_POKEMON,
    PlayerType.TOP_PLAYER,
    [ SlotType.ACTIVE, SlotType.BENCH ],
    { count: 1, allowCancel: true },
  ), selected => {
    if (!selected || selected.length === 0) {
      return state;
    }

    const target = selected[0];
    target.damage += 10;
    next();
  });

  return state;
}


export class CrobatG extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public tags = [ CardTag.POKEMON_SP ];

  public hp: number = 80;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -20 }];

  public retreat = [ ];

  public powers = [{
    name: 'Flash Bite',
    powerType: PowerType.POKEPOWER,
    text: 'Once during your turn, when you put Crobat G from your hand ' +
      'onto your Bench, you may put 1 damage counter on 1 of your ' +
      'opponent\'s Pokémon.'
  }];

  public attacks = [
    {
      name: 'Toxic Fang',
      cost: [ CardType.PSYCHIC, CardType.COLORLESS ],
      damage: 0,
      text: 'The Defending Pokémon is now Poisoned. Put 2 damage counters ' +
      ' instead of 1 on the Defending Pokémon between turns.'
    }
  ];

  public set: string = 'DP';

  public name: string = 'Crobat G';

  public fullName: string = 'Crobat G PL';

  private readonly TOXIC_MARKER = 'CROBAT_G_TOXIC_FANG';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      let generator: IterableIterator<State>;
      generator = useFlashBite(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const defending = StateUtils.getOpponent(state, effect.player).active;
      defending.addSpecialCondition(SpecialCondition.POISONED);
      defending.addMarker(this.TOXIC_MARKER, this);
    }

    if (effect instanceof BetweenTurnsEffect) {
      if (effect.player.active.hasMarker(this.TOXIC_MARKER)) {
        effect.poisonDamage = 20;
      }
    }

    return state;
  }

}
