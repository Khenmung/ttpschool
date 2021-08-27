import { Component, OnInit, ViewChild } from '@angular/core';
import { EmpComponentsComponent } from '../emp-components/emp-components.component';
import { EmployeeGradehistoryComponent } from '../employee-gradehistory/employee-gradehistory.component';
import { EmployeeSalaryComponentComponent } from '../employee-salary-component/employee-salary-component.component';

@Component({
  selector: 'app-empmanagementboard',
  templateUrl: './empmanagementboard.component.html',
  styleUrls: ['./empmanagementboard.component.scss']
})
export class EmpmanagementboardComponent implements OnInit {
@ViewChild(EmpComponentsComponent) Component:EmpComponentsComponent;
@ViewChild(EmployeeGradehistoryComponent) gradehistory:EmployeeGradehistoryComponent;
@ViewChild(EmployeeSalaryComponentComponent) salary:EmployeeSalaryComponentComponent;

  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.Component.PageLoad();
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
    debugger;
    switch (indx) {
      case 0:
        this.Component.PageLoad();
        break;
      case 1:
        this.gradehistory.PageLoad();
        break;
      case 2:
        this.salary.PageLoad();
        break;
      // case 3:
      //   this.teacherMapping.PageLoad();
      //   break;
      // case 4:
      //   this.subjectmarkComponent.PageLoad();
      //   break;
      // case 5:
      //   this.studentclass.PageLoad();
      //   break;
      // case 6:
      //   this.studentsubject.PageLoad();
      //   break;
      // case 7:
      //   this.Classperiod.PageLoad();
      //   break;

    }
  }
}


