import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import alasql from 'alasql';
import * as moment from 'moment';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-attendancepercent',
  templateUrl: './attendancepercent.component.html',
  styleUrls: ['./attendancepercent.component.scss']
})
export class AttendancepercentComponent implements OnInit {
  PageLoading = true;

  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  //EnableSave = true;
  Permission = 'deny';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  SaveAll = false;
  NoOfRecordToUpdate = -1;
  StudentDetailToDisplay = '';
  StudentClassId = 0;
  FilterOrgSubOrg='';
  FilterOrgSubOrgBatchId='';
  loading = false;
  Sections = [];
  Classes = [];
  Subjects = [];
  ClassSubjects = [];
  SelectedBatchId = 0;SubOrgId = 0;
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
    searchFromDate: [new Date()],
    searchToDate: [new Date()]
  });
  StudentClassSubjectId = 0;
  StudentAttendanceData = {
    AttendanceId: 0,
    StudentClassId: 0,
    AttendanceStatus: 0,
    AttendanceDate: new Date(),
    ClassSubjectId: 0,
    TeacherId: 0,
    Remarks: '',
    BatchId: 0,
    OrgId: 0,
    SubOrgId: 0
  };
  displayedColumns = [
    'ClassName',
    'StudentRollNo',
    'Percent',
    'PresentCount',
    'AbsentCount'
  ];
  SelectedApplicationId = 0;

  constructor(private servicework: SwUpdate,

    private fb: UntypedFormBuilder,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,

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
    this.StudentClassId = 0;
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.ATTENDANCE.STUDENTATTENDANCE)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = +this.tokenStorage.getSubOrgId();
        
        this.FilterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.GetMasterData();
        //var filterOrgSubOrg= globalconstants.getOrgSubOrgFilter(this.tokenStorage);
          this.contentservice.GetClasses(this.FilterOrgSubOrg).subscribe((data: any) => {
          this.Classes = [...data.value];
        })
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
  distinctStudent = [];
  GetStudentAttendance() {
    debugger;
    let filterStr = this.FilterOrgSubOrg;// 'OrgId eq ' + this.LoginUserDetail[0]["orgId"]+ " and SubOrgId eq " + this.SubOrgId;
    //' and StudentClassId eq ' + this.StudentClassId;
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId > 0) {
      filterStr += ' and ClassId eq ' + _classId;
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var filterStrClsSub = '';
    var _sectionId = this.searchForm.get("searchSectionId").value;
    var _classSubjectId = this.searchForm.get("searchClassSubjectId").value;
    // if (_sectionId == 0 && _classSubjectId == 0) {
    //   this.contentservice.openSnackBar("Please select either section or subject.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }

    this.loading = true;
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var _fromDate = new Date(this.searchForm.get("searchFromDate").value)
    var _toDate = new Date(this.searchForm.get("searchToDate").value)
    _fromDate.setHours(0, 0, 0, 0);
    _toDate.setHours(0, 0, 0, 0);
    if (_fromDate.getTime() > today.getTime()) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("From date cannot be greater than today's date.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_fromDate.getTime() > _toDate.getTime()) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("'From' date cannot be greater than 'To' date.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    // if (this.LoginUserDetail[0]['RoleUsers'][0]['role'].toLowerCase() != 'admin' && _fromDate.getTime() != today.getTime()) {
    //   this.EnableSave = false;
    // }
    // else
    //   this.EnableSave = true;

    if (_sectionId > 0) {
      filterStr += " and SectionId eq " + _sectionId;
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select section.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    filterStr += " and ClassSubjectId eq " + _classSubjectId;
    filterStr += ' and BatchId eq ' + this.SelectedBatchId;

    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var datefilterStr = ' and AttendanceDate ge ' + moment(_fromDate).format('yyyy-MM-DD')
    datefilterStr += ' and AttendanceDate le ' + moment(_toDate).format('yyyy-MM-DD')
    // datefilterStr += ' and StudentClassId gt 0'

    this.StudentAttendanceList = [];
    this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
    let list: List = new List();
    list.fields = [
      // 'StudentId',
      // 'StudentClassId',
      // 'RollNo',
      // 'ClassId',
      // 'SectionId',
      // 'Active'
      "AttendanceId,StudentClassId,ClassId,SectionId,AttendanceDate,AttendanceStatus,ClassSubjectId"
    ];

    list.PageName = "Attendances";
    //list.lookupFields = ["Attendances($filter=" + datefilterStr + ";$select=AttendanceId,StudentClassId,AttendanceDate,AttendanceStatus,ClassSubjectId)"];
    list.filter = [filterStr + datefilterStr];
    this.StudentClassList = [];
    this.dataservice.get(list)
      .subscribe((attendance: any) => {
        var _AllStudents: any = this.tokenStorage.getStudents();
        _AllStudents = _AllStudents.filter(all => all.StudentClasses
          && all.StudentClasses.length > 0
          && all.StudentClasses[0].Active == 1)
        //if (_classId == 0 && _sectionId == 0)
        //  _AllStudents = _AllStudents.filter(all => all.StudentClasses && all.StudentClasses.length > 0);
        //else 
        if (_classId > 0 && _sectionId == 0)
          _AllStudents = _AllStudents.filter(all =>
            all.StudentClasses[0].ClassId == _classId);
        else if (_classId > 0 && _sectionId > 0)
          _AllStudents = _AllStudents.filter(all => all.StudentClasses[0].ClassId == _classId
            && all.StudentClasses[0].SectionId == _sectionId);

        attendance.value.forEach(sc => {
          var _student = _AllStudents.filter(all => all.StudentClasses[0].StudentClassId == sc.StudentClassId);
          var _lastname = (_student[0].LastName === null) ? '' : _student[0].LastName;
          var _Classobj = this.Classes.filter(s => s.ClassId == sc.ClassId);
          var _Class = '';
          if (_Classobj.length > 0) {
            _Class = _Classobj[0].ClassName;
          }
          var _sectionobj = this.Sections.filter(s => s.MasterDataId == sc.SectionId);
          var _section = '';
          if (_sectionobj.length > 0) {
            _section = "-" + _sectionobj[0].MasterDataName;
          }

          //sc.Attendances.forEach(item => {
          var _subjName = '';
          if (sc.ClassSubjectId > 0) {
            var obj = this.ClassSubjects.filter(s => s.ClassSubjectId == sc.ClassSubjectId);
            if (obj.length > 0)
              _subjName = obj[0].ClassSubject;
          }
          this.StudentAttendanceList.push({
            RollNo: _student[0].StudentClasses[0].RollNo,
            AttendanceId: sc.AttendanceId,
            StudentClassId: sc.StudentClassId,
            AttendanceStatus: sc.AttendanceStatus,
            AttendanceDate: sc.AttendanceDate,
            ClassSubjectId: sc.ClassSubjectId,
            ClassSubject: _subjName,
            StudentRollNo: _student[0].FirstName + _lastname + "-" + _student[0].StudentClasses[0].RollNo,
            ClassName: _Class + _section

          });

          //})
        })

        var PresentAttendance = alasql('select sum(1) PresentAbsentCount,StudentRollNo,ClassName from ? where AttendanceStatus=1 group by StudentRollNo,ClassName', [this.StudentAttendanceList])
        var AbsentAttendance = alasql('select sum(1) PresentAbsentCount,StudentRollNo,ClassName from ? where AttendanceStatus=0 group by StudentRollNo,ClassName', [this.StudentAttendanceList])
        this.distinctStudent = alasql('select distinct StudentRollNo,RollNo,ClassName from ? ', [this.StudentAttendanceList])

        this.distinctStudent.forEach(p => {
          var absent = AbsentAttendance.filter(a => a.StudentRollNo == p.StudentRollNo)
          var present = PresentAttendance.filter(a => a.StudentRollNo == p.StudentRollNo)
          if (absent.length > 0)
            p.AbsentCount = absent[0].PresentAbsentCount;
          else
            p.AbsentCount = 0;
          if (present.length > 0)
            p.PresentCount = present[0].PresentAbsentCount;
          else
            p.PresentCount = 0;

          //p.PresentCount = p.PresentAbsentCount;
          p.Percent = ((p.PresentCount / (p.PresentCount + p.AbsentCount)) * 100).toFixed(2);
        })

        this.distinctStudent = this.distinctStudent.sort((a, b) => a.ClassName - b.ClassName);
        if (this.distinctStudent.length == 0)
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        this.dataSource = new MatTableDataSource<IStudentAttendance>(this.distinctStudent);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
    //this.changeDetectorRefs.detectChanges();
    // });
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSection: ''
    });
  }
  UpdateActive(element, event) {
    element.Action = true;
    //this.AnyEnableSave=true;
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

  SaveRow(row) {
    this.NoOfRecordToUpdate = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    //this.NoOfRecordToUpdate = 0;
    var _AttendanceDate = this.searchForm.get("searchAttendanceDate").value;

    var clssubjectid = this.searchForm.get("searchClassSubjectId").value
    if (clssubjectid == undefined)
      clssubjectid = 0;

    let checkFilterString = "AttendanceId eq " + row.AttendanceId +
      " and StudentClassId eq " + row.StudentClassId +
      " and AttendanceDate ge " + moment(_AttendanceDate).format('YYYY-MM-DD') +
      " and AttendanceDate lt " + moment(_AttendanceDate).add(1, 'day').format('YYYY-MM-DD')
    if (clssubjectid > 0)
      checkFilterString += " and ClassSubjectId eq " + clssubjectid

    if (row.AttendanceId > 0)
      checkFilterString += " and AttendanceId ne " + row.AttendanceId;

    let list: List = new List();
    list.fields = ["AttendanceId"];
    list.PageName = "Attendances";
    list.filter = [checkFilterString + " and " + this.FilterOrgSubOrg];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.StudentAttendanceData.StudentClassId = row.StudentClassId;
          this.StudentAttendanceData.AttendanceDate = new Date(_AttendanceDate);
          this.StudentAttendanceData.AttendanceId = row.AttendanceId;
          this.StudentAttendanceData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentAttendanceData.SubOrgId = this.SubOrgId;
          this.StudentAttendanceData.BatchId = this.SelectedBatchId;
          this.StudentAttendanceData.AttendanceStatus = row.AttendanceStatus;
          this.StudentAttendanceData.ClassSubjectId = clssubjectid;
          this.StudentAttendanceData.Remarks = row.Remarks;
          if (this.StudentAttendanceData.AttendanceId == 0) {
            this.StudentAttendanceData["CreatedDate"] = new Date();
            this.StudentAttendanceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.StudentAttendanceData["UpdatedDate"];
            delete this.StudentAttendanceData["UpdatedBy"];
            console.log("StudentAttendanceData", this.StudentAttendanceData);
            this.insert(row);
          }
          else {
            delete this.StudentAttendanceData["CreatedDate"];
            delete this.StudentAttendanceData["CreatedBy"];
            this.StudentAttendanceData["UpdatedDate"] = new Date();
            this.StudentAttendanceData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
          row.Action = false;
        }
      });
  }

  insert(row) {

    this.dataservice.postPatch('Attendances', this.StudentAttendanceData, 0, 'post')
      .subscribe(
        (data: any) => {
          //this.edited = false;
          row.AttendanceId = data.AttendanceId;
          row.Action = false;
          if (this.NoOfRecordToUpdate == 0) {
            this.NoOfRecordToUpdate = -1;
            this.loading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  update(row) {
    this.dataservice.postPatch('Attendances', this.StudentAttendanceData, this.StudentAttendanceData.AttendanceId, 'patch')
      .subscribe(
        (data: any) => {
          //this.edited = false;
          row.Action = false;
          if (this.NoOfRecordToUpdate == 0) {
            this.NoOfRecordToUpdate = -1;
            this.loading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
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
    //list.filter = ["Active eq 1 and BatchId eq " + this.SelectedBatchId + " and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    //list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.ClassSubjects = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        this.ClassSubjects = [];
        data.value.forEach(item => {
          var objsubject = this.Subjects.filter(f => f.MasterDataId == item.SubjectId)
          if (objsubject.length > 0) {
            this.ClassSubjects.push({
              ClassSubjectId: item.ClassSubjectId,
              ClassSubject: objsubject[0].MasterDataName,
              ClassId: item.ClassId
            })
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
    this.GetClassSubject();
    this.loading = false;
    this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
  }

}
export interface IStudentAttendance {
  RollNo: number;
  AttendanceId: number;
  StudentClassId: number;
  AttendanceStatus: number;
  ClassSubjectId: number;
  ClassSubject: string;
  AttendanceDate: Date;
  StudentRollNo: string;
  ClassName: string;
}



