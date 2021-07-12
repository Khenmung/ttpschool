import { Component, OnInit, ViewChild } from '@angular/core';
import { ClasssubjectdashboardComponent } from '../classsubjectmapping/classsubjectdashboard/classsubjectdashboard.component';
import { StudentSubjectMarkCompComponent } from '../student-subject-mark-comp/student-subject-mark-comp.component';
import { AssignStudentclassdashboardComponent } from '../AssignStudentClass/studentclassdashboard/Assignstudentclassdashboard.component';
import { studentsubjectdashboardComponent } from '../studentsubjectdashboard/studentsubjectdashboard.component';
import { SubjectTypesComponent } from '../subject-types/subject-types.component';

@Component({
  selector: 'app-subjectdashboard',
  templateUrl: './subjectdashboard.component.html',
  styleUrls: ['./subjectdashboard.component.scss']
})
export class SubjectdashboardComponent implements OnInit {
  @ViewChild(SubjectTypesComponent) subjecttypes: SubjectTypesComponent;
  @ViewChild(StudentSubjectMarkCompComponent) subjectmarkComponent: StudentSubjectMarkCompComponent;
  @ViewChild(ClasssubjectdashboardComponent) classsubject: ClasssubjectdashboardComponent;
  @ViewChild(studentsubjectdashboardComponent) studentsubject: studentsubjectdashboardComponent;
  @ViewChild(AssignStudentclassdashboardComponent) studentclass: AssignStudentclassdashboardComponent;


  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.subjecttypes.PageLoad();
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
        this.subjecttypes.PageLoad();
        break;
      case 1:
        this.classsubject.PageLoad();
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
    }
  }
}
