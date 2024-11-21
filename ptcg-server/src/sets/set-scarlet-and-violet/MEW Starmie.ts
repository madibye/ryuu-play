import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { PowerType, State, StoreLike, GameMessage, GameError, PlayerType, ChoosePokemonPrompt, SlotType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { PowerEffect } from '../../game/store/effects/game-effects';

export class Starmie extends PokemonCard {

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Staryu';

  public cardType: CardType = CardType.WATER;

  public hp: number = 90;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [ CardType.COLORLESS ];

  public powers = [{
    name: 'Mysterious Comet',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text: 'Once during your turn, you may put 2 damage counters on 1 of your opponent\'s Pokémon. If you placed any damage counters in this way, discard this Pokémon and all attached cards.'
  }];

  public attacks = [
    {
      name: 'Speed Attack',
      cost: [ CardType.WATER, CardType.COLORLESS ],
      damage: 50,
      text: ''
    }
  ];

  public set: string = 'SVI';

  public name: string = 'Starmie';

  public fullName: string = 'Starmie MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      // checking if this pokemon is in play
      let isThisOnBench = false;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card) => {
        if (card === this) {

          store.prompt(state, new ChoosePokemonPrompt(
            player.id,
            GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
            PlayerType.TOP_PLAYER,
            [ SlotType.ACTIVE, SlotType.BENCH ],
            { allowCancel: false }
          ), targets => {
            if (!targets || targets.length === 0) {
              return;
            }
            targets[0].damage += 20;
          });
            
          isThisOnBench = true;
          cardList.moveTo(player.discard);
          cardList.clearEffects();
        }
      });
      if (!isThisOnBench){
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }
    }
    
    return state;
  }
}
