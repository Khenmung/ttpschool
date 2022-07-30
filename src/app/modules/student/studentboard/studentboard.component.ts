import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AddstudentclassComponent } from '../addstudentclass/addstudentclass.component';
import { StudentattendancereportComponent } from '../studentattendancereport/studentattendancereport.component';
import { studentprimaryinfoComponent } from '../studentprimaryinfo/studentprimaryinfo.component';
import { StudentprogressreportComponent } from '../studentprogressreport/studentprogressreport.component';
import { Router } from '@angular/router';
import { SportsResultComponent } from '../../studentactivity/sportsresult/sportsresult.component';

@Component({
  selector: 'app-studentboard',
  templateUrl: './studentboard.component.html',
  styleUrls: ['./studentboard.component.scss']
})
export class StudentboardComponent implements AfterViewInit {
  components:any = [
    studentprimaryinfoComponent,
    AddstudentclassComponent,
    StudentattendancereportComponent,
    StudentprogressreportComponent
  ];

  tabNames = [
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
    { "label": "khat peuhpeuh", "faIcon": '' },
  ];
  //tabNames = ["Subject Type","Subject Detail","Subject Mark Component", "Class Student", "Student Subject"];
  Permissions =
    {
      ParentPermission: '',
      DataDownloadPermission: '',
      DataUploadPermission: ''
    };
  StudentId = 0;
  StudentName = '';
  LoginUserDetail = [];
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private nav: Router,
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private componentFactoryResolver: ComponentFactoryResolver) {
    this.StudentId = tokenStorage.getStudentId();
  }

  public ngAfterViewInit(): void {
    debugger
    this.shareddata.CurrentStudentName.subscribe(s => (this.StudentName = s));
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.STUDENT)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
    }

    this.GenerateComponent(globalconstants.Pages.edu.STUDENT.STUDENTDETAIL)
    this.GenerateComponent(globalconstants.Pages.edu.STUDENT.STUDENTCLASS)
    this.GenerateComponent(globalconstants.Pages.edu.STUDENT.ATTENDANCEREPORT)
    this.GenerateComponent(globalconstants.Pages.edu.STUDENT.PROGRESSREPORT)

    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
    if (this.Permissions.ParentPermission != 'deny') {
      setTimeout(() => {
        this.renderComponent(0);
      }, 1000);
      this.cdr.detectChanges();
    }
  }

  public tabChange(index: number) {
    setTimeout(() => {
      this.renderComponent(index);
    }, 1000);

  }
  selectedIndex = 0;


  private renderComponent(index: number): any {
    //
    this.viewContainer.createComponent(this.components[index]);
  }
  GenerateComponent(featureName) {

    var perObj = globalconstants.getPermission(this.tokenStorage, featureName)
    var comindx = 0;
    switch (featureName) {
      case globalconstants.Pages.edu.STUDENT.STUDENTDETAIL:
        comindx = this.components.indexOf(studentprimaryinfoComponent);
        break;
      case globalconstants.Pages.edu.STUDENT.STUDENTCLASS:
        comindx = this.components.indexOf(AddstudentclassComponent);
        break;
      case globalconstants.Pages.edu.STUDENT.ATTENDANCEREPORT:
        comindx = this.components.indexOf(StudentattendancereportComponent);
        break;
      case globalconstants.Pages.edu.STUDENT.PROGRESSREPORT:
        comindx = this.components.indexOf(StudentprogressreportComponent);
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
  fee() {
    this.nav.navigate(['/edu/feepayment'])
    //http://localhost:4200/#/edu/addstudent/1044
  }
  back() {
    this.nav.navigate(['/edu']);
  }
}
