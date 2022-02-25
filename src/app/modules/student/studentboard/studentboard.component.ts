import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AddstudentclassComponent } from '../addstudentclass/addstudentclass.component';
import { GenerateCertificateComponent } from '../generatecertificate/generatecertificate.component';
import { StudentattendancereportComponent } from '../studentattendancereport/studentattendancereport.component';
import { StudentDocumentComponent } from '../uploadstudentdocument/uploadstudentdoc.component';
import { studentprimaryinfoComponent } from '../studentprimaryinfo/studentprimaryinfo.component';
import { StudentprogressreportComponent } from '../studentprogressreport/studentprogressreport.component';
import { StudentactivityComponent } from '../studentactivity/studentactivity.component';

@Component({
  selector: 'app-studentboard',
  templateUrl: './studentboard.component.html',
  styleUrls: ['./studentboard.component.scss']
})
export class StudentboardComponent implements AfterViewInit {
     components = [
      studentprimaryinfoComponent,
      AddstudentclassComponent,
      StudentDocumentComponent,
      GenerateCertificateComponent,
      StudentattendancereportComponent,
      StudentprogressreportComponent,
      StudentactivityComponent
    ];
  
    tabNames = [
      { "label": "khat peuhpeuh", "faIcon": '' },
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
      StudentName='';
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
      this.shareddata.CurrentStudentName.subscribe(s => (this.StudentName = s));
      this.LoginUserDetail =  this.tokenStorage.getUserDetail();
      this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.STUDENT)
      if (perObj.length > 0) {
        this.Permissions.ParentPermission = perObj[0].permission;  
      }
      
      this.GenerateComponent(globalconstants.Pages.edu.STUDENT.STUDENTDETAIL)
      this.GenerateComponent(globalconstants.Pages.edu.STUDENT.STUDENTCLASS)
      this.GenerateComponent(globalconstants.Pages.edu.STUDENT.GENERATECERTIFICATE)
      this.GenerateComponent(globalconstants.Pages.edu.STUDENT.DOCUMENT)
      this.GenerateComponent(globalconstants.Pages.edu.STUDENT.ATTENDANCEREPORT)
      this.GenerateComponent(globalconstants.Pages.edu.STUDENT.PROGRESSREPORT)
      this.GenerateComponent(globalconstants.Pages.edu.STUDENT.STUDENTAPROFILE)

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
        case "student detail":
          comindx =this.components.indexOf(studentprimaryinfoComponent);
          break;
        case "student class":
          comindx =this.components.indexOf(AddstudentclassComponent);
          break;
        case "generate certificate":
          comindx =this.components.indexOf(GenerateCertificateComponent);
          break;
        case "documents":
          comindx =this.components.indexOf(StudentDocumentComponent);
          break;
        case "student attendance":
          comindx =this.components.indexOf(StudentattendancereportComponent);
          break;
        case "progress report":
          comindx =this.components.indexOf(StudentprogressreportComponent);
          break;
          case "student profile":
          comindx =this.components.indexOf(StudentactivityComponent);
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
  