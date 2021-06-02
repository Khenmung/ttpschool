import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'edit-input',
  templateUrl: './edit-input.component.html',
  styleUrls: ['./edit-input.component.scss'],
})
export class EditInputComponent implements OnInit {
  @Input() data: string;
  @Output() focusOut: EventEmitter<string> = new EventEmitter<string>();
  @Output() tried: EventEmitter<string> = new EventEmitter<string>();
  currency = '$';
  editMode = false;
  constructor() {}

  ngOnInit() {}

  onFocusOut() {
    this.focusOut.emit(this.data);
  }
  oninputfocus(){
    this.tried.emit(this.data);
    //console.log(this.data);
  }
}
