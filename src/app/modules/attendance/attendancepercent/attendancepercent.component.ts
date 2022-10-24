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
  StandardFilter = '';
  loading = false;
  Sections = [];
  Classes = [];
  Subjects = [];
  ClassSubjects = [];
  SelectedBatchId = 0;
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
    OrgId: 0
  };
  displayedColumns = [
    'StudentRollNo',
    'ClassName',
    'Percent'
  ];
  SelectedApplicationId = 0;

  constructor(private servicework: SwUpdate,

    private fb: UntypedFormBuilder,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,

  ) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.StudentClassId = 0;
    this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.ATTENDANCE.STUDENTATTENDANCE)
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetMasterData();
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
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

  GetStudentAttendance() {
    debugger;
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    //' and StudentClassId eq ' + this.StudentClassId;
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId > 0) {
      filterStr += ' and ClassId eq ' + _classId;
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
    if (_classSubjectId > 0) {
      filterStrClsSub = " and ClassSubjectId eq " + _classSubjectId;
    }

    filterStr += ' and BatchId eq ' + this.SelectedBatchId;
    //filterStr += ' and AttendanceStatus eq 0';


    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.StudentAttendanceList = [];
    this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'RollNo',
      'ClassId',
      'SectionId',
      'Active'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student($select=FirstName,LastName,ContactNo)"];
    list.filter = [filterStr];
    this.StudentClassList = [];
    this.dataservice.get(list)
      .subscribe((studentclass: any) => {

        if (studentclass.value.length == 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar("No student exist in this class/section!", globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }

        this.StudentClassList = studentclass.value.map(item => {
          var _lastname = item.Student.LastName == null ? '' : " " + item.Student.LastName;
          var _Classobj = this.Classes.filter(s => s.ClassId == item.ClassId);
          var _Class = '';
          if (_Classobj.length > 0) {
            _Class = _Classobj[0].ClassName;
          }
          var _sectionobj = this.Sections.filter(s => s.MasterDataId == item.SectionId);
          var _section = '';
          if (_sectionobj.length > 0) {
            _section = "-" + _sectionobj[0].MasterDataName;
          }
          return {
            StudentClassId: item.StudentClassId,
            Active: item.Active,
            ClassId: item.ClassId,
            ClassName: _Class,
            RollNo: item.RollNo,
            Student: item.Student.FirstName + _lastname,
            StudentRollNo: item.Student.FirstName + _lastname + "-" + item.RollNo + _section,

          }
        })
        //var date = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        var datefilterStr = ' and AttendanceDate ge ' + moment(_fromDate).format('yyyy-MM-DD')
        datefilterStr += ' and AttendanceDate le ' + moment(_toDate).format('yyyy-MM-DD')
        datefilterStr += ' and StudentClassId gt 0'


        let list: List = new List();
        list.fields = [
          "AttendanceId",
          "StudentClassId",
          "AttendanceDate",
          "AttendanceStatus",
          "ClassSubjectId",
          "OrgId",
          "BatchId"
        ];
        list.PageName = "Attendances";
        //list.lookupFields = ["StudentClass"];
        list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] +
          datefilterStr + filterStrClsSub]; //+ //"'" + //"T00:00:00.000Z'" +

        this.dataservice.get(list)
          .subscribe((attendance: any) => {

            this.StudentClassList.forEach(sc => {
              let existing = attendance.value.filter(db => db.StudentClassId == sc.StudentClassId);

              existing.forEach(item => {
                var _subjName = '';
                if (item.ClassSubjectId > 0) {
                  var obj = this.ClassSubjects.filter(s => s.ClassSubjectId == item.ClassSubjectId);
                  if (obj.length > 0)
                    _subjName = obj[0].ClassSubject;
                }

                this.StudentAttendanceList.push({
                  RollNo: sc.RollNo,
                  AttendanceId: item.AttendanceId,
                  StudentClassId: item.StudentClassId,
                  AttendanceStatus: item.AttendanceStatus,
                  AttendanceDate: item.AttendanceDate,
                  ClassSubjectId: item.ClassSubjectId,
                  ClassSubject: _subjName,
                  StudentRollNo: sc.StudentRollNo,
                  ClassName: sc.ClassName,

                });
              })

            })

            var PresentAttendance = alasql('select sum(1) PresentAbsentCount,StudentRollNo,ClassName from ? where AttendanceStatus=1 group by StudentRollNo,ClassName', [this.StudentAttendanceList])
            var AbsentAttendance = alasql('select sum(1) PresentAbsentCount,StudentRollNo,ClassName from ? where AttendanceStatus=0 group by StudentRollNo,ClassName', [this.StudentAttendanceList])
            var distinctStudent = alasql('select distinct StudentRollNo,RollNo,ClassName from ? ', [this.StudentAttendanceList])

            distinctStudent.forEach(p => {
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

            distinctStudent = distinctStudent.sort((a, b) => a.RollNo - b.RollNo);
            this.dataSource = new MatTableDataSource<IStudentAttendance>(distinctStudent);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.loading = false; this.PageLoading = false;
          });
        //this.changeDetectorRefs.detectChanges();
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
    list.filter = [checkFilterString + " and " + this.StandardFilter];

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
    //list.filter = ["Active eq 1 and BatchId eq " + this.SelectedBatchId + " and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.ClassSubjects = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        this.ClassSubjects = data.value.map(item => {
          // var _classname = ''
          // var objCls = this.Classes.filter(f => f.ClassId == item.ClassId)
          // if (objCls.length > 0)
          //   _classname = objCls[0].ClassName;

          var _subjectName = '';
          var objsubject = this.Subjects.filter(f => f.MasterDataId == item.SubjectId)
          if (objsubject.length > 0)
            _subjectName = objsubject[0].MasterDataName;

          return {
            ClassSubjectId: item.ClassSubjectId,
            ClassSubject: _subjectName,
            ClassId: item.ClassId
          }
        })
      })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.ATTENDANCESTATUS);
        this.shareddata.ChangeSubjects(this.Subjects);
        this.GetClassSubject();
        this.loading = false;
        this.PageLoading = false;

      });
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenstorage, this.allMasterData);
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


