import { CardType, PlayerType, PokemonCard, Stage, State, StoreLike } from '../../game';
import { PutCountersEffect } from '../../game/store/effects/attack-effects';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class UxieSSP extends PokemonCard {
  public stage: Stage = Stage.BASIC;
  public cardType: CardType = CardType.PSYCHIC;
  public hp: number = 70;
  public weakness = [{ type: CardType.DARK }];
  public resistance = [{ type: CardType.FIGHTING, value: -30 }];
  public retreat = [ CardType.COLORLESS ];
  public set = 'SVI';
  public name = 'Uxie';
  public fullName = 'Uxie SSP';
  public attacks = [
    {
      name: 'Painful Memories',
      cost: [ CardType.PSYCHIC ],
      damage: 0,
      text: 'Put 2 damage counters on each of your opponent\'s Pokemon.'
    },
  ];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Painful Memories
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        const putCountersEffect = new PutCountersEffect(effect, 20);
        putCountersEffect.target = cardList;
        store.reduceEffect(state, putCountersEffect);
      });
    }
    return state;
  }
}