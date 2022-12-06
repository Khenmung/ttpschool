import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import * as moment from 'moment';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-attendancecount',
  templateUrl: './attendancecount.component.html',
  styleUrls: ['./attendancecount.component.scss']
})
export class AttendanceCountComponent implements OnInit {
  PageLoading = true;

  //@Input() StudentClassId:number;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  edited = false;
  //AnyEnableSave =false;
  EnableSave = true;
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
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchFromDate: [new Date()],
    searchToDate: [new Date()],
    searchSubjectWise: [false]
  });
  StudentClassSubjectId = 0;
  displayedColumns = [
    'ClassName',
    'Present',
    'Absent'
  ];
  SelectedApplicationId = 0;
  TotalPresent = 0;
  TotalAbsent = 0;
  constructor(private servicework: SwUpdate,
    private fb: UntypedFormBuilder,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe
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
  // checkall(value) {
  //   this.StudentAttendanceList.forEach(record => {
  //     if (value.checked) {
  //       record.AttendanceStatus = 1;
  //     }
  //     else
  //       record.AttendanceStatus = 0;
  //     record.Action = true;
  //   })
  //   //this.AnyEnableSave=true;
  // }

  GetStudentAttendance() {
    debugger;
    //this.StudentAttendanceList=[];
    //this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);

    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    //' and StudentClassId eq ' + this.StudentClassId;
    // if (this.searchForm.get("searchClassId").value == 0) {
    //   this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    // else {
    //   filterStr += ' and ClassId eq ' + this.searchForm.get("searchClassId").value;
    // }
    var filterStrClsSub = '';
    // var _sectionId = this.searchForm.get("searchSectionId").value;
    // var _classSubjectId = this.searchForm.get("searchClassSubjectId").value;
    // if (_sectionId == 0 && _classSubjectId == 0) {
    //   this.contentservice.openSnackBar("Please select either section or subject.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }

    this.loading = true;
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var _fromDate = new Date(this.searchForm.get("searchFromDate").value)
    var _toDate = new Date(this.searchForm.get("searchToDate").value)
    var _subjectwise = this.searchForm.get("searchSubjectWise").value;
    _fromDate.setHours(0, 0, 0, 0);
    _toDate.setHours(0, 0, 0, 0);



    this.StudentAttendanceList = [];

    var datefilterStr = ' and AttendanceDate ge ' + moment(_fromDate).format('yyyy-MM-DD')
    datefilterStr += ' and AttendanceDate le ' + moment(_toDate).format('yyyy-MM-DD')
    datefilterStr += ' and StudentClassId gt 0'

    datefilterStr += ' and BatchId eq ' + this.SelectedBatchId;
    if (_subjectwise) {
      datefilterStr += ' and ClassSubjectId gt 0';
    }
    else
      datefilterStr += ' and ClassSubjectId eq 0';


    let list: List = new List();
    list.fields = [
      "AttendanceId",
      "StudentClassId",
      "ClassId",
      "SectionId",
      "AttendanceDate",
      "AttendanceStatus",
      "ClassSubjectId",
      "Remarks",
      "OrgId",
      "BatchId"
    ];
    list.PageName = "Attendances";
    //list.lookupFields = ["StudentClass($select=ClassId,StudentClassId,SectionId)"];
    list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      datefilterStr + filterStrClsSub]; //+ //"'" + //"T00:00:00.000Z'" +

    this.dataservice.get(list)
      .subscribe((attendance: any) => {
        attendance.value.forEach(sc => {
          var _className = '', _sectionName = '';
          var clsObj = this.Classes.filter(c => c.ClassId == sc.ClassId);
          if (clsObj.length > 0) {
            _className = clsObj[0].ClassName;
            var sectionObj = this.Sections.filter(c => c.MasterDataId == sc.SectionId);
            if (sectionObj.length > 0) {
              _sectionName = sectionObj[0].MasterDataName;
              this.StudentAttendanceList.push({
                AttendanceId: sc.AttendanceId,
                AttendanceStatus: sc.AttendanceStatus,
                AttendanceDate: sc.AttendanceDate,
                ClassName: _className + "-" + _sectionName,
                Sequence: clsObj[0].Sequence
              });
            }
          }
        })
        var _data = [];
        var sumOfAttendance = alasql("select sum(1) PresentAbsent,ClassName,AttendanceStatus,Sequence from ? group by ClassName,AttendanceStatus,Sequence",
          [this.StudentAttendanceList]);
        //console.log("sumOfAttendance", sumOfAttendance)
        sumOfAttendance.forEach(att => {
          var existing = _data.filter(f => f.ClassName == att.ClassName);
          if (existing.length > 0) {
            if (att.AttendanceStatus == 1)
              existing[0]["Present"] = att.PresentAbsent
            else if (att.AttendanceStatus == 0)
              existing[0]["Absent"] = att.PresentAbsent
          }
          else {
            if (att.AttendanceStatus == 1)
              _data.push({ ClassName: att.ClassName, Present: att.PresentAbsent, Sequence: att.Sequence })
            else
              _data.push({ ClassName: att.ClassName, Absent: att.PresentAbsent, Sequence: att.Sequence })

          }

        })
        //console.log("_data",_data);
        _data = _data.sort((a, b) => a.Sequence - b.Sequence || a.ClassName - b.ClassName);
        this.TotalPresent = _data.reduce((acc, current) => acc + (current.Present == null ? 0 : current.Present), 0);
        this.TotalAbsent = _data.reduce((acc, current) => acc + (current.Absent == null ? 0 : current.Absent), 0);
        this.dataSource = new MatTableDataSource<any>(_data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
    //this.changeDetectorRefs.detectChanges();
  }
  clear() {
    this.searchForm.patchValue({
      //searchClassId: 0,
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
  // saveall() {
  //   var toUpdateAttendance = this.StudentAttendanceList.filter(f => f.Action);
  //   this.NoOfRecordToUpdate = toUpdateAttendance.length;
  //   this.loading=true;
  //   toUpdateAttendance.forEach((record) => {
  //     this.NoOfRecordToUpdate--;
  //     this.UpdateOrSave(record);
  //   })
  //   if(toUpdateAttendance.length==0)
  //   {
  //     this.loading=false;
  //   }
  // }


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

    this.allMasterData = this.tokenstorage.getMasterData();
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.ATTENDANCESTATUS);
    this.shareddata.ChangeSubjects(this.Subjects);
    this.GetClassSubject();
    this.loading = false; this.PageLoading = false;

  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenstorage, this.allMasterData);
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
  AttendanceStatus: number;
  AttendanceDate: Date;
  ClassName: string;
  Sequence: number;
}


