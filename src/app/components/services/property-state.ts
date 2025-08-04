import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PropertyState {
  private propertiesSubject = new BehaviorSubject<any[] | null>(null);
  properties$ = this.propertiesSubject.asObservable();

  setProperties(properties: any[]) {
    this.propertiesSubject.next([...properties]); // <-- fuerza nueva referencia
  }
}
