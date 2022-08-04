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
  selector: 'app-teachersubject',
  templateUrl: './teachersubject.component.html',
  styleUrls: ['./teachersubject.component.scss']
})
export class TeachersubjectComponent implements OnInit {
  PageLoading = false;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  TeacherSubjectListName = "TeacherSubjects";
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
  SubjectTypes = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  CheckBatchIDForEdit = 1;
  DataCountToSave = -1;
  Batches = [];
  ClassSubjects = [];
  TeacherSubjectList: ITeacherSubject[] = [];
  dataSource: MatTableDataSource<ITeacherSubject>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchClassId: [0],
    searchEmployeeId: [0]
  });

  TeacherSubjectId = 0;
  TeacherSubjectData = {
    TeacherSubjectId: 0,
    ClassSubjectId: 0,
    EmployeeId: 0,
    OrgId: 0,
    Active: 1
  };
  displayedColumns = [
    'TeacherSubjectId',
    'EmployeeId',
    'ClassSubjectId',
    'ClsName',
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
  GetTeacherSubjectId(event) {
    this.TeacherSubjectId = event;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
    this.TeacherSubjectList = [];
    this.dataSource = new MatTableDataSource<any>(this.TeacherSubjectList);
    this.GetTeacherSubject();
  }

  View(element) {
    // //debugger;
    // this.TeacherSubjectId = element.TeacherSubjectId;
    // this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    // setTimeout(() => {
    //   this.TeacherSubjectAdd.PageLoad();
    // }, 50);
  }

  addnew() {
    let toadd = {
      TeacherSubjectId: 0,
      EmployeeId: 0,
      ClassSubjectId: 0,
      Active: 1,
      Action: false
    };
    this.TeacherSubjectList.push(toadd);
    this.dataSource = new MatTableDataSource<ITeacherSubject>(this.TeacherSubjectList);

  }
  // CopyFromPreviousBatch() {
  //   //console.log("here ", this.PreviousBatchId)
  //   this.PreviousBatchId = +this.tokenstorage.getPreviousBatchId();
  //   if (this.PreviousBatchId == -1)
  //     this.contentservice.openSnackBar("Previous batch not defined.",globalconstants.ActionText,globalconstants.RedBackground);
  //   else
  //     this.GetTeacherSubject(1)
  // }
  GetTeacherSubject() {
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
      'TeacherSubjectId',
      'ClassSubjectId',
      'EmployeeId',
      'Active',
    ];

    list.PageName = this.TeacherSubjectListName;
    //list.lookupFields = ["ClassSubject($select=ClassSubjectId,ClassId,SubjectId)"];
    list.filter = [filterStr];
    this.TeacherSubjectList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _classSubject = [];
        if (_classId > 0)
          _classSubject = this.ClassSubjects.filter(f => f.ClassId == _classId);
        else
          _classSubject = [...this.ClassSubjects];

        debugger;
        data.value.forEach(teachersubject => {
          var objClsSubject = _classSubject.filter(clssubject => clssubject.ClassSubjectId == teachersubject.ClassSubjectId)
          if (objClsSubject.length > 0) {
            teachersubject["ClsName"] = objClsSubject[0]["ClsName"];
            this.TeacherSubjectList.push(teachersubject);
          }

        })
        if (this.TeacherSubjectList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        this.TeacherSubjectList.sort((a, b) => b.Active - a.Active);
        console.log("TeacherSubjectList", this.TeacherSubjectList);
        //console.log("TeacherSubjectList", this.TeacherSubjectList);
        this.dataSource = new MatTableDataSource<ITeacherSubject>(this.TeacherSubjectList);
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
    this.dataservice.postPatch('TeacherSubjects', toupdate, element.TeacherSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  updateSelectHowMany(row) {
    //debugger;
    row.SelectHowMany = this.SubjectTypes.filter(f => f.SubjectTypeId == row.SubjectTypeId)[0].SelectHowMany;
    row.Action = true;
  }
  SaveAll() {
    this.DataCountToSave = this.TeacherSubjectList.length;
    var toUpdate = this.TeacherSubjectList.filter(f => f.Action);
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
    if (row.ClassSubjectId == 0) {
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      return;
    }
    let checkFilterString = "ClassSubjectId eq " + row.ClassSubjectId +
      " and EmployeeId eq " + row.EmployeeId;


    if (row.TeacherSubjectId > 0)
      checkFilterString += " and TeacherSubjectId ne " + row.TeacherSubjectId;

    checkFilterString += ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = ["TeacherSubjectId"];
    list.PageName = this.TeacherSubjectListName;
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

          this.TeacherSubjectData.Active = row.Active;
          this.TeacherSubjectData.TeacherSubjectId = row.TeacherSubjectId;
          this.TeacherSubjectData.ClassSubjectId = row.ClassSubjectId;
          this.TeacherSubjectData.EmployeeId = row.EmployeeId;
          this.TeacherSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
          if (this.TeacherSubjectData.TeacherSubjectId == 0) {
            this.TeacherSubjectData["CreatedDate"] = new Date();
            this.TeacherSubjectData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.TeacherSubjectData["UpdatedDate"];
            delete this.TeacherSubjectData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.TeacherSubjectData["CreatedDate"];
            delete this.TeacherSubjectData["CreatedBy"];
            this.TeacherSubjectData["UpdatedDate"] = new Date();
            this.TeacherSubjectData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });

  }

  insert(row) {

    //console.log('this.TeacherSubjectData', this.TeacherSubjectData)
    //debugger;
    this.dataservice.postPatch('TeacherSubjects', this.TeacherSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {

          row.Action = false;
          row.TeacherSubjectId = data.TeacherSubjectId;
          if (this.DataCountToSave == 0) {
            this.loading = false; this.PageLoading = false;
            this.DataCountToSave = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  update(row) {

    this.dataservice.postPatch('TeacherSubjects', this.TeacherSubjectData, this.TeacherSubjectData.TeacherSubjectId, 'patch')
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
  GetSubjectTypes() {

    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = ["SubjectTypeId", "SubjectTypeName", "SelectHowMany"];
    list.PageName = "SubjectTypes";
    list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and Active eq 1 "];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SubjectTypes = [...data.value];
        this.shareddata.ChangeSubjectTypes(this.SubjectTypes);

      })
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
        this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
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
export interface ITeacherSubject {
  TeacherSubjectId: number;
  ClassSubjectId: number;
  EmployeeId: number;
  Active: number;
  Action: boolean;
}
export interface ITeachers {
  TeacherId: number;
  TeacherName: string;
}