import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IPage } from './interface';
@Injectable({
  providedIn: 'root'
})
export class SharedataService {
  PageDetail: IPage;
  private _messageSource = new Subject<IPage>();
  message$ = this._messageSource.asObservable();

  constructor() { }

  sendPageDetail(value: IPage) {
    this._messageSource.next(value);
    //this.PageDetail =value;
  }
  getPageDetail() {
    return this.PageDetail;
  }
}
