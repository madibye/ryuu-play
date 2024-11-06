import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { StoreLike, State, StateUtils, GameMessage, PlayerType, SlotType, ChoosePokemonPrompt} from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';
// citing empoleon to help make this (https://github.com/keeshii/ryuu-play/blob/master/ptcg-server/src/sets/set-black-and-white/empoleon.ts)

export class Hydreigonex extends PokemonCard {

  public tags = [ CardTag.POKEMON_ex, CardTag.POKEMON_TERA ];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Zweilous';

  public cardType: CardType = CardType.DARK;

  public hp: number = 330;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    {
      name: 'Crash Heads',
      cost: [ CardType.DARK, CardType.COLORLESS ],
      damage: 200,
      text: 'Discard the top 3 cards from your opponent\'s deck.'
    },
  
    {
      name: 'Obsidian',
      cost: [ CardType.PSYCHIC, CardType.DARK, CardType.METAL, CardType.COLORLESS ],
      damage: 130,
      text: 'This attack also does 130 damage to 2 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokemon.)'
    }
  ];

  public set: string = 'SV8';

  public name: string = 'Hydreigon-ex';

  public fullName: string = 'Hydreigon-ex SV8';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Crash Heads
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]){
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      opponent.deck.moveTo(opponent.discard, 3);

      return state;
    }

    // Obsidian
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]){
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const hasBenched = opponent.bench.some(b => b.cards.length > 0);
      if (!hasBenched) {
        return state;
      }

      const benched = opponent.bench.reduce((left, b) => left + (b.cards.length ? 1 : 0), 0);
      const count = Math.min(2, benched);

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [ SlotType.BENCH ],
        { min: count, max: count,     allowCancel: true }
      ), targets => {
        if (!targets || targets.length === 0) {
          return;
        }
        targets.forEach(target => {
          const damageEffect = new PutDamageEffect(effect, 10);
          damageEffect.target = target;
          store.reduceEffect(state, damageEffect);
        });
      });
    }
    return state;
  }
}