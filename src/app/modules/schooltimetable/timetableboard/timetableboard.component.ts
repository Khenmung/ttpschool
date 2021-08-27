import { Component, OnInit, ViewChild } from '@angular/core';
import { ClassperiodComponent } from '../classperiod/classperiod.component';
import { SchooltimetableComponent } from '../schooltimetable/schooltimetable.component';

@Component({
  selector: 'app-timetableboard',
  templateUrl: './timetableboard.component.html',
  styleUrls: ['./timetableboard.component.scss']
})
export class TimetableboardComponent implements OnInit {
@ViewChild(ClassperiodComponent) classperiod:ClassperiodComponent;
@ViewChild(SchooltimetableComponent) timetable:SchooltimetableComponent;

  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.classperiod.PageLoad();
    }, 20);

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
    switch (indx) {
      case 0:
        this.classperiod.PageLoad();
        break;
      case 1:
        this.timetable.PageLoad();
        break;
      // case 2:
      //   this.subjectInSlots.PageLoad();
      //   break;
      // case 3:
      //   this.subjectresult.PageLoad();
      //   break;
      // case 4:
      //   this.activity.PageLoad();
      //   break;
      // default:
      //   this.Exams.PageLoad();
      //   break;
    }
  }
}

