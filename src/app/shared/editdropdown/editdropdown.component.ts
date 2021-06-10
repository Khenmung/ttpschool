import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-editdropdown',
  templateUrl: './editdropdown.component.html',
  styleUrls: ['./editdropdown.component.scss']
})
export class EditdropdownComponent implements OnInit {

  @Input() data: any[];
  @Output() focusOut: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() tried: EventEmitter<string> = new EventEmitter<string>();
  editMode = false;
  constructor() {}

  ngOnInit() {}

  onFocusOut() {
    this.focusOut.emit(this.data);
  }
 
}