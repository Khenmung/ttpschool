import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ExamsComponent } from '../exams/exams.component';
import { ExamslotComponent } from '../examslot/examslot.component';
import { ExamstudentsubjectresultComponent } from '../examstudentsubjectresult/examstudentsubjectresult.component';
import { VerifyResultsComponent } from '../verifyresults/verifyresults.component';
import { SlotnclasssubjectComponent } from '../slotnclasssubject/slotnclasssubject.component';
import { StudentactivityComponent } from '../studentactivity/studentactivity.component';

@Component({
  selector: 'app-examdashboard',
  templateUrl: './examdashboard.component.html',
  styleUrls: ['./examdashboard.component.scss']
})

export class ExamdashboardComponent implements AfterViewInit {

  components = [
    ExamsComponent,
    ExamslotComponent,
    SlotnclasssubjectComponent,
    ExamstudentsubjectresultComponent,
    VerifyResultsComponent,
    StudentactivityComponent
  ];
 
  tabNames = [
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' }
  ];
  //tabNames = ["Subject Type","Subject Detail","Subject Mark Component", "Class Student", "Student Subject"];
  Permissions =
    {
      ParentPermission: '',
      DataDownloadPermission: '',
      DataUploadPermission: ''
    };
    LoginUserDetail =[];
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
    debugger
    this.LoginUserDetail =  this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAM)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;  
    }
    
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.EXAM)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.EXAMSLOT)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.EXAMSTUDENTSUBJECTRESULT)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.SLOTNCLASSSUBJECT)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.VERIFYRESULT)
    this.GenerateComponent(globalconstants.Pages.edu.EXAM.STUDENTACTIVITY)
    
    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
    if (this.Permissions.ParentPermission != 'deny') {
      this.renderComponent(0);
      this.cdr.detectChanges();
    }
  }

  public tabChange(index: number) {
    setTimeout(() => {
      this.renderComponent(index);
    }, 550);

  }
  selectedIndex = 0;


  private renderComponent(index: number): any {
    const factory = this.componentFactoryResolver.resolveComponentFactory<any>(this.components[index]);
    this.viewContainer.createComponent(factory);
  }
  GenerateComponent(featureName){
    
    var perObj = globalconstants.getPermission(this.tokenStorage, featureName)
    var comindx =0;
    switch(featureName)
    {
      case "exam":
        comindx =this.components.indexOf(ExamsComponent);
        break;
      case "exam slot":
        comindx =this.components.indexOf(ExamslotComponent);
        break;
      case "Exam Result Entry":
        comindx =this.components.indexOf(ExamstudentsubjectresultComponent);
        break;
      case "slot n class subject":
        comindx =this.components.indexOf(SlotnclasssubjectComponent);
        break;
        case "verify result":
        comindx =this.components.indexOf(VerifyResultsComponent);
        break;
      case "student activity":
        comindx =this.components.indexOf(StudentactivityComponent);
        break;
      default:
        comindx =this.components.indexOf(ExamsComponent);
        break;
    } 
    
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
//   tabNames = [
//     { 'label': 'Exam', 'faIcon': '' },
//     { 'label': 'Exam Slot', 'faIcon': '' },
//     { 'label': 'Exam Result Entry', 'faIcon': '' },
//     { 'label': 'Slot n Class Subject', 'faIcon': '' },
//     { 'label': 'Student Activity', 'faIcon': '' }
//   ];

//   Permissions =
//     {
//       ParentPermission: '',
//       ExamTimeTablePermission: '',
//       ExamResultPermission: '',
//       FeeCollectionPermission: '',
//       DatewisePermission: ''
//     };

//   @ViewChild('container', { read: ViewContainerRef, static: false })
//   public viewContainer: ViewContainerRef;

//   constructor(
//     private cdr: ChangeDetectorRef,
//     private tokenStorage: TokenStorageService,
//     private shareddata: SharedataService,
//     private componentFactoryResolver: ComponentFactoryResolver) {
//   }

//   public ngAfterViewInit(): void {
//     debugger;
//     var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAM)
//     if (perObj.length > 0) {
//       this.Permissions.ParentPermission = perObj[0].permission;

//     }

//     perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAM)
//     var comindx = this.components.indexOf(ExamsComponent);
//     if (perObj.length > 0) {
//       if (perObj[0].permission == 'deny') {
//         this.components.splice(comindx, 1);
//         this.tabNames.splice(comindx, 1);
//       }
//       else {
//         this.tabNames[comindx].faIcon = perObj[0].faIcon;
//         this.tabNames[comindx].label = perObj[0].label;
//       }
//     }
//     else {
//       this.components.splice(comindx, 1);
//       this.tabNames.splice(comindx, 1);
//     }

//     perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAMSLOT)
//     var comindx = this.components.indexOf(ExamslotComponent);
//     if (perObj.length > 0) {
//       if (perObj[0].permission == 'deny') {
//         this.components.splice(comindx, 1);
//         this.tabNames.splice(comindx, 1);
//       }
//       else {
//         this.tabNames[comindx].faIcon = perObj[0].faIcon;
//         this.tabNames[comindx].label = perObj[0].label;
//       }
//     }
//     else {
//       this.components.splice(comindx, 1);
//       this.tabNames.splice(comindx, 1);
//     }

//     perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.SLOTNCLASSSUBJECT)
//     var comindx = this.components.indexOf(SlotnclasssubjectComponent);
//     if (perObj.length > 0) {
//       if (perObj[0].permission == 'deny') {
//         this.components.splice(comindx, 1);
//         this.tabNames.splice(comindx, 1);
//       }
//       else {
//         this.tabNames[comindx].faIcon = perObj[0].faIcon;
//         this.tabNames[comindx].label = perObj[0].label;
//       }
//     }
//     else {
//       this.components.splice(comindx, 1);
//       this.tabNames.splice(comindx, 1);
//     }
//     perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.EXAMSTUDENTSUBJECTRESULT)
//     var comindx = this.components.indexOf(ExamstudentsubjectresultComponent);
//     if (perObj.length > 0) {
//       if (perObj[0].permission == 'deny') {
//         this.components.splice(comindx, 1);
//         this.tabNames.splice(comindx, 1);
//       }
//       else {
//         this.tabNames[comindx].faIcon = perObj[0].faIcon;
//         this.tabNames[comindx].label = perObj[0].label;
//       }
//     }
//     else {
//       this.components.splice(comindx, 1);
//       this.tabNames.splice(comindx, 1);
//     }

//     perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EXAM.STUDENTACTIVITY)
//     var comindx = this.components.indexOf(StudentactivityComponent);
//     if (perObj.length > 0) {
//       if (perObj[0].permission == 'deny') {
//         this.components.splice(comindx, 1);
//         this.tabNames.splice(comindx, 1);
//       }
//       else {
//         this.tabNames[comindx].faIcon = perObj[0].faIcon;
//         this.tabNames[comindx].label = perObj[0].label;
//       }
//     }
//     else {
//       this.components.splice(comindx, 1);
//       this.tabNames.splice(comindx, 1);
//     }
//     this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);

//     if (this.Permissions.ParentPermission != 'deny') {
//       this.renderComponent(0);
//       this.cdr.detectChanges();
//     }
//   }

//   public tabChange(index: number) {
//     //    console.log("index", index)
//     setTimeout(() => {
//       this.renderComponent(index);
//     }, 550);

//   }
//   selectedIndex = 0;


//   private renderComponent(index: number): any {
//     const factory = this.componentFactoryResolver.resolveComponentFactory<any>(this.components[index]);
//     this.viewContainer.createComponent(factory);
//     //ClassprerequisiteComponent this.componentFactoryResolver.resolveComponentFactory
//   }
// }
