import { AttachEnergyPrompt, CardType, EnergyCard, EnergyType, GameMessage, PlayerType, PokemonCard, SlotType, Stage, State, StateUtils, StoreLike, SuperType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { AttachEnergyEffect } from '../../game/store/effects/play-card-effects';

export class MespritSSP extends PokemonCard {
  public stage: Stage = Stage.BASIC;
  public cardType: CardType = CardType.PSYCHIC;
  public hp: number = 70;
  public weakness = [{ type: CardType.DARK }];
  public resistance = [{ type: CardType.FIGHTING, value: -30 }];
  public retreat = [ CardType.COLORLESS ];
  public set = 'SVI';
  public name = 'Mesprit';
  public fullName = 'Mesprit SSP';
  public attacks = [
    {
      name: 'Full Heart',
      cost: [ CardType.COLORLESS ],
      damage: 0,
      text: 'Attach up to 2 Basic P Energy cards from your hand to your Pokemon in any way you like.'
    },
    {
      name: 'Guardian Burst',
      cost: [ CardType.PSYCHIC, CardType.PSYCHIC ],
      damage: 160,
      text: 'If you don\'t have Uxie and Azelf on your Bench, this attack does nothing.'
    },
  ];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Full Heart
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const hasEnergyInHand = player.hand.cards.some(c => {
        return c instanceof EnergyCard
          && c.energyType === EnergyType.BASIC
          && c.provides.includes(CardType.PSYCHIC);
      });
      if (!hasEnergyInHand) { return state; }

      return store.prompt(state, new AttachEnergyPrompt(
        player.id,
        GameMessage.ATTACH_ENERGY_CARDS,
        player.hand,
        PlayerType.BOTTOM_PLAYER,
        [ SlotType.BENCH, SlotType.ACTIVE ],
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, name: 'Psychic Energy' },
        { min: 0, max: 2, allowCancel: true }
      ), transfers => {
        transfers = transfers || [];
        for (const transfer of transfers) {
          const target = StateUtils.getTarget(state, player, transfer.to);
          const energyCard = transfer.card as EnergyCard;
          const attachEnergyEffect = new AttachEnergyEffect(player, energyCard, target);
          store.reduceEffect(state, attachEnergyEffect);
        }
        if (transfers.length > 0) {
          player.deck.moveTo(player.hand, 3);
        }
      });
    }
    // Guardian Burst
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      if (!(player.bench.some(b => b.getPokemonCard()?.name == 'Uxie')) || 
        !(player.bench.some(b => b.getPokemonCard()?.name == 'Azelf'))
      ) { effect.damage = 0; }
    }
    return state;
  }
}