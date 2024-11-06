import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';

export class RowletOBF extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 70;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [ CardType.COLORLESS ];

  public attacks = [
    { name: 'Razor Wing', cost: [CardType.GRASS], damage: 20, text: '' }
  ];

  public set: string = 'SVI';

  public name: string = 'Rowlet';

  public fullName: string = 'Rowlet OBF';

}
