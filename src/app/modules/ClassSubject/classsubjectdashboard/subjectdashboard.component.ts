import { Component, OnInit, ViewChild } from '@angular/core';
import { ClasssubjectdashboardComponent } from '../classsubjectmapping/classsubjectdashboard.component';
import { StudentSubjectMarkCompComponent } from '../student-subject-mark-comp/student-subject-mark-comp.component';
import { AssignStudentclassdashboardComponent } from '../AssignStudentClass/Assignstudentclassdashboard.component';
import { studentsubjectdashboardComponent } from '../studentsubjectdashboard/studentsubjectdashboard.component';
import { SubjectTypesComponent } from '../subject-types/subject-types.component';
import { ClassmasterdashboardComponent } from '../classsmastermapping/classmasterdashboard.component';
//import { ClasssubjectteacherComponent } from '../classsubjectteacher/classsubjectteacher.component';
import { DashboardclassfeeComponent } from '../classfee/dashboardclassfee/dashboardclassfee.component';
import { ClassperiodComponent } from '../../schooltimetable/classperiod/classperiod.component';

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
  @ViewChild(ClassmasterdashboardComponent) teacherMapping: ClassmasterdashboardComponent;
  @ViewChild(DashboardclassfeeComponent) dashboardclassfee: DashboardclassfeeComponent;
  @ViewChild(ClassperiodComponent) Classperiod: ClassperiodComponent;
  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.dashboardclassfee.PageLoad();
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
        this.dashboardclassfee.PageLoad();
        break;
      case 1:
        this.subjecttypes.PageLoad();
        break;
      case 2:
        this.classsubject.PageLoad();
        break;
      case 3:
        this.teacherMapping.PageLoad();
        break;
      case 4:
        this.subjectmarkComponent.PageLoad();
        break;
      case 5:
        this.studentclass.PageLoad();
        break;
      case 6:
        this.studentsubject.PageLoad();
        break;
      case 7:
        this.Classperiod.PageLoad();
        break;

    }
  }
}
