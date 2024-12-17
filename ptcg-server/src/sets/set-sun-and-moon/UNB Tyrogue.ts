import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameMessage, CoinFlipPrompt, ChoosePokemonPrompt, PlayerType, SlotType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { PowerEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class Tyrogue extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 60;

  public powers = [{
    name: 'Bratty Kick',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text: 'Once during your turn (before your attack), you may flip a coin. If heads, put 3 damage counters on 1 of your opponent\'s Pokémon. If you use this Ability, your turn ends.'
  }];

  public set: string = 'SUM';

  public name: string = 'Tyrogue';

  public fullName: string = 'Tyrogue UNB';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    
    // Bratty Kick
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          store.prompt(state, new ChoosePokemonPrompt(
            player.id,
            GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
            PlayerType.TOP_PLAYER,
            [ SlotType.ACTIVE, SlotType.BENCH ],
            { allowCancel: true }
          ), targets => {
            const target = targets[0];
            target.damage += 30;
          });
        }
      });

      const endTurnEffect = new EndTurnEffect(player);
      return store.reduceEffect(state, endTurnEffect);
    }

    return state;
  }
}