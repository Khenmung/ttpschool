import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'app-nestedmenu',
  templateUrl: './nestedmenu.component.html',
  styleUrls: ['./nestedmenu.component.scss']
})
export class NestedmenuComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

  @ViewChild('submenu')
  set subMenu(value: MatMenu) {
    this.menuItems[1].elementRef = value;
  }

  selected: string;
  menuItems: Array<{ text: string, elementRef: MatMenu }> = [
    { text: "Tabledriven.Item1", elementRef: null },
    { text: "Tabledriven.Item2", elementRef: null },
  ];

  select(pText: string) {
    this.selected = pText;
  }
}
