import { Component, OnInit, ViewChild } from '@angular/core';
import { AddMasterDataComponent } from '../../FeesManagement/add-master-data/add-master-data.component';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-signup',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class settingsComponent implements OnInit {
  @ViewChild(AddMasterDataComponent) masterSettingData: AddMasterDataComponent;
  @ViewChild(RegisterComponent) signup:RegisterComponent;
  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
  }
  tabChanged(event) {
    //console.log(event);
    switch (event) {
      case 0:
        this.signup.PageLoad();
        break;
      case 1:
        this.masterSettingData.PageLoad();
        break;
      default:
        this.signup.PageLoad();
        break;
    }
  }
}
