import { Injectable } from '@angular/core';

import { ApiService } from '../api.service';
import { DeckListResponse, DeckResponse } from '../interfaces/deck.interface';
import { Response } from '../interfaces/response.interface';


@Injectable()
export class DeckService {

  constructor(
    private api: ApiService,
  ) {}

  public getList() {
    return this.api.get<DeckListResponse>('/decks/list');
  }

  public getDeck(deckId: number) {
    return this.api.get<DeckResponse>('/decks/get/' + deckId);
  }

  public createDeck(deckName: string) {
    return this.api.post<DeckResponse>('/decks/save', {
      name: deckName,
      cards: []
    });
  }

  public deleteDeck(deckId: number) {
    return this.api.post<Response>('/decks/delete', {
      id: deckId
    });
  }

  public rename(deckId: number, name: string) {
    return this.api.post<Response>('/decks/rename', {
      id: deckId,
      name
    });
  }

  public duplicate(deckId: number, name: string) {
    return this.api.post<Response>('/decks/duplicate', {
      id: deckId,
      name
    });
  }

}