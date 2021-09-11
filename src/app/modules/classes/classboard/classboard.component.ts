import { Component, OnInit, ViewChild } from '@angular/core';
import { ClassdetailComponent } from '../classdetail/classdetail.component';
import { ClassprerequisiteComponent } from '../classprerequisite/classprerequisite.component';
import { DashboardclassfeeComponent } from '../dashboardclassfee/dashboardclassfee.component';

@Component({
  selector: 'app-classboard',
  templateUrl: './classboard.component.html',
  styleUrls: ['./classboard.component.scss']
})
export class ClassboardComponent implements OnInit {
  @ViewChild(ClassdetailComponent) Classdetail:ClassdetailComponent;
  @ViewChild(DashboardclassfeeComponent) classfee:DashboardclassfeeComponent;
  @ViewChild(ClassprerequisiteComponent) prequisites:ClassprerequisiteComponent;
  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    
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
    debugger;
    switch (indx) {
      case 0:
        this.Classdetail.PageLoad();
        break;
      case 1:
        this.classfee.PageLoad();
        break;
      case 2:
        this.prequisites.PageLoad();
        break;
      // case 3:
      //   this.subjectmarkComponent.PageLoad();
      //   break;
      // case 4:
      //   this.studentclass.PageLoad();
      //   break;
      // case 5:
      //   this.studentsubject.PageLoad();
      //   break;
      // case 6:
      //   this.Classperiod.PageLoad();
      //   break;

    }
  }
}

