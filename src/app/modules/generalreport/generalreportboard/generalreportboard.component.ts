import { Component, OnInit, ViewChild } from '@angular/core';
import { GetreportComponent } from '../getreport/getreport.component';

@Component({
  selector: 'app-generalreportboard',
  templateUrl: './generalreportboard.component.html',
  styleUrls: ['./generalreportboard.component.scss']
})
export class GeneralReportboardComponent implements OnInit {
  @ViewChild(GetreportComponent) Getreport:GetreportComponent;
    selectedIndex = 0;
    constructor() { }
  
    ngOnInit(): void {
      setTimeout(() => {
        this.Getreport.PageLoad();
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
          this.Getreport.PageLoad();
          break;
        // case 1:
        //   this.userreportconfigcolumns.PageLoad();
        //   break;
        // case 2:
        //   this.variableconfig.PageLoad();
        //   break;
        default:
          this.Getreport.PageLoad();
          break;
      }
    }
  }
