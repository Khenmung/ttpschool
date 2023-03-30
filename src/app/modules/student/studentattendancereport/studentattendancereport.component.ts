import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-studentattendancereport',
  templateUrl: './studentattendancereport.component.html',
  styleUrls: ['./studentattendancereport.component.scss']
})
export class StudentattendancereportComponent implements OnInit {
  PageLoading = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  AttendanceStatusSum = [];
  edited = false;
  EnableSave = true;
  Permission = 'deny';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SaveAll = false;
  NoOfRecordToUpdate = -1;
  StudentDetailToDisplay = '';
  StudentClassId = 0;
  FilterOrgSubOrg = '';
  FilterOrgSubOrgBatchId = '';
  loading = false;
  Sections = [];
  Classes = [];
  Subjects = [];
  ClassSubjects = [];
  SelectedBatchId = 0; SubOrgId = 0;
  Batches = [];
  AttendanceStatus = [];
  FilteredClassSubjects = [];
  StudentAttendanceList: IStudentAttendance[] = [];
  StudentClassList = [];
  dataSource: MatTableDataSource<IStudentAttendance>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchClassId: [0],
    searchSectionId: [0],
    searchClassSubjectId: [0],
    searchAttendanceDate: [new Date()]
  });
  StudentClassSubjectId = 0;
  StudentAttendanceData = {
    AttendanceId: 0,
    StudentClassId: 0,
    AttendanceStatus: 0,
    AttendanceDate: new Date(),
    ClassSubjectId: 0,
    Remarks: '',
    BatchId: 0,
    OrgId: 0
  };
  displayedColumns = [
    'AttendanceDate',
    'AttendanceStatus',
    'Remarks'
  ];
  TotoalPresent = 0;
  TotalAbsent = 0;
  SelectedApplicationId = 0;
  constructor(private servicework: SwUpdate,
    private fb: UntypedFormBuilder,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.STUDENTATTENDANCERECORD)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.StudentClassId = this.tokenStorage.getStudentClassId();
        if (this.StudentClassId == 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar("Student class not defined.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
          this.SubOrgId = this.tokenStorage.getSubOrgId();
          this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
          this.GetMasterData();
          var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(filterOrgSubOrg).subscribe((data: any) => {
            this.Classes = [...data.value];
          })
          this.GetClassSubject();
          this.GetStudentAttendance();
        }
      }
    }

  }
  PageLoad() {

  }
  bindClassSubject() {
    debugger;
    var classId = this.searchForm.get("searchClassId").value;
    this.FilteredClassSubjects = this.ClassSubjects.filter(f => f.ClassId == classId);

  }
  checkall(value) {
    this.StudentAttendanceList.forEach(record => {
      if (value.checked) {
        record.AttendanceStatus = 1;
      }
      else
        record.AttendanceStatus = 0;
    })
  }

  GetStudentAttendance() {
    debugger;

    let list: List = new List();
    list.fields = [
      "AttendanceId",
      "StudentClassId",
      "AttendanceDate",
      "AttendanceStatus",
      "ClassSubjectId",
      "Remarks",
      "OrgId",
      "BatchId"
    ];
    list.PageName = "Attendances";
    list.lookupFields = ["StudentClass($select=RollNo,SectionId;$expand=Student($select=FirstName,LastName))"];
    list.filter = [this.FilterOrgSubOrgBatchId + " and StudentClassId eq " + this.StudentClassId];

    this.dataservice.get(list)
      .subscribe((attendance: any) => {

        attendance.value.forEach(att => {
          var _lastname = att.StudentClass.Student.LastName == null || att.StudentClass.Student.LastName == '' ? '' : " " + att.StudentClass.Student.LastName;
          this.StudentAttendanceList.push({
            AttendanceId: att.AttendanceId,
            StudentClassId: att.StudentClassId,
            AttendanceStatus: att.AttendanceStatus,
            AttendanceDate: att.AttendanceDate,
            ClassSubjectId: att.ClassSubjectId,
            Remarks: att.Remarks,
            StudentRollNo: att.StudentClass.Student.FirstName + _lastname
          });
        });
        this.AttendanceStatusSum = alasql("select AttendanceStatus, count(AttendanceStatus) Total from ? group by AttendanceStatus",
          [this.StudentAttendanceList])
        console.log("this.StudentAttendanceList", this.StudentAttendanceList)
        //console.log("this.AttendanceStatusSum",this.AttendanceStatusSum)

        this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSection: ''
    });
  }
  UpdateActive(element, event) {
    element.Action = true;
    //debugger;
    element.AttendanceStatus = event.checked == true ? 1 : 0;
  }
  onChangeEvent(row, value) {
    //debugger;
    if (row.Remarks.length > 0)
      row.Action = true;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }

  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  GetClassSubject() {
    debugger;
    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
    ];

    list.PageName = "ClassSubjects";
    list.filter = [this.FilterOrgSubOrgBatchId + " and Active eq 1"];
    //list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.ClassSubjects = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        this.ClassSubjects = [];
        data.value.forEach(item => {
          var _classname = ''
          var objCls = this.Classes.filter(f => f.ClassId == item.ClassId)
          if (objCls.length > 0) {
            _classname = objCls[0].ClassName;

            var _subjectName = '';
            var objsubject = this.Subjects.filter(f => f.MasterDataId == item.SubjectId)
            if (objsubject.length > 0) {

              _subjectName = objsubject[0].MasterDataName;
              this.ClassSubjects.push({
                ClassSubjectId: item.ClassSubjectId,
                ClassSubject: _classname + "-" + _subjectName,
                ClassId: item.ClassId
              })

            }
          }
        })
      })
  }
  GetMasterData() {

    this.allMasterData = this.tokenStorage.getMasterData();
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.ATTENDANCESTATUS);
    this.shareddata.ChangeSubjects(this.Subjects);
    this.loading = false; this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
    // let Id = 0;
    // let Ids = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    // })
    // if (Ids.length > 0) {
    //   Id = Ids[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   })
    // }
    // else
    //   return [];

  }

}
export interface IStudentAttendance {
  AttendanceId: number;
  StudentClassId: number;
  AttendanceStatus: number;
  ClassSubjectId: number;
  AttendanceDate: Date;
  StudentRollNo: string;
  Remarks: string
}



