import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { StoreLike, State, GameWinner } from '../../game';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { endGame } from '../../game/store/effect-reducers/check-effect';

export class NsSigilyph extends PokemonCard {

  public tags = [ CardTag.N_POKEMON ];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 110;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [ CardType.COLORLESS ];

  public attacks = [
    { 
      name: 'Psychic Sphere', 
      cost: [ CardType.PSYCHIC ], 
      damage: 20, 
      text: '' 
    },

    { 
      name: 'Victory Symbol', 
      cost: [ CardType.PSYCHIC, CardType.COLORLESS, CardType.COLORLESS ], 
      damage: 0, 
      text: 'If you use this attack when you have only 1 Prize card remaining, you win this game.' 
    },
    
  ];

  public set: string = 'SVI';

  public name: string = 'N\'s Sigilyph';

  public fullName: string = 'N\'s Sigilyph SV9';

  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]){
      const player = effect.player;
      const owner = state.activePlayer;
        
      if (player.getPrizeLeft() === 1){
        if (owner === 0){
          state = endGame(store, state, GameWinner.PLAYER_1);
        }
        if (owner === 1){
          state = endGame(store, state, GameWinner.PLAYER_2);
        }
      }
    }

    return state;
  }
  
}