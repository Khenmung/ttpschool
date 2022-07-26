import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { StudentAttendanceComponent } from '../studentattendance/studentattendance.component';
import { StudenttotalattendanceComponent } from '../studenttotalattendance/studenttotalattendance.component';
import { TeacherAttendanceComponent } from '../teacherattendance/teacherattendance.component';

@Component({
  selector: 'app-attendanceboard',
  templateUrl: './attendanceboard.component.html',
  styleUrls: ['./attendanceboard.component.scss']
})
export class AttendanceboardComponent implements AfterViewInit {

  components: any = [
    StudentAttendanceComponent,
    TeacherAttendanceComponent,
    StudenttotalattendanceComponent
  ];
  SelectedAppName = '';
  tabNames = [
    { label: 'Student Attendance', faIcon: '' },
    { label: 'Employee Attendance', faIcon: '' },
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
  ) {
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
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.STUDENTTOTALATTENDANCE)
    var comindx = this.components.indexOf(StudenttotalattendanceComponent);
    this.AddRemoveComponent(perObj, comindx);

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

  AddRemoveComponent(perObj, pcomindx) {

    if (this.SelectedAppName.toLowerCase() == 'education management') {
      var comindx = this.components.indexOf(TeacherAttendanceComponent);
      if (comindx > -1) {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
    }

    if (perObj.length > 0) {
      if (perObj[0].permission == 'deny') {
        this.components.splice(pcomindx, 1);
        this.tabNames.splice(pcomindx, 1);
      }
      else {
        this.tabNames[pcomindx].faIcon = perObj[0].faIcon;
        this.tabNames[pcomindx].label = perObj[0].label;
      }
    }
    else {
      this.components.splice(pcomindx, 1);
      this.tabNames.splice(pcomindx, 1);
    }

  }

  private renderComponent(index: number): any {

    this.viewContainer.createComponent(this.components[index]);
  }
}
