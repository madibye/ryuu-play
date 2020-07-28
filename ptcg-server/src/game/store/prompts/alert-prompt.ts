import { Prompt } from "./prompt";

export class AlertPrompt extends Prompt<void> {

  readonly type: string = 'Alert'

  constructor(playerId: number, public message: string) {
    super(playerId);
  }

}
