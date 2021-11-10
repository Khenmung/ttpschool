import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { SubjectDetailComponent } from '../subjectdetail/subjectdetail.component';
import { StudentSubjectMarkCompComponent } from '../student-subject-mark-comp/student-subject-mark-comp.component';
import { AssignStudentclassdashboardComponent } from '../AssignStudentClass/Assignstudentclassdashboard.component';
import { studentsubjectdashboardComponent } from '../studentsubjectdashboard/studentsubjectdashboard.component';
import { SubjectTypesComponent } from '../subject-types/subject-types.component';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-subjectboard',
  templateUrl: './subjectboard.component.html',
  styleUrls: ['./subjectboard.component.scss']
})
export class SubjectBoardComponent implements AfterViewInit {

  components = [
    SubjectTypesComponent,
    SubjectDetailComponent,
    StudentSubjectMarkCompComponent,
    studentsubjectdashboardComponent,
    AssignStudentclassdashboardComponent
  ];

  tabNames = [
    { "label": "Subject Type", "faIcon": '' },
    { "label": "Subject Detail", "faIcon": '' },
    { "label": "Subject Mark Component", "faIcon": '' },    
    { "label": "Student Subject", "faIcon": '' },
    { "label": "Class Student", "faIcon": '' }
  ];
  //tabNames = ["Subject Type","Subject Detail","Subject Mark Component", "Class Student", "Student Subject"];
  Permissions =
    {
      ParentPermission: '',
      SubjectTypePermission: '',
      SubjectDetailPermission: '',
      SubjectMarkComponentPermission: '',
      ClassStudentPermission: '',
      StudentSubjectPermission: ''
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngAfterViewInit(): void {
    //this.Permissions.ParentPermission = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.sub)
    // perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.SUBJECT)
    // if (perObj.length > 0) {
    //   this.Permissions.ParentPermission = perObj[0].permission;
    //  // this.tabNames[1].faIcon = perObj[0].faIcon;
    // }

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.DETAIL)
    if (perObj.length > 0) {
      this.Permissions.SubjectTypePermission = perObj[0].permission;
      this.tabNames[0].faIcon = perObj[0].faIcon;
    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.SUBJECTDETAIL)
    if (perObj.length > 0) {
      this.Permissions.SubjectDetailPermission = perObj[0].permission;
      this.tabNames[1].faIcon = perObj[0].faIcon;
    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.PREREQUISITE)
    if (perObj.length > 0) {
      this.Permissions.SubjectMarkComponentPermission = perObj[0].permission;
      this.tabNames[2].faIcon = perObj[0].faIcon;
    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.FEETYPE)
    if (perObj.length > 0) {
      this.Permissions.ClassStudentPermission = perObj[0].permission;
      this.tabNames[3].faIcon = perObj[0].faIcon;
    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSMASTER)
    if (perObj.length > 0) {
      this.Permissions.StudentSubjectPermission = perObj[0].permission;
      this.tabNames[4].faIcon = perObj[0].faIcon;
    }

    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);

    // console.log("this.Permissions.ParentPermission", this.Permissions.ParentPermission);
    // console.log("this.Permissions.SubjectTypePermission", this.Permissions.SubjectTypePermission);
    // console.log("this.Permissions.SubjectDetailPermission", this.Permissions.SubjectDetailPermission);
    // console.log("this.Permissions.SubjectMarkComponentPermission", this.Permissions.SubjectMarkComponentPermission);
    // console.log("this.Permissions.ClassStudentPermission", this.Permissions.ClassStudentPermission);
    // console.log("this.Permissions.StudentSubjectPermission", this.Permissions.StudentSubjectPermission);
    if (this.Permissions.SubjectTypePermission == 'deny') {
      var comindx = this.components.indexOf(SubjectTypesComponent);
      this.components.splice(comindx, 1);
    }
    if (this.Permissions.SubjectDetailPermission == 'deny') {
      var comindx = this.components.indexOf(SubjectDetailComponent);
      this.components.splice(comindx, 1);
    }
    if (this.Permissions.SubjectMarkComponentPermission == 'deny') {
      var comindx = this.components.indexOf(StudentSubjectMarkCompComponent);
      this.components.splice(comindx, 1);
    }
    if (this.Permissions.ClassStudentPermission == 'deny') {
      var comindx = this.components.indexOf(AssignStudentclassdashboardComponent);
      this.components.splice(comindx, 1);
    }
    if (this.Permissions.StudentSubjectPermission == 'deny') {
      var comindx = this.components.indexOf(studentsubjectdashboardComponent);
      this.components.splice(comindx, 1);
    }


    if (this.Permissions.ParentPermission != 'deny') {
      this.renderComponent(0);
      this.cdr.detectChanges();
    }
  }

  public tabChange(index: number) {
    //    console.log("index", index)
    setTimeout(() => {
      this.renderComponent(index);
    }, 550);

  }
  selectedIndex = 0;


  private renderComponent(index: number): any {
    const factory = this.componentFactoryResolver.resolveComponentFactory<any>(this.components[index]);
    this.viewContainer.createComponent(factory);
    //ClassprerequisiteComponent this.componentFactoryResolver.resolveComponentFactory
  }
}

// OnInit {
//   @ViewChild(SubjectTypesComponent) subjecttypes: SubjectTypesComponent;
//   @ViewChild(StudentSubjectMarkCompComponent) subjectmarkComponent: StudentSubjectMarkCompComponent;
//   @ViewChild(SubjectDetailComponent) subjectdetail: SubjectDetailComponent;
//   @ViewChild(studentsubjectdashboardComponent) studentsubject: studentsubjectdashboardComponent;
//   @ViewChild(AssignStudentclassdashboardComponent) studentclass: AssignStudentclassdashboardComponent;
//   @ViewChild(ClassperiodComponent) Classperiod: ClassperiodComponent;
//   selectedIndex = 0;
//   constructor() { }

//   ngOnInit(): void {
//     setTimeout(() => {
//       this.navigateTab(0)  
//     }, 100);

//   }
//   tabChanged(tabChangeEvent: number) {
//     this.selectedIndex = tabChangeEvent;
//     this.navigateTab(this.selectedIndex);
//     //   console.log('tab selected: ' + tabChangeEvent);
//   }
//   public nextStep() {
//     this.selectedIndex += 1;
//     this.navigateTab(this.selectedIndex);
//   }

//   public previousStep() {
//     this.selectedIndex -= 1;
//     this.navigateTab(this.selectedIndex);
//   }
//   navigateTab(indx) {
//     //debugger;
//     switch (indx) {
//       case 0:
//         this.subjecttypes.PageLoad();
//         break;
//       case 1:
//         this.subjectdetail.PageLoad();
//         break;
//       case 2:
//         this.subjectmarkComponent.PageLoad();
//         break;
//       case 3:
//         this.studentclass.PageLoad();
//         break;
//       case 4:
//         this.studentsubject.PageLoad();
//         break;
//       case 5:
//         this.Classperiod.PageLoad();
//         break;
//       default:
//         this.subjecttypes.PageLoad();
//         break;
//     }
//   }
// }
