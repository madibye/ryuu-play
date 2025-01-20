import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { StoreLike, State, StateUtils, PlayerType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { AfterDamageEffect, ApplyWeaknessEffect } from '../../game/store/effects/attack-effects';

export class Dudunsparceex extends PokemonCard {
  public tags = [ CardTag.POKEMON_ex ];
  public stage: Stage = Stage.STAGE_1;
  public evolvesFrom = 'Dunsparce';
  public cardType: CardType = CardType.COLORLESS;
  public hp: number = 270;
  public weakness = [{ type: CardType.FIGHTING }];
  public retreat = [ CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    { 
      name: 'Adversity Tail', 
      cost: [ CardType.COLORLESS ], 
      damage: 60,
      damageCalculation: 'x',
      text: 'This attack does 60 damage for each of your opponent’s Pokémon ex.' },
    { 
      name: 'Drill Break', 
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS], 
      damage: 150, 
      text: 'This attack’s damage isn’t affected by any effects on your opponent’s Active Pokémon.' }
  ];

  public set: string = 'SV9';
  public regulationMark = 'I';
  public cardImage: string = 'assets/cardback.png';
  public setNumber: string = '79';

  public name: string = 'Dudunsparce ex';
  public fullName: string = 'Dudunsparce ex SV9';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Adversity Tail
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      
      let exsInPlay = 0;
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card) =>{
        if (card.tags.includes(CardTag.POKEMON_ex)){
            exsInPlay++;
        }
      });

      effect.damage = 60 * exsInPlay;
    }

    // Drill Break
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]){
        const player = effect.player;
        const opponent = StateUtils.getOpponent(state, player);
    
        const applyWeakness = new ApplyWeaknessEffect(effect, 150);
        store.reduceEffect(state, applyWeakness);
        const damage = applyWeakness.damage;
    
        effect.damage = 0;
    
        if (damage > 0) {
            opponent.active.damage += damage;
            const afterDamage = new AfterDamageEffect(effect, damage);
            state = store.reduceEffect(state, afterDamage);
        }
    }

    return state;
  }
}