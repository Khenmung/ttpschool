import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-teacherperiod',
  templateUrl: './teacherperiod.component.html',
  styleUrls: ['./teacherperiod.component.scss']
})
export class TeacherperiodComponent implements OnInit {
  PageLoading = false;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  TeacherPeriodListName = "TeacherPeriods";
  Permission = '';
  SelectedApplicationId = 0;
  StandardFilterWithBatchId = '';
  StandardFilterWithPreviousBatchId = '';
  PreviousBatchId = 0;
  loading = false;
  WorkAccounts = [];
  Teachers = [];
  Classes = [];
  Subjects = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  CheckBatchIDForEdit = 1;
  DataCountToSave = -1;
  Batches = [];
  ClassSubjects = [];
  TeacherPeriodList: ITeacherPeriod[] = [];
  dataSource: MatTableDataSource<ITeacherPeriod>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchClassId: [0],
    searchEmployeeId: [0]
  });

  TeacherPeriodId = 0;
  TeacherPeriodData = {
    TeacherPeriodId: 0,
    EmployeeId: 0,
    SchoolClassPeriodId: 0,
    TeacherSubjectId: 0,
    OffPeriod: false,
    OrgId: 0,
    Active: 1
  };
  displayedColumns = [
    'TeacherPeriodId',
    'EmployeeId',
    'SchoolClassPeriodId',
    'TeacherSubjectId',
    'OffPeriod',
    'Active',
    'Action'
  ];
  filteredOptions: any;
  Students: any;
  nameFilter = new FormControl('');
  filterValues = {
    SubjectName: ''
  };
  constructor(
    private contentservice: ContentService,
    private fb: FormBuilder,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

  ngOnInit(): void {
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      this.nameFilter.valueChanges
        .subscribe(
          name => {
            this.filterValues.SubjectName = name;
            this.dataSource.filter = JSON.stringify(this.filterValues);
          }
        )
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.SUBJECT.CLASSSUBJECTDETAIL);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission == 'deny') {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.StandardFilterWithPreviousBatchId = globalconstants.getStandardFilterWithPreviousBatchId(this.tokenstorage);
        this.shareddata.CurrentSubjects.subscribe(r => this.Subjects = r);
        this.GetMasterData();
        if (this.Classes.length == 0) {
          this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
            this.Classes = [...data.value];
          });
        }
      }
    }
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.SubjectName.toLowerCase().indexOf(searchTerms.SubjectName) !== -1
      // && data.id.toString().toLowerCase().indexOf(searchTerms.id) !== -1
      // && data.colour.toLowerCase().indexOf(searchTerms.colour) !== -1
      // && data.pet.toLowerCase().indexOf(searchTerms.pet) !== -1;
    }
    return filterFunction;
  }
  GetSessionFormattedMonths() {
    var _sessionStartEnd = {
      StartDate: new Date(),
      EndDate: new Date()
    };
    var Months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    var monthArray = [];
    //setTimeout(() => {

    this.shareddata.CurrentSelectedBatchStartEnd$.subscribe((b: any) => {

      if (b.length != 0) {
        _sessionStartEnd = { ...b };
        ////console.log('b',b)
        var _Year = new Date(_sessionStartEnd.StartDate).getFullYear();
        var startMonth = new Date(_sessionStartEnd.StartDate).getMonth();

        for (var month = 0; month < 12; month++, startMonth++) {
          monthArray.push({
            MonthName: Months[startMonth] + " " + _Year,
            val: _Year + startMonth.toString().padStart(2, "0")
          })
          if (startMonth == 11) {
            startMonth = -1;
            _Year++;
          }
        }
      }
    });
    return monthArray;
  }
  GetTeacherPeriodId(event) {
    this.TeacherPeriodId = event;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
    this.TeacherPeriodList = [];
    this.dataSource = new MatTableDataSource<any>(this.TeacherPeriodList);
    this.GetTeacherPeriod();
  }

  View(element) {
    // //debugger;
    // this.TeacherPeriodId = element.TeacherPeriodId;
    // this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    // setTimeout(() => {
    //   this.TeacherPeriodAdd.PageLoad();
    // }, 50);
  }

  addnew() {
    let toadd = {
      TeacherPeriodId: 0,
      EmployeeId: 0,
      SchoolClassPeriodId: 0,
      TeacherSubjectId: 0,
      OffPeriod: false,
      Active: false,
      Action: false
    };
    this.TeacherPeriodList.push(toadd);
    this.dataSource = new MatTableDataSource<ITeacherPeriod>(this.TeacherPeriodList);

  }
  // CopyFromPreviousBatch() {
  //   //console.log("here ", this.PreviousBatchId)
  //   this.PreviousBatchId = +this.tokenstorage.getPreviousBatchId();
  //   if (this.PreviousBatchId == -1)
  //     this.contentservice.openSnackBar("Previous batch not defined.",globalconstants.ActionText,globalconstants.RedBackground);
  //   else
  //     this.GetTeacherPeriod(1)
  // }
  GetTeacherPeriod() {
    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //debugger;
    this.loading = true;

    var _classId = this.searchForm.get("searchClassId").value;
    var _employeeId = this.searchForm.get("searchEmployeeId").value;
    if (_classId == 0 && _employeeId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class/course or teacher", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    if (_employeeId > 0) {
      filterStr += ' and EmployeeId eq ' + _employeeId
    }


    if (filterStr.length == 0) {
      this.loading = false;
      this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let list: List = new List();
    list.fields = [
      'TeacherPeriodId',
      'SchoolClassPeriodId',
      'TeacherSubjectId',
      'EmployeeId',
      'OffPeriod',
      'Active'
    ];

    list.PageName = this.TeacherPeriodListName;
    //list.lookupFields = ["ClassSubject($select=ClassSubjectId,ClassId,SubjectId)"];
    list.filter = [filterStr];
    this.TeacherPeriodList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (_classId > 0)
          this.ClassSubjects = this.ClassSubjects.filter(f => f.ClassId == _classId);
        debugger;
        data.value.forEach(TeacherPeriod => {
          var objClsSubject = this.ClassSubjects.filter(clssubject => clssubject.ClassSubjectId == TeacherPeriod.ClassSubjectId)
          if (objClsSubject.length > 0) {
            TeacherPeriod["ClsName"] = objClsSubject[0]["ClsName"];
            this.TeacherPeriodList.push(TeacherPeriod);
          }

        })
        if (this.TeacherPeriodList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        //this.TeacherPeriodList.sort((a, b) => b.Active - a.Active);
        //console.log("TeacherPeriodList", this.TeacherPeriodList);
        //console.log("TeacherPeriodList", this.TeacherPeriodList);
        this.dataSource = new MatTableDataSource<ITeacherPeriod>(this.TeacherPeriodList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = this.createFilter();
        this.loading = false; this.PageLoading = false;
      });
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      //searchSubjectId: 0,

      //searchBatchId: this.SelectedBatchId
    });
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;

  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('TeacherPeriods', toupdate, element.TeacherPeriodId, 'delete')
      .subscribe(
        (data: any) => {
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  
  SaveAll() {
    this.DataCountToSave = this.TeacherPeriodList.length;
    var toUpdate = this.TeacherPeriodList.filter(f => f.Action);
    toUpdate.forEach(row => {
      this.DataCountToSave--;
      this.UpdateOrSave(row);
    })
  }

  UpdateOrSave(row) {
    this.DataCountToSave = 0;
    //debugger;
    this.loading = true;
    ////console.log("row.TeacherId", row.TeacherId);
    if (row.EmployeeId == 0) {
      this.contentservice.openSnackBar("Please select teacher.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      return;
    }
    if (row.TeacherSubjectId == 0) {
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      return;
    }
    let checkFilterString = "TeacherSubjectId eq " + row.TeacherSubjectId +
      " and EmployeeId eq " + row.EmployeeId;


    if (row.TeacherPeriodId > 0)
      checkFilterString += " and TeacherPeriodId ne " + row.TeacherPeriodId;

    checkFilterString += ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = ["TeacherPeriodId"];
    list.PageName = this.TeacherPeriodListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
          row.Ative = 0;
          return;
        }
        else {

          this.TeacherPeriodData.Active = row.Active;
          this.TeacherPeriodData.TeacherPeriodId = row.TeacherPeriodId;
          this.TeacherPeriodData.SchoolClassPeriodId = row.SchoolClassPeriodId;
          this.TeacherPeriodData.EmployeeId = row.EmployeeId;
          this.TeacherPeriodData.OffPeriod = row.OffPeriod;
          this.TeacherPeriodData.OrgId = this.LoginUserDetail[0]["orgId"];
          if (this.TeacherPeriodData.TeacherPeriodId == 0) {
            this.TeacherPeriodData["CreatedDate"] = new Date();
            this.TeacherPeriodData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.TeacherPeriodData["UpdatedDate"];
            delete this.TeacherPeriodData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.TeacherPeriodData["CreatedDate"];
            delete this.TeacherPeriodData["CreatedBy"];
            this.TeacherPeriodData["UpdatedDate"] = new Date();
            this.TeacherPeriodData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });

  }

  insert(row) {

    //console.log('this.TeacherPeriodData', this.TeacherPeriodData)
    //debugger;
    this.dataservice.postPatch('TeacherPeriods', this.TeacherPeriodData, 0, 'post')
      .subscribe(
        (data: any) => {

          row.Action = false;
          row.TeacherPeriodId = data.TeacherPeriodId;
          if (this.DataCountToSave == 0) {
            this.loading = false; this.PageLoading = false;
            this.DataCountToSave = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  update(row) {

    this.dataservice.postPatch('TeacherPeriods', this.TeacherPeriodData, this.TeacherPeriodData.TeacherPeriodId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          if (this.DataCountToSave == 0) {
            this.loading = false; this.PageLoading = false;
            this.DataCountToSave = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
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
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.ClassSubjects = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.ClassSubjects = [];
        data.value.forEach(item => {
          var _subjectName = '';
          var _className = this.Classes.filter(f => f.ClassId == item.ClassId)[0].ClassName;
          var objsubject = this.Subjects.filter(f => f.MasterDataId == item.SubjectId)
          if (objsubject.length > 0) {
            _subjectName = objsubject[0].MasterDataName;

            this.ClassSubjects.push({
              ClassSubjectId: item.ClassSubjectId,
              ClassSubject: _className + "-" + _subjectName,
              ClassId: item.ClassId,
              ClsName: _className
            });
          }
        })
        console.log("this.ClassSubjects", this.ClassSubjects)
      })
  }
  TempClassSubject = [];
  GetSelectedClassSubjects() {
    debugger;
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId > 0)
      this.TempClassSubject = this.ClassSubjects.filter(f => f.ClassId == _classId);
    else
      this.TempClassSubject = [...this.ClassSubjects];

  }
  SchoolClassPeriod=[];
  GetSchoolClassPeriod(){
    
    var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    
    let list: List = new List();

    list.fields = ["*"];
    list.PageName = "SchoolClassPeriods";
    list.filter = [orgIdSearchstr + " and Active eq 1"];
    this.Teachers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        
        this.SchoolClassPeriod = [...data.value];

      })
  }
  GetTeachers() {

    var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _WorkAccount = this.WorkAccounts.filter(f => f.MasterDataName.toLowerCase() == "teaching");
    var _workAccountId = 0;
    if (_WorkAccount.length > 0)
      _workAccountId = _WorkAccount[0].MasterDataId;

    let list: List = new List();

    list.fields = ["WorkAccountId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($select=EmpEmployeeId", "FirstName", "LastName)"]
    list.filter = [orgIdSearchstr + " and Active eq 1 and WorkAccountId eq " + _workAccountId];
    //list.orderBy = "ParentId";
    this.Teachers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.filter(f => {
          this.Teachers.push({
            TeacherId: f.Employee.EmpEmployeeId,
            TeacherName: f.Employee.FirstName + " " + f.Employee.LastName
          })
        })

      })
  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.Batches = this.tokenstorage.getBatches()
        this.shareddata.ChangeSubjects(this.Subjects);
        this.GetTeachers();
        this.GetClassSubject();
        this.loading = false; this.PageLoading = false;
      });
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
export interface ITeacherPeriod {
  TeacherPeriodId: number;
  EmployeeId: number;
  SchoolClassPeriodId: number;
  TeacherSubjectId: number;
  OffPeriod: boolean;
  Active: boolean;
  Action: boolean;
}
export interface ITeachers {
  TeacherId: number;
  TeacherName: string;
}
