import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';

export class Sandygast extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 90;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [ CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS ];

  public attacks = [
    { name: 'Sand Spray', cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS], damage: 50, text: '' }
  ];

  public set: string = 'SSH';

  public name: string = 'Sandygast';

  public fullName: string = 'Sandygast SSP';

}
