import { Component, OnInit, ViewChild } from '@angular/core';
import { LeaveBalanceComponent } from '../LeaveBalance/leavebalance.component';
import { EmployeeLeaveComponent } from '../employee-leave/employee-leave.component';
import { LeavepolicyComponent } from '../leavepolicy/leavepolicy.component';

@Component({
  selector: 'app-leaveboard',
  templateUrl: './leaveboard.component.html',
  styleUrls: ['./leaveboard.component.scss']
})
export class LeaveboardComponent implements OnInit {
  @ViewChild(LeaveBalanceComponent) leavebalance:LeaveBalanceComponent;
  @ViewChild(EmployeeLeaveComponent) empleave:EmployeeLeaveComponent;
  @ViewChild(LeavepolicyComponent) leavepolicy:LeavepolicyComponent;
  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.leavepolicy.PageLoad();
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
        this.leavepolicy.PageLoad();
        break;
      case 1:
        this.leavebalance.PageLoad();
        break;
      case 2:
        this.empleave.PageLoad();
        break;
      case 3:
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

