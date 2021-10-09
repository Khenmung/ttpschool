import { Component, OnInit, ViewChild } from '@angular/core';
import { SubjectDetailComponent } from '../subjectdetail/subjectdetail.component';
import { StudentSubjectMarkCompComponent } from '../student-subject-mark-comp/student-subject-mark-comp.component';
import { AssignStudentclassdashboardComponent } from '../AssignStudentClass/Assignstudentclassdashboard.component';
import { studentsubjectdashboardComponent } from '../studentsubjectdashboard/studentsubjectdashboard.component';
import { SubjectTypesComponent } from '../subject-types/subject-types.component';
import { ClassperiodComponent } from '../../schooltimetable/classperiod/classperiod.component';

@Component({
  selector: 'app-subjectboard',
  templateUrl: './subjectboard.component.html',
  styleUrls: ['./subjectboard.component.scss']
})
export class SubjectBoardComponent implements OnInit {
  @ViewChild(SubjectTypesComponent) subjecttypes: SubjectTypesComponent;
  @ViewChild(StudentSubjectMarkCompComponent) subjectmarkComponent: StudentSubjectMarkCompComponent;
  @ViewChild(SubjectDetailComponent) subjectdetail: SubjectDetailComponent;
  @ViewChild(studentsubjectdashboardComponent) studentsubject: studentsubjectdashboardComponent;
  @ViewChild(AssignStudentclassdashboardComponent) studentclass: AssignStudentclassdashboardComponent;
  @ViewChild(ClassperiodComponent) Classperiod: ClassperiodComponent;
  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.navigateTab(0)  
    }, 100);
    
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
        this.subjecttypes.PageLoad();
        break;
      case 1:
        this.subjectdetail.PageLoad();
        break;
      case 2:
        this.subjectmarkComponent.PageLoad();
        break;
      case 3:
        this.studentclass.PageLoad();
        break;
      case 4:
        this.studentsubject.PageLoad();
        break;
      case 5:
        this.Classperiod.PageLoad();
        break;
      default:
        this.subjecttypes.PageLoad();
        break;
    }
  }
}
