import { Component, OnInit, ViewChild } from '@angular/core';
import { UserconfigreportnameComponent } from '../userconfigreportname/userconfigreportname.component';
import { UserReportConfigColumnsComponent } from '../userreportconfigColumns/userreportconfigcolumns.component';
import { VariableConfigComponent } from '../variable-config/variable-config.component';

@Component({
  selector: 'app-configboard',
  templateUrl: './configboard.component.html',
  styleUrls: ['./configboard.component.scss']
})
export class ConfigboardComponent implements OnInit {
@ViewChild(VariableConfigComponent) variableconfig:VariableConfigComponent;
@ViewChild(UserReportConfigColumnsComponent) userreportconfigcolumns:UserReportConfigColumnsComponent;
@ViewChild(UserconfigreportnameComponent) userreportconfigreportname:UserconfigreportnameComponent;
  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.userreportconfigreportname.PageLoad();
    }, 100);

  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    //this.masterSettingData.PageLoad();
  }
  tabChanged(event) {
 //debugger;
    //console.log(event);
    switch (event) {
      case 0:
        this.userreportconfigreportname.PageLoad();
        break;
      case 1:
        this.userreportconfigcolumns.PageLoad();
        break;
      case 2:
        this.variableconfig.PageLoad();
        break;
      default:
        this.userreportconfigreportname.PageLoad();
        break;
    }
  }
}

