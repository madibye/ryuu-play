import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Card, SuperType, Stage, PowerType, EnergyType, TrainerType } from 'ptcg-server';
import { AlertService } from '../../alert/alert.service';

export interface CardInfoPaneOptions {
  enableAbility?: boolean;
  enableAttack?: boolean;
  enableTrainer?: boolean;
}

export interface CardInfoPaneAction {
  attack?: string;
  ability?: string;
  trainer?: boolean;
}

@Component({
  selector: 'ptcg-card-info-pane',
  templateUrl: './card-info-pane.component.html',
  styleUrls: ['./card-info-pane.component.scss']
})
export class CardInfoPaneComponent implements OnInit {

  @Input() card: Card;
  @Input() facedown: boolean;
  @Input() options: CardInfoPaneOptions = {};
  @Output() action = new EventEmitter<any>();

  public SuperType = SuperType;
  public Stage = Stage;
  public PowerType = PowerType;
  public EnergyType = EnergyType;
  public TrainerType = TrainerType;

  constructor(
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
  }

  public clickAction(action: CardInfoPaneAction) {
    this.action.next(action);
  }

  public showCardImage(card: Card) {
    this.alertService.cardImage(card);
  }

}
