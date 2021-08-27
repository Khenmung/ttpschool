import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leaveboard',
  templateUrl: './leaveboard.component.html',
  styleUrls: ['./leaveboard.component.scss']
})
export class LeaveboardComponent implements OnInit {
  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      //this.dashboardclassfee.PageLoad();
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
      // case 0:
      //   this.dashboardclassfee.PageLoad();
      //   break;
      // case 1:
      //   this.subjecttypes.PageLoad();
      //   break;
      // case 2:
      //   this.classsubject.PageLoad();
      //   break;
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

