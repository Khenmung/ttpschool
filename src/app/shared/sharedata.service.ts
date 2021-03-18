import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IPage } from './interface';

@Injectable({
  providedIn: 'root'
})
export class SharedataService {
  private subject = new Subject<any>();
  PageDetail: IPage;
  private _messageSource = new Subject<IPage>();
  message$ = this._messageSource.asObservable();

  constructor() { }
  ngOnInit() {

  }

  sendPageDetail(value: IPage) {
    this._messageSource.next(value);
    //this.PageDetail =value;
  }
  getPageDetail() {
    return this.PageDetail;
  }

  sendData(message: string) {
    this.subject.next(message);
  }

  clearData() {
    this.subject.next();
  }

  getData(): Observable<any> {
    return this.subject.asObservable();
  }
}
