import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SuperType, EnergyType } from '../../game/store/card/card-types';
import { StoreLike, State, GameMessage, Power, PowerType, ChooseCardsPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { AfterDamageEffect, ApplyWeaknessEffect } from '../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class SkeledirgeexPAR extends PokemonCard {

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Crocalor';

  public tags: string[] = [CardTag.POKEMON_EX, CardTag.POKEMON_TERA];

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 340;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [
    {
      name: 'Incendiary Song',
      powerType: PowerType.ABILITY,
      useWhenInPlay: true,
      text: 'Once during your turn, you may discard a Basic R Energy card from your hand in order ' +
        'to use this Ability. During this turn, attacks used by your Pokemon do 60 more damage to your ' +
        'opponent\'s Active Pokemon (before applying Weakness and Resistance).',
    }
  ];

  public attacks = [
    {
      name: 'Luster Burn',
      cost: [CardType.FIRE, CardType.FIRE],
      damage: 160,
      text: 'This attack\'s damage isn\'t affected by any effects on your opponent\'s Active Pokemon.'
    }
  ];

  public set: string = 'SVI';

  public name: string = 'Skeledirge ex';

  public fullName: string = 'Skeledirge ex SSP';

  private readonly INCENDIARY_SONG_MARKER = 'INCENDIARY_SONG_MARKER';

  private readonly INCENDIARY_SONG_USED_MARKER = 'INCENDIARY_SONG_USED_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Incendiary Song -- Discard a Fire Energy from our hand to put markers on ourselves.
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const marker = player.marker;

      if (marker.hasMarker(this.INCENDIARY_SONG_USED_MARKER, this)) {
        return state;
      }

      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DISCARD,
        player.hand,
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, name: 'Fire Energy' },
        { allowCancel: true, min: 1, max: 1 },
      ), cards => {
        cards = cards || [];
        if (cards.length === 0) {
          return;
        }
        player.marker.addMarker(this.INCENDIARY_SONG_MARKER, this);
        player.marker.addMarker(this.INCENDIARY_SONG_USED_MARKER, this);
      });
    }

    // Apply +60 damage effect
    if (effect instanceof AttackEffect) {
      const marker = effect.player.marker;
      if (marker.hasMarker(this.INCENDIARY_SONG_MARKER)) {
        effect.damage += 60;
      }
    }

    // Remove both markers at turn end
    if (effect instanceof EndTurnEffect) {
      const marker = effect.player.marker;
      if (marker.hasMarker(this.INCENDIARY_SONG_MARKER, this)) {
        marker.removeMarker(this.INCENDIARY_SONG_MARKER, this);
      }
      if (marker.hasMarker(this.INCENDIARY_SONG_USED_MARKER, this)) {
        marker.removeMarker(this.INCENDIARY_SONG_USED_MARKER, this);
      }
    }

    // Luster Burn
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const applyWeakness = new ApplyWeaknessEffect(effect, effect.damage);
      store.reduceEffect(state, applyWeakness);
      const damage = applyWeakness.damage;

      effect.damage = 0;

      if (damage > 0) {
        effect.opponent.active.damage += damage;
        const afterDamage = new AfterDamageEffect(effect, damage);
        state = store.reduceEffect(state, afterDamage);
      }
    }

    return state;
  }

}
