import { CardType, PlayerType, PokemonCard, Stage, State, StoreLike } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class AzelfSSP extends PokemonCard {
  public stage: Stage = Stage.BASIC;
  public cardType: CardType = CardType.PSYCHIC;
  public hp: number = 70;
  public weakness = [{ type: CardType.LIGHTNING }];
  public resistance = [{ type: CardType.FIGHTING, value: -20 }];
  public retreat = [ CardType.COLORLESS ];
  public set = 'SVI';
  public name = 'Azelf';
  public fullName = 'Azelf SSP';
  public attacks = [
    {
      name: 'Neurokinesis',
      cost: [ CardType.PSYCHIC, CardType.COLORLESS ],
      damage: 0,
      text: 'This attack does 10 more damage for each damage counter on all of your opponent\'s Pokemon.'
    },
  ];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Neurokinesis
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {effect.damage += cardList.damage;});
    }
    return state;
  }
}