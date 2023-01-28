import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-employeeattendancereport',
  templateUrl: './employeeattendancereport.component.html',
  styleUrls: ['./employeeattendancereport.component.scss']
})
export class EmployeeAttendanceReportComponent implements OnInit {
  PageLoading = true;
  //@Input() StudentClassId:number;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("table") mattable;
  StudentDetail: any = {};
  rowCount = 0;
  edited = false;
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  SelectedStudentSubjectCount = [];
  StudentDetailToDisplay = '';
  SelectedApplicationId = 0;
  StudentClassId = 0;
  StandardFilter = '';
  loading = false;
  ClassSubjectList = [];
  Sections = [];
  Classes = [];
  Subjects = [];
  SelectedBatchId = 0;
  Batches = [];
  StudentClassSubjects = [];

  //StudentSubjectList: IStudentSubject[] = [];
  dataSource: MatTableDataSource<IEmployeeAttendance>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchMonth: [0],
  });
  StudentSubjectData = {
    StudentClassSubjectId: 0,
    SubjectId: 0,
    StudentClassId: 0,
    ClassId: 0,
    SectionId: 0,
    ClassSubjectId: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 1
  };
  nameFilter = new UntypedFormControl('');
  filterValues = {
    Student: ''
  };
  filteredOptions: Observable<IEmployeeAttendance[]>;
  Permission = '';
  displayedColumns = [
    "Employee"
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
    private tokenstorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }
  Months = [];
  Employees = [];
  ngOnInit(): void {

    this.nameFilter.valueChanges
      .subscribe(
        name => {
          this.filterValues.Student = name;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.PageLoad();
  }
  PageLoad() {
    //debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.Months = this.contentservice.GetSessionFormattedMonths();
    this.StudentClassId = 1;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.SUBJECT.STUDENTSUBJECT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.GetEmployees();
        this.GetHoliday();
      }
      else {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
    }
  }
  HolidayList=[];
  GetHoliday() {
    debugger;

    this.loading = true;
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + " and BatchId eq " + this.SelectedBatchId;

    let list: List = new List();
    list.fields = ["HolidayId,StartDate,EndDate"];

    list.PageName = "Holidays";
    list.filter = [filterStr];
    this.HolidayList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.HolidayList = [...data.value];
        }
        this.loading = false;
      });

  }
  EmployeeAttendanceList = [];
  GetEmployeeAttendance() {
    //debugger;
    var SelectedMonth = this.searchForm.get("searchMonth").value;
    if (SelectedMonth == 0) {
      this.contentservice.openSnackBar("Please select month", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let filterStr = 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;

    //var filterStrClsSub = '';

    //this.loading = true;
    // var today = new Date();
    // today.setHours(0, 0, 0, 0);

    // var _AttendanceDate = new Date(this.searchForm.get("searchAttendanceDate").value)
    // _AttendanceDate.setHours(0, 0, 0, 0);
    // if (_AttendanceDate.getTime() > today.getTime()) {
    //   this.loading = false; this.PageLoading = false;
    //   this.contentservice.openSnackBar("Attendance date cannot be greater than today's date.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    // if (this.LoginUserDetail[0]['RoleUsers'][0]['role'].toLowerCase() != 'admin' && _AttendanceDate.getTime() != today.getTime()) {
    //   this.EnableSave = false;
    // }
    // else
    //   this.EnableSave = true;

    //filterStr += ' and BatchId eq ' + this.SelectedBatchId;


    if (filterStr.length == 0) {
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.EmployeeAttendanceList = [];
    this.dataSource = new MatTableDataSource<IEmployeeAttendance>(this.EmployeeAttendanceList);
    SelectedMonth = SelectedMonth + "";
    var fromDate = new Date(SelectedMonth.substr(0, 4), SelectedMonth.substr(4, 5), 1);
    var toDate = new Date(SelectedMonth.substr(0, 4), SelectedMonth.substr(4, 5), 0);

    var datefilterStr = filterStr + ' and AttendanceDate ge ' + moment(fromDate).format('yyyy-MM-DD')
    datefilterStr += ' and AttendanceDate le ' + moment(fromDate).endOf('month').format('yyyy-MM-DD')

    let list: List = new List();
    list.fields = [
      "EmployeeId",
      "AttendanceDate",
      "AttendanceStatus",
    ];
    list.PageName = "EmployeeAttendances";
    //list.lookupFields = ["StudentClass"];
    list.filter = [datefilterStr]; //+ //"'" + //"T00:00:00.000Z'" +

    this.dataservice.get(list)
      .subscribe((employeeAttendance: any) => {
        var weekdaysCount = 0, Holidays = 0;
        var tempdate;
        var lastDateOfMonth = new Date(moment(fromDate).endOf('month').format('YYYY-MM-DD')).getDate();
        for (let day = 1; day <= lastDateOfMonth; day++) {
          tempdate = new Date(SelectedMonth.substr(0, 4), SelectedMonth.substr(4, 2), day);
          var inHoliday = this.HolidayList.filter(h => new Date(h.StartDate).getTime() >= tempdate.getTime() && new Date(h.EndDate).getTime() <= tempdate.getTime())
          if (inHoliday.length > 0)
            Holidays += 1;
          if (tempdate.getDay() == 6 || tempdate.getDay() == 0) {
            weekdaysCount += 1;
          }
        }
        let absent = 0;
        //var lastDateOfMonth = new Date(moment(fromDate).endOf('month').format('YYYY-MM-DD')).getDate();
        this.Employees.forEach(emp => {
          absent = 0;
          var empName = emp.FirstName + (emp.LastName ? " " + emp.LastName : "");
          emp.Employee = empName;

          let existing = employeeAttendance.value.filter(db => db.EmployeeId == emp.EmpEmployeeId);
          if (existing.length > 0) {
            //the whole month for an employee.
            for (let day = 1; day <= lastDateOfMonth; day++) {
              if (this.displayedColumns.indexOf(day + "") == -1)
                this.displayedColumns.push(day + "");
              var dayattendance = existing.filter(e => new Date(e.AttendanceDate).getDate() == day);
              if (dayattendance.length > 0) {
                emp[day] = dayattendance[0].AttendanceStatus;
                if (dayattendance[0].AttendanceStatus == 0)
                  absent += 1;
              }
              else {
                emp[day] = 0;
                absent += 1;
              }
            }
          }
          else {
            for (let day = 1; day <= lastDateOfMonth; day++) {
              if (this.displayedColumns.indexOf(day + "") == -1)
                this.displayedColumns.push(day + "");

              emp[day] = 0;
              absent += 1;
            }
          }
          if (this.displayedColumns.indexOf("Pre") == -1)
            this.displayedColumns.push("Pre");
          if (this.displayedColumns.indexOf("Ab") == -1)
            this.displayedColumns.push("Ab");
          emp["Pre"] = toDate.getDate() - absent;
          emp["Ab"] = absent-(weekdaysCount + Holidays);
        })
        //console.log("employee",this.Employees)
        //this.EmployeeAttendanceList = this.EmployeeAttendanceList.sort((a, b) => a.RollNo - b.RollNo)
        this.dataSource = new MatTableDataSource<IEmployeeAttendance>(this.Employees);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });
    //this.changeDetectorRefs.detectChanges();
    //});

  }
  GetEmployees() {
    var filterStr = "OrgId eq " + this.LoginUserDetail[0]['orgId'] + " and Active eq 1";
    let list: List = new List();
    list.fields = [
      'EmpEmployeeId',
      'FirstName',
      'LastName',
      'ShortName'
    ];

    list.PageName = "EmpEmployees";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((employee: any) => {
        this.Employees = [...employee.value];
        this.loading = false;
        this.PageLoading = false;
      })
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.Student.toLowerCase().indexOf(searchTerms.Student) !== -1
      // && data.id.toString().toLowerCase().indexOf(searchTerms.id) !== -1
      // && data.colour.toLowerCase().indexOf(searchTerms.colour) !== -1
      // && data.pet.toLowerCase().indexOf(searchTerms.pet) !== -1;
    }
    return filterFunction;
  }
  formatData(clssubject) {
    var _subjectName = '';
    var topush = {};
    //var subjectTypes = [];

    topush = this.StudentDetail;

    _subjectName = this.Subjects.filter(s => s.MasterDataId == clssubject.SubjectId)[0].MasterDataName;
    if (this.displayedColumns.indexOf(_subjectName) == -1)
      this.displayedColumns.push(_subjectName);

    topush = {
      "StudentClassSubjectId": clssubject.StudentClassSubjectId,
      "StudentClassId": this.StudentDetail["StudentClassId"],
      "Student": this.StudentDetail["Student"],
      "RollNo": this.StudentDetail["RollNo"],
      "SubjectTypeId": clssubject.SubjectTypeId,
      "SubjectType": clssubject.SubjectType,
      "SelectHowMany": clssubject.SelectHowMany,
      "SubjectId": clssubject.SubjectId,
      "Subject": _subjectName,
      "ClassSubjectId": clssubject.ClassSubjectId,
      "ClassId": clssubject.ClassId,
      "ClassName": this.Classes.filter(c => c.ClassId == clssubject.ClassId)[0].ClassName,
      "Action": false,
      "Active": clssubject.Active,
    }
    this.StudentDetail[_subjectName] = clssubject.Active;
    topush[_subjectName] = clssubject.Active;
  }

  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSubjectId: 0,
      searchSubjectTypeId: 0,
      //searchBatchId: this.SelectedBatchId
    });
  }
  // SelectColumn(element,colName) {
  //   this.SelectAllInRow(element, col);
  // }
  // SelectAllRowInColumn(event, colName) {
  //   debugger;
  //   this.StudentSubjectList.forEach(element => {
  //     var currentrow = this.StoreForUpdate.filter(f => f.Subject == colName && f.StudentClassId == element.StudentClassId);
  //     if (event.checked) {
  //       currentrow[colName] = 1;
  //       element[colName] = 1;
  //     }
  //     else {
  //       currentrow[colName] = 0;
  //       element[colName] = 0;
  //       currentrow[0].SubjectCount = 0;
  //     }
  //     element.Action = true;
  //   });
  // }
  // SelectAllInRow(element, event, colName) {
  //   debugger;
  //   var columnexist = [];
  //   if (colName == 'Action') {
  //     for (var prop in element) {
  //       columnexist = this.displayedColumns.filter(f => f == prop)
  //       if (columnexist.length > 0 && event.checked && prop != 'Student' && prop != 'Action') {
  //         element[prop] = 1;
  //       }
  //       else if (columnexist.length > 0 && !event.checked && prop != 'Student' && prop != 'Action') {
  //         element[prop] = 0;
  //       }
  //       element.Action = true;
  //     }
  //   }
  //   else {
  //     var currentrow = this.StoreForUpdate.filter(f => f.Subject == colName && f.StudentClassId == element.StudentClassId);
  //     if (event.checked) {
  //       currentrow[colName] = 1;
  //       element[colName] = 1;
  //     }
  //     else {
  //       currentrow[colName] = 0;
  //       element[colName] = 0;
  //       currentrow[0].SubjectCount = 0;
  //     }
  //     element.Action = true;
  //   }
  // }
  // SaveRow(element) {
  //   //debugger;
  //   this.loading = true;
  //   this.rowCount = 0;
  //   this.SelectedStudentSubjectCount = [];
  //   ////////
  //   //console.log("this.StudentSubjectList", this.StudentSubjectList);
  //   let StudentSubjects = this.StoreForUpdate.filter(s => s.StudentClassId == element.StudentClassId);
  //   var groupbySubjectType = alasql("select distinct SubjectTypeId,SubjectType,SelectHowMany from ? ", [StudentSubjects])
  //   var matchrow;
  //   for (var prop in element) {
  //     matchrow = StudentSubjects.filter(x => x.Subject == prop)
  //     if (matchrow.length > 0) {
  //       var resultarray = groupbySubjectType.filter(f => f.SubjectTypeId == matchrow[0].SubjectTypeId);
  //       if (element[prop] == 1) {
  //         //assuming greater than 20 means compulsory subject types
  //         // if (resultarray[0].SelectHowMany > 30)
  //         //   matchrow[0].SubjectCount = resultarray[0].SelectHowMany;
  //         // //resultarray[0].SubjectCount = resultarray[0].SelectHowMany;
  //         // else
  //         resultarray[0].SubjectCount = resultarray[0].SubjectCount == undefined ? 1 : resultarray[0].SubjectCount + 1;
  //       }
  //       else {
  //         resultarray[0].SubjectCount = resultarray[0].SubjectCount == undefined ? 0 : resultarray[0].SubjectCount;
  //       }
  //     }
  //   }
  //   var _compulsory = groupbySubjectType.filter(f => f.SubjectType.toLowerCase() == 'compulsory')
  //   var _otherThanCompulsory = groupbySubjectType.filter(f => f.SubjectType.toLowerCase() != 'compulsory')
  //   var subjectCounterr = '';
  //   _otherThanCompulsory.forEach(noncompulsory => {
  //     //element.SelectHowMany =0 meeans optional
  //     if (noncompulsory.SubjectCount != noncompulsory.SelectHowMany) {
  //       subjectCounterr += " Subject type " + noncompulsory.SubjectType + " must have " + noncompulsory.SelectHowMany + " subject(s) selected.";
  //     }
  //   });
  //   var compulsorysubjectCount = StudentSubjects.filter(c => c.SubjectType.toLowerCase() == 'compulsory')

  //   if (compulsorysubjectCount.length > _compulsory[0].SubjectCount) {
  //     subjectCounterr += " Subject type " + _compulsory[0].SubjectType + " must have " + _compulsory[0].SelectHowMany + " subject(s) selected";
  //   }
  //   // _compulsory.forEach(s => {
  //   //   if (s.SelectHowMany > 30 && s.SubjectCount != s.SelectHowMany) {
  //   //     debugger;
  //   //     subjectCounterr += " Subject type " + s.SubjectType + " must have " + s.SelectHowMany + " subject(s) selected.";
  //   //   }
  //   // })
  //   /////////
  //   if (subjectCounterr.length > 0) {
  //     this.loading = false; this.PageLoading = false;
  //     this.contentservice.openSnackBar(subjectCounterr, globalconstants.ActionText, globalconstants.RedBackground);
  //     return;
  //   }
  //   else {
  //     for (var prop in element) {
  //       var row: any = StudentSubjects.filter(s => s.Subject == prop);

  //       if (row.length > 0 && prop != 'Student' && prop != 'Action') {
  //         var data = {
  //           Active: element[prop],
  //           StudentClassSubjectId: row[0].StudentClassSubjectId,
  //           StudentClassId: row[0].StudentClassId,
  //           ClassSubjectId: row[0].ClassSubjectId,
  //           SubjectId: row[0].SubjectId
  //         }
  //         ////console.log('data to update',data)
  //         if (row.length > 0)
  //           this.UpdateOrSave(data, element);
  //       }
  //     }
  //   }
  // }
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
  UpdateOrSave(row, element) {
    //debugger;
    let checkFilterString = "ClassSubjectId eq " + row.ClassSubjectId +
      " and StudentClassId eq " + row.StudentClassId +
      " and BatchId eq " + this.SelectedBatchId


    if (row.StudentClassSubjectId > 0)
      checkFilterString += " and StudentClassSubjectId ne " + row.StudentClassSubjectId;
    checkFilterString += " and " + this.StandardFilter
    let list: List = new List();
    list.fields = ["ClassSubjectId"];
    list.PageName = "StudentClassSubjects";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          console.log("row.ClassSubjectId", row.ClassSubjectId)
          this.contentservice.openSnackBar("Record already exists!", globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }
        else {

          this.StudentSubjectData.Active = row.Active;
          this.StudentSubjectData.StudentClassSubjectId = row.StudentClassSubjectId;
          this.StudentSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentSubjectData.BatchId = this.SelectedBatchId;
          this.StudentSubjectData.StudentClassId = row.StudentClassId;
          this.StudentSubjectData.SubjectId = row.SubjectId;
          this.StudentSubjectData.ClassSubjectId = row.ClassSubjectId;
          this.StudentSubjectData.ClassId = row.ClassId;
          this.StudentSubjectData.SectionId = row.SectionId;
          ////console.log('data', this.StudentSubjectData);
          if (this.StudentSubjectData.StudentClassSubjectId == 0) {
            this.StudentSubjectData["CreatedDate"] = new Date();
            this.StudentSubjectData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.StudentSubjectData["UpdatedDate"];
            delete this.StudentSubjectData["UpdatedBy"];
            ////console.log('insert', this.StudentSubjectData);
            this.insert(row, element);
          }
          else {
            delete this.StudentSubjectData["CreatedDate"];
            delete this.StudentSubjectData["CreatedBy"];
            this.StudentSubjectData["UpdatedDate"] = new Date();
            this.StudentSubjectData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row, element);
          }
          row.Action = false;

        }
      });
  }

  insert(row, element) {

    //debugger;
    this.dataservice.postPatch('StudentClassSubjects', this.StudentSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.edited = false;
          this.rowCount += 1;
          row.StudentClassSubjectId = data.StudentClassSubjectId;

          if (this.rowCount == Object.keys(row).length - 3) {
            this.loading = false; this.PageLoading = false;
            element.Action = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  update(row, element) {

    this.dataservice.postPatch('StudentClassSubjects', this.StudentSubjectData, this.StudentSubjectData.StudentClassSubjectId, 'patch')
      .subscribe(
        (data: any) => {
          this.edited = false;

          this.rowCount += 1;
          if (this.rowCount == Object.keys(row).length - 3) {
            element.Action = false;
            this.loading = false; this.PageLoading = false;
            //this.GetStudentClassSubject();
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }


  GetMasterData() {
    debugger;
    this.allMasterData = this.tokenstorage.getMasterData();
    this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.shareddata.ChangeSubjects(this.Subjects);
    this.loading = false; this.PageLoading = false;
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownDataNoConfidentail(dropdowntype, this.tokenstorage, this.allMasterData);
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
export interface IEmployeeAttendance {
  EmployeeAttendanceId: number;
  EmployeeId: number;
  Employee: string;
  AttendanceStatus: number;
  AttendanceDate: Date;
  Remarks: string;
  ReportedTo: number;
  Approved: boolean;
  ApprovedBy: string;
  Action: boolean
}

