import { Injectable, OnDestroy, OnInit } from '@angular/core';
// import { Observable, Subject } from 'rxjs';
// import { IPage } from './interface';

@Injectable({
  providedIn: 'root'
})
export class SharedataService {
  items=[];
  constructor() { }
  ngOnInit() {

  }

  addData(item) {

    this.items=[...item];
  }

  clearData() {
    this.items=[];
    return this.items;
  }

  getData() {
    return this.items;
  }
}
