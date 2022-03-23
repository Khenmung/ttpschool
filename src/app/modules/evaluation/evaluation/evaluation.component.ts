import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  OnlineEvaluationId = 0;
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  OnlineEvaluationList: IOnlineEvaluation[] = [];
  Sessions = [];
  SelectedBatchId = 0;
  SelectedClassSubjects=[];
  ClassSubjects = [];
  Classes = [];
  RatingOptions = [];
  filteredOptions: Observable<IOnlineEvaluation[]>;
  dataSource: MatTableDataSource<IOnlineEvaluation>;
  allMasterData = [];
  EvaluationTypes =[];
  //ExamId = 0;
  OnlineEvaluationData = {
    OnlineEvaluationId: 0,
    ClassId: 0,
    SubjectId: 0,
    Topic: 0,
    EvaluationTypeId: 0,
    OrgId: 0,
    Active: 0,
  };
  OnlineEvaluationForUpdate = [];
  displayedColumns = [
    'OnlineEvaluationId',
    'Topic',
    'Active',
    'Action'
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
    this.StudentClassId = this.tokenstorage.getStudentClassId();
    this.searchForm = this.fb.group({
      // searchProfileName: [''],
      // searchCategoryId: [0],
      // searchSubCategoryId: [0],
      // searchClassId: [0]
    })
    this.PageLoad();
  }
  // private _filter(name: string): IStudent[] {

  //   const filterValue = name.toLowerCase();
  //   return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  // }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONMASTER)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetMasterData();
        if (this.Classes.length == 0) {
          this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
            this.Classes = [...data.value];
          });
        }
      }
    }
  }
  // SelectSubCategory(pCategoryId) {
  //   this.SubCategories = this.allMasterData.filter(f => f.ParentId == pCategoryId.value);
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
  GetClassSubjects() {
    let list = new List();
    list.PageName = "ClassSubjects";
    list.fields = ["ClassSubjectId,ClassId,SubjectId"];
    list.lookupFields = ["ClassMaster($select=ClassId,ClassName)"];
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = data.value.map(m => {
          var _subjectname = "";
          var subjectobj = this.allMasterData.filter(f => f.MasterDataId == m.SubjectId);
          if (subjectobj.length > 0)
            _subjectname = subjectobj[0].MasterDataName;
          m.ClassSubject = m.ClassMaster.ClassName + "-" + _subjectname;

          return m;

        });
      });
  }
  viewchild(row) {
    this.OnlineEvaluationId = row.OnlineEvaluationId;
  }
  AddNew() {
    var newItem = {
      OnlineEvaluationId: 0,
      ClassId: 0,
      SubjectId: 0,
      Topic: 0,
      EvaluationTypeId: 0,      
      Active: 0,
      Action: false
    }
    this.OnlineEvaluationList = [];
    this.OnlineEvaluationList.push(newItem);
    this.dataSource = new MatTableDataSource(this.OnlineEvaluationList);
  }
  UpdateOrSave(row) {

    //debugger;
    var _classId = this.searchForm.get("searchClassId").value;
    var _subjectId = this.searchForm.get("searchSubjectId").value;
    var _topic = this.searchForm.get("searchTopic").value;
    var _examId = this.searchForm.get("searchExamId").value;

    this.loading = true;
    let checkFilterString = '';

    if (_classId > 0)
      checkFilterString = "ClassId eq " + _classId;
    if (_examId > 0)
      checkFilterString = " and ExamId eq " + _examId;
    if (_subjectId > 0)
      checkFilterString += " and SubjectId eq " + _subjectId;
    if (_topic.length > 0)
      checkFilterString += " and contains(Topic,'" + _topic + "')";

    if (row.OnlineEvaluationId > 0)
      checkFilterString += " and OnlineEvaluationId ne " + row.OnlineEvaluationId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["OnlineEvaluationId"];
    list.PageName = "OnlineEvaluations";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
        }
        else {
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
          this.OnlineEvaluationForUpdate = [];;
          this.OnlineEvaluationForUpdate.push(
            {
              OnlineEvaluationId: row.OnlineEvaluationId,
              ClassId: _classId,
              SubjectId: _subjectId,
              Topic: row.Topic,
              EvaluationTypeId: row.EvaluationTypeId,
              ExamId: _examId,
              Active: row.Active,
              OrgId: this.LoginUserDetail[0]["orgId"]
            });
          console.log('dta', this.OnlineEvaluationForUpdate);

          if (this.OnlineEvaluationForUpdate[0].OnlineEvaluationId == 0) {
            this.OnlineEvaluationForUpdate[0]["CreatedDate"] = new Date();
            this.OnlineEvaluationForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.OnlineEvaluationForUpdate[0]["UpdatedDate"] = new Date();
            delete this.OnlineEvaluationForUpdate[0]["UpdatedBy"];
            delete this.OnlineEvaluationForUpdate[0]["SubCategories"];
            ////console.log("inserting1",this.OnlineEvaluationForUpdate);
            this.insert(row);
          }
          else {
            this.OnlineEvaluationForUpdate[0]["CreatedDate"] = new Date(row.CreatedDate);
            this.OnlineEvaluationForUpdate[0]["CreatedBy"] = row.CreatedBy;
            this.OnlineEvaluationForUpdate[0]["UpdatedDate"] = new Date();
            delete this.OnlineEvaluationForUpdate[0]["SubCategories"];
            delete this.OnlineEvaluationForUpdate[0]["UpdatedBy"];
            //this.OnlineEvaluationForUpdate[0]["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            //this.insert(row);
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {
    //console.log("inserting",this.OnlineEvaluationForUpdate);
    //debugger;
    this.dataservice.postPatch('OnlineEvaluations', this.OnlineEvaluationForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.OnlineEvaluationId = data.OnlineEvaluationId;
          row.Action = false;
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    //console.log("updating",this.OnlineEvaluationForUpdate);
    this.dataservice.postPatch('OnlineEvaluations', this.OnlineEvaluationForUpdate[0], this.OnlineEvaluationForUpdate[0].OnlineEvaluationId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetOnlineEvaluation() {
    //debugger;
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _classId = this.searchForm.get("searchClassId").value;
    var _subjectId = this.searchForm.get("searchSubjectId").value;
    var _topic = this.searchForm.get("searchTopic").value;
    var _examId = this.searchForm.get("searchExamId").value;


    if (_classId > 0)
      filterStr += " and ClassId eq " + _classId
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.BlueBackground);
      return;
    }

    if (_classId > 0)
      filterStr = "ClassId eq " + _classId;
    if (_examId > 0)
      filterStr = " and ExamId eq " + _examId;
    if (_subjectId > 0)
      filterStr += " and SubjectId eq " + _subjectId;
    if (_topic.length > 0)
      filterStr += " and Topic eq '" + _topic + "'";

    let list: List = new List();
    list.fields = [
      'OnlineEvaluationId',
      'ClassId',
      'SubjectId',
      'Topic',
      'EvaluationTypeId',
      'ExamId',
      'Active',
    ];

    list.PageName = "OnlineEvaluations";

    list.filter = [filterStr];
    this.OnlineEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.OnlineEvaluationList = data.value.map(item => {
            item.Action = false;
            return item;
          })
        }

        this.dataSource = new MatTableDataSource<IOnlineEvaluation>(this.OnlineEvaluationList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.EvaluationTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.EVALUATIONTYPE);
        this.GetClassSubjects();
        this.loading = false;
      });
  }
  onBlur(row) {
    row.Action = true;
  }
  getClassSubjects() {
    debugger;
    
    this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.searchForm.get("ClassId").value);


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
}

export interface IOnlineEvaluation {
  OnlineEvaluationId: number;
  ClassId: number;
  SubjectId: number;
  Topic: number;
  EvaluationTypeId: number;
  Active: number;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}

