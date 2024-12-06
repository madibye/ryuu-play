import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';

export class Yamask extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 70;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [ CardType.COLORLESS ];

  public attacks = [
    { name: 'Mumble', cost: [CardType.PSYCHIC], damage: 10, text: '' },
    { name: 'Petty Grudge', cost: [CardType.PSYCHIC, CardType.COLORLESS], damage: 20, text: '' }
  ];

  public set: string = 'SVI';

  public name: string = 'Yamask';

  public fullName: string = 'Yamask SSP';

}
