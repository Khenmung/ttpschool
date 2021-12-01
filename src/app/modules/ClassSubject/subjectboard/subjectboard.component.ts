import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { ClassSubjectDetailComponent } from '../classsubjectdetail/classsubjectdetail.component';
import { StudentSubjectMarkCompComponent } from '../student-subject-mark-comp/student-subject-mark-comp.component';
import { AssignStudentclassdashboardComponent } from '../AssignStudentClass/Assignstudentclassdashboard.component';
import { studentsubjectdashboardComponent } from '../studentsubjectdashboard/studentsubjectdashboard.component';
import { SubjectTypesComponent } from '../subject-types/subject-types.component';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ContentService } from 'src/app/shared/content.service';
import { ClassdetailComponent } from '../../classes/classdetail/classdetail.component';
import { PromoteclassComponent } from '../promoteclass/promoteclass.component';

@Component({
  selector: 'app-subjectboard',
  templateUrl: './subjectboard.component.html',
  styleUrls: ['./subjectboard.component.scss']
})
export class SubjectBoardComponent implements AfterViewInit {

  components = [
    SubjectTypesComponent,
    ClassSubjectDetailComponent,
    StudentSubjectMarkCompComponent,
    studentsubjectdashboardComponent,
    AssignStudentclassdashboardComponent,
    PromoteclassComponent
  ];

  tabNames = [
    { "label": "Subject Type", "faIcon": '' },
    { "label": "Subject Detail", "faIcon": '' },
    { "label": "Subject Mark Component", "faIcon": '' },
    { "label": "Student Subject", "faIcon": '' },
    { "label": "example", "faIcon": '' },
    { "label": "example", "faIcon": '' }
  ];
  //tabNames = ["Subject Type","Subject Detail","Subject Mark Component", "Class Student", "Student Subject"];
  Permissions =
    {
      ParentPermission: '',
      SubjectTypePermission: '',
      SubjectDetailPermission: '',
      SubjectMarkComponentPermission: '',
      ClassStudentPermission: '',
      StudentSubjectPermission: '',
      PromoteStudent: ''
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngAfterViewInit(): void {

    debugger;
    var loginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(loginUserDetail);

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.SUBJECT)
    if(perObj.length>0)
    this.Permissions.ParentPermission = perObj[0].permission;
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.SUBJECTTYPE)
    var comindx = this.components.indexOf(SubjectTypesComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.CLASSSUBJECTDETAIL)
    comindx = this.components.indexOf(ClassSubjectDetailComponent);
    this.GetComponents(perObj, comindx)
   
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.SUBJECTMARKCOMPONENT)
    comindx = this.components.indexOf(StudentSubjectMarkCompComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.CLASSSTUDENT)
    comindx = this.components.indexOf(AssignStudentclassdashboardComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.STUDENTSUBJECT)
    comindx = this.components.indexOf(studentsubjectdashboardComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.SUBJECT.PROMOTESTUDENT)
    comindx = this.components.indexOf(PromoteclassComponent);
    this.GetComponents(perObj, comindx)


    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);

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
  GetComponents(perObj, comindx) {
    if (perObj.length > 0) {
      if (perObj[0].permission == 'deny') {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
      else {
        this.tabNames[comindx].faIcon = perObj[0].faIcon;
        this.tabNames[comindx].label = perObj[0].label;
      }
    }
    else {
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }
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
