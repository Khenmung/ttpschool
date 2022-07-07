import { debugOutputAstAsTypeScript } from '@angular/compiler';
import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { StudentAttendanceComponent } from '../studentattendance/studentattendance.component';
import { TeacherAttendanceComponent } from '../teacherattendance/teacherattendance.component';

@Component({
  selector: 'app-attendanceboard',
  templateUrl: './attendanceboard.component.html',
  styleUrls: ['./attendanceboard.component.scss']
})
export class AttendanceboardComponent implements AfterViewInit {

  components:any = [
    StudentAttendanceComponent,
    TeacherAttendanceComponent
  ];
  SelectedAppName = '';
  tabNames = [
    { label: 'Student Attendance', faIcon: '' },
    { label: 'Employee Attendance', faIcon: '' },
  ];

  Permissions =
    {
      ParentPermission: '',
      StudentAttendancePermission: '',
      TeacherAttendancePermission: ''
    };
  selectedIndex = 0;

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;
  LoginUserDetail = [];
  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private contentservice: ContentService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngAfterViewInit(): void {
    debugger;
    this.SelectedAppName = this.tokenStorage.getSelectedAppName();
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.ATTENDANCE)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;

    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.STUDENTATTENDANCE)
    var comindx = this.components.indexOf(StudentAttendanceComponent);
    if (this.SelectedAppName.toLowerCase() == 'employee management') {
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }
    else if (perObj.length > 0 && perObj[0].permission != 'deny') {
      this.tabNames[comindx].faIcon = perObj[0].faIcon;
      this.tabNames[comindx].label = perObj[0].label;
    }
    else {
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.TEACHERATTENDANCE)
    var comindx = this.components.indexOf(TeacherAttendanceComponent);
    if (this.SelectedAppName.toLowerCase() == 'education management') {
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }
    else if (perObj.length > 0 && perObj[0].permission != 'deny') {
      this.tabNames[comindx].faIcon = perObj[0].faIcon;
      this.tabNames[comindx].label = perObj[0].label;
    }
    else {
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }

    if (this.Permissions.ParentPermission != 'deny') {
      setTimeout(() => {
        this.renderComponent(0);
      }, 550);
      this.cdr.detectChanges();
    }

  }

  public tabChange(index: number) {
    setTimeout(() => {
      this.renderComponent(index);
    }, 550);

  }



  private renderComponent(index: number): any {
    
    this.viewContainer.createComponent(this.components[index]);
  }
}
