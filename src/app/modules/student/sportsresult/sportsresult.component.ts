import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-sportsresult',
  templateUrl: './sportsresult.component.html',
  styleUrls: ['./sportsresult.component.scss']
})
export class SportsResultComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  RowsToUpdate = -1;
  EvaluationStarted = false;
  EvaluationSubmitted = false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  StudentClassId = 0;
  ClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  ActivityCategory = [];
  RelevantEvaluationListForSelectedStudent = [];
  SportsResultList: any[] = [];
  SelectedBatchId = 0;
  Sections = [];
  Classes = [];
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  SelectedClassSubjects = [];
  StudentClasses = [];
  Students = [];
  ActivityNames = [];
  ActivitySessions = [];
  filteredStudents: Observable<IStudent[]>;
  SportsResultData = {
    SportResultId: 0,
    Achievement: '',
    SportsNameId: 0,
    CategoryId: 0,
    SubCategoryId: 0,
    StudentClassId: 0,
    AchievementDate: new Date(),
    SessionId: 0,
    OrgId: 0,
    Active: 0
  };
  SportsResultForUpdate = [];
  displayedColumns = [
    "SportResultId",
    "Achievement",
    "SportsNameId",
    "CategoryId",
    "SubCategoryId",
    "SessionId",
    "AchievementDate",
    "Active",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    debugger;
    this.searchForm = this.fb.group({
      searchStudentName: [0]
    });
    this.filteredStudents = this.searchForm.get("searchStudentName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      );
    this.ClassId = this.tokenstorage.getClassId();
    this.PageLoad();

  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EVALUATION.EXECUTEEVALUATION)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.StudentClassId = this.tokenstorage.getStudentClassId();
        
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetMasterData();
        if (this.Classes.length == 0) {
          this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
            this.Classes = [...data.value];
          });
        }

        this.GetStudentClasses();
      }
    }
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
  SetStudentClassId() {
    var obj = this.searchForm.get("searchStudentName").value;
    if (obj != "") {
      this.StudentClassId = obj.StudentClassId;
    }
  }

  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let checkFilterString = "StudentClassId eq " + this.StudentClassId +
      " and SessionId eq " + row.SessionId +
      " and SportsNameId eq " + row.SportsNameId +
      " and BatchId eq " + this.SelectedBatchId;
    this.RowsToUpdate = 0;

    if (row.SportResultId > 0)
      checkFilterString += " and SportResultId ne " + row.SportResultId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["SportResultId"];
    list.PageName = "SportResults";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.SportsResultForUpdate = [];;
          this.SportsResultForUpdate.push(
            {
              SportResultId: row.SportResultId,
              Achievement: row.Achievement,
              SportsNameId: row.SportsNameId,
              CategoryId: row.CategoryId,
              SubCategoryId: row.SubCategoryId,
              StudentClassId: this.StudentClassId,
              AchievementDate: row.AchievementDate,
              SessionId: row.SessionId,
              Active: row.Active,
              OrgId: this.LoginUserDetail[0]["orgId"],
              BatchId: this.SelectedBatchId
            });

          if (this.SportsResultForUpdate[0].SportResultId == 0) {
            this.SportsResultForUpdate[0]["CreatedDate"] = new Date();
            this.SportsResultForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.SportsResultForUpdate[0]["UpdatedDate"];
            delete this.SportsResultForUpdate[0]["UpdatedBy"];
            this.insert(row);
          }
          else {
            //console.log("this.SportsResultForUpdate[0] update", this.SportsResultForUpdate[0])
            this.SportsResultForUpdate[0]["UpdatedDate"] = new Date();
            this.SportsResultForUpdate[0]["UpdatedBy"];
            delete this.SportsResultForUpdate[0]["CreatedDate"];
            delete this.SportsResultForUpdate[0]["CreatedBy"];
            this.insert(row);
          }
        }
      }, error => {
        this.loadingFalse();
        this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {
    console.log("this.SportsResultForUpdate", this.SportsResultForUpdate)
    this.dataservice.postPatch('SportResults', this.SportsResultForUpdate, 0, 'post')
      .subscribe(
        (data: any) => {
          row.SportResultId = data.SportResultId;
          row.Action = false;
          if (this.RowsToUpdate == 0) {
            this.RowsToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse();
          }
        }, error => {
          this.loadingFalse();
          console.log("error on sport result insert", error);
        });
  }
  update(row) {
    //console.log("updating",this.SportsResultForUpdate);
    this.dataservice.postPatch('SportResults', this.SportsResultForUpdate[0], this.SportsResultForUpdate[0].SportsResultResultId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          console.log("data update", data.value);
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }

  GetSportsResult(pStudentClassId) {
    debugger;
    var _studentClassId = 0;
    if (pStudentClassId == 0) {
      var obj = this.searchForm.get("searchStudentName").value;
      if (obj != 0) {
        _studentClassId = obj.StudentClassId;
      }
      else {
        this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }
    else {
      _studentClassId =pStudentClassId;
    }
    this.loading = true;
    this.SportsResultList = [];
    var filterStr = "Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and StudentClassId eq " + _studentClassId;
    let list: List = new List();
    list.fields = [
      "SportResultId",
      "StudentClassId",
      "Achievement",
      "SportsNameId",
      "CategoryId",
      "SubCategoryId",
      "AchievementDate",
      "SessionId",
      "Active"
    ];

    list.PageName = "SportResults";
    list.filter = [filterStr];
    this.SportsResultList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SportsResultList = data.value.map(m => {

          var obj = this.ActivityNames.filter(f => f.MasterDataId == m.SportsNameId);
          if (obj.length > 0)
            m.SportsName = obj[0].MasterDataName;
          else
            m.SportsName = '';
          m.SubCategories = this.allMasterData.filter(f => f.ParentId == m.CategoryId);
          m.Action = false;
          return m;
        })
        if (this.SportsResultList.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);

        }
        this.dataSource = new MatTableDataSource<ISportsResult>(this.SportsResultList);
        this.dataSource.paginator = this.paginator;
        this.loadingFalse();
      });

  }
  SelectSubCategory(row,event){
      row.SubCategories = this.allMasterData.filter(f=>f.ParentId == row.CategoryId);
      this.onBlur(row);
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.ActivityNames = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYNAME);
        this.ActivityCategory = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYCATEGORY);
        this.ActivitySessions = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYSESSION);

        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        if(this.StudentClassId>0)
        {
          this.GetSportsResult(this.StudentClassId);
        }
      });
  }
  AddNew() {

    var newdata = {
      SportResultId: 0,
      Achievement: '',
      SportsNameId: 0,
      CategoryId: 0,
      SubCategoryId: 0,
      StudentClassId: this.StudentClassId,
      AchievementDate: new Date(),
      SessionId: 0,
      Active: 0,
      Action: false
    };
    this.SportsResultList = [];
    this.SportsResultList.push(newdata);
    this.dataSource = new MatTableDataSource<ISportsResult>(this.SportsResultList);
  }
  onBlur(row) {
    row.Action = true;
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    var item = this.SportsResultList.filter(f => f.SportResultId == row.SportResultId);
    item[0].SubCategories = this.allMasterData.filter(f => f.ParentId == row.CategoryId);

    this.dataSource = new MatTableDataSource(this.SportsResultList);
  }
  UpdateActive(row, event) {
    row.Active = event.checked ? 1 : 0;
    row.Action = true;
  }
  getDropDownData(dropdowntype) {
    let Id = 0;
    let Ids = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    })
    if (Ids.length > 0) {
      Id = Ids[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      })
    }
    else
      return [];

  }

  GetStudentClasses() {
    //debugger;
    var filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

    let list: List = new List();
    list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId"];
    list.PageName = "StudentClasses";
    list.filter = [filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClasses = [...data.value];
        this.GetStudents();
      })
  }
  GetStudents() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      'StudentId',
      'FirstName',
      'LastName',
      'ContactNo',
    ];

    list.PageName = "Students";
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.Students = [];
        if (data.value.length > 0) {
          data.value.forEach(student => {
            var _RollNo = '';
            var _name = '';
            var _className = '';
            var _classId = '';
            var _section = '';
            var _studentClassId = 0;
            var studentclassobj = this.StudentClasses.filter(f => f.StudentId == student.StudentId);
            if (studentclassobj.length > 0) {
              _studentClassId = studentclassobj[0].StudentClassId;
              var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);
              _classId = studentclassobj[0].ClassId;
              if (_classNameobj.length > 0)
                _className = _classNameobj[0].ClassName;
              var _SectionObj = this.Sections.filter(f => f.MasterDataId == studentclassobj[0].SectionId)

              if (_SectionObj.length > 0)
                _section = _SectionObj[0].MasterDataName;
              _RollNo = studentclassobj[0].RollNo;
              _name = student.FirstName + " " + student.LastName;
              var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo + "-" + student.ContactNo;
              this.Students.push({
                StudentClassId: _studentClassId,
                StudentId: student.StudentId,
                ClassId: _classId,
                Name: _fullDescription,
              });
            }
          })
        }
        this.loading = false;
      })
  }
}
export interface ISportsResult {
  SportResultId: number;
  Achievement: string;
  SportsNameId: number;
  CategoryId: number;
  SubCategoryId: number;
  StudentClassId: number;
  AchievementDate: Date;
  SessionId: number;
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}


