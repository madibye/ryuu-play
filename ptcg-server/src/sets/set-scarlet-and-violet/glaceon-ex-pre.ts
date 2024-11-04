import { CardTag, CardTarget, CardType, ChoosePokemonPrompt, GameMessage, PlayerType, PokemonCard, SlotType, Stage, State, StateUtils, StoreLike } from '../../game';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, KnockOutEffect } from '../../game/store/effects/game-effects';

export class GlaceonEXPRE extends PokemonCard {
  public tags = [ CardTag.POKEMON_EX_SV, CardTag.POKEMON_TERA ];
  public stage: Stage = Stage.STAGE_1;
  public evolvesFrom = 'Eevee';
  public cardType: CardType = CardType.WATER;
  public hp: number = 270;
  public weakness = [{ type: CardType.METAL }];
  public retreat = [ CardType.COLORLESS ];
  public set = 'SVI';
  public name = 'Glaceon ex';
  public fullName = 'Glaceon ex PRE';
  public attacks = [
    {
      name: 'Frost Bullet',
      cost: [ CardType.WATER, CardType.COLORLESS ],
      damage: 110,
      text: 'This attack does 30 damage to 1 of your opponent\'s Benched Pokemon.'
    },
    {
      name: 'Euclase',
      cost: [ CardType.GRASS, CardType.WATER, CardType.DARK ],
      damage: 0,
      text: 'Knock Out 1 of your opponent\'s Pokemon that has exactly 6 damage counters on it.'
    },
  ];
  
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Frost Bullet
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const hasBenched = opponent.bench.some(b => b.cards.length > 0);
      if (!hasBenched) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [ SlotType.BENCH ],
        { allowCancel: false }
      ), targets => {
        if (!targets || targets.length === 0) {
          return;
        }
        const damageEffect = new PutDamageEffect(effect, 30);
        damageEffect.target = targets[0];
        store.reduceEffect(state, damageEffect);
      });
    }

    // Euclase
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const hasBenched = opponent.bench.some(b => b.cards.length > 0 && b.damage == 60);
      if (!hasBenched) { return state; }

      const euclaseBlocked: CardTarget[] = [];
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cards, card, target) => {
        if (cards.damage !== 60) { euclaseBlocked.push(target); }
      });

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [ SlotType.BENCH ],
        { min: 1, max: 1, allowCancel: false, blocked: euclaseBlocked }
      ), targets => {
        if (!targets || targets.length === 0) { return; }
        const koEffect = new KnockOutEffect(player, targets[0]);
        store.reduceEffect(state, koEffect);
      });
    }
    return state;
  }
}