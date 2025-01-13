import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleService {
  get nativeGoogle():  any | null {
    return typeof google !== 'undefined'? google : null;
  }
}