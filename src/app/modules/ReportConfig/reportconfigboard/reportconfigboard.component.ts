import { Component, OnInit, ViewChild } from '@angular/core';
import { OrgreportcolumnsComponent } from '../orgreportcolumns/orgreportcolumns.component';
import { OrgReportNamesComponent } from '../OrgReportNames/OrgReportNames.component';
import { ReportConfigComponents } from '../report-configuration-routing.module';
import { ReportconfigdataComponent } from '../../globaladmin/reportconfigdata/reportconfigdata.component';

@Component({
  selector: 'app-reportconfigboard',
  templateUrl: './reportconfigboard.component.html',
  styleUrls: ['./reportconfigboard.component.scss']
})
export class ReportconfigboardComponent implements OnInit {
  @ViewChild(OrgReportNamesComponent) orgreportName: OrgReportNamesComponent;
  @ViewChild(OrgreportcolumnsComponent) reportcolumn: OrgreportcolumnsComponent;
  selectedIndex = 0;

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.orgreportName.PageLoad();
    }, 50);

  }
  tabChanged(tabChangeEvent: number) {
    this.selectedIndex = tabChangeEvent;
    this.navigateTab(this.selectedIndex);
    //   console.log('tab selected: ' + tabChangeEvent);
  }
  public nextStep() {
    this.selectedIndex += 1;
    this.navigateTab(this.selectedIndex);
  }

  public previousStep() {
    this.selectedIndex -= 1;
    this.navigateTab(this.selectedIndex);
  }
  navigateTab(indx) {
    //debugger;
    switch (indx) {
      case 0:
        this.orgreportName.PageLoad();
        break;
      case 1:
        this.reportcolumn.PageLoad();
        break;
      // case 2:
      //   this.reportconfigdata.PageLoad();
      //   break;      
    }
  }
}


