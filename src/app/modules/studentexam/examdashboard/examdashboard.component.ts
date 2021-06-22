import { Component, OnInit, ViewChild } from '@angular/core';
import { ExamsComponent } from '../exams/exams.component';
import { ExamslotComponent } from '../examslot/examslot.component';
import { ExamstudentsubjectresultComponent } from '../examstudentsubjectresult/examstudentsubjectresult.component';
import { SlotnclasssubjectComponent } from '../slotnclasssubject/slotnclasssubject.component';

@Component({
  selector: 'app-examdashboard',
  templateUrl: './examdashboard.component.html',
  styleUrls: ['./examdashboard.component.scss']
})
export class ExamdashboardComponent implements OnInit {
@ViewChild(ExamsComponent) Exams:ExamsComponent;
@ViewChild(ExamslotComponent) ExamSlots:ExamslotComponent;
@ViewChild(SlotnclasssubjectComponent) subjectInSlots:SlotnclasssubjectComponent;
@ViewChild(ExamstudentsubjectresultComponent) subjectresult:ExamstudentsubjectresultComponent;


  selectedIndex=0;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.Exams.PageLoad();  
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
        this.Exams.PageLoad();
        break;
      case 1:
        this.ExamSlots.PageLoad();
        break;
      case 2:
        this.subjectInSlots.PageLoad();
        break;
      case 3:
        this.subjectresult.PageLoad();
        break;
    }
  }
}
