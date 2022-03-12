import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-StudentEvaluation',
  templateUrl: './studentevaluation.component.html',
  styleUrls: ['./studentevaluation.component.scss']
})
export class StudentEvaluationComponent implements OnInit {
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ClassSubjects = [];
  Ratings = [];
  SelectedApplicationId = 0;
  StudentClassId = 0;
  ClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  StudentEvaluationList: any[] = [];
  SelectedBatchId = 0;
  Categories = [];
  Classes = [];
  ClassEvaluations = [];
  RatingOptions = [];
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  EvaluationTypes = [];
  Exams = [];
  ExamNames = [];
  SelectedClassSubjects = [];
  StudentEvaluationData = {
    StudentEvaluationId: 0,
    ClassEvaluationId: 0,
    RatingId: 0,
    Detail: '',
    EvaluationTypeId: 0,
    ExamId: 0,
    StudentClassId: 0,
    OrgId: 0,
    Active: 0
  };
  StudentEvaluationForUpdate = [];
  displayedColumns = [
    'StudentEvaluationId',
    'Description',
    //'Detail',
    'RatingId',
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
    debugger;
    this.searchForm = this.fb.group({
      searchSubjectId: [0],
      searchEvaluationTypeId: [0],
      searchExamId: [0]
    });
    this.StudentClassId = this.tokenstorage.getStudentClassId();
    if (this.StudentClassId == 0) {
      this.contentservice.openSnackBar("Student class Id is zero", globalconstants.ActionText, globalconstants.RedBackground);

    }
    else {
      this.ClassId = this.tokenstorage.getClassId();
      this.PageLoad();
    }
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.STUDENT.STUDENTAPROFILE)
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
  AddNew() {
    var newItem = {
      StudentEvaluationId: 0,
      ClassEvaluationId: 0,
      RatingId: 0,
      Detail: '',
      EvaluationTypeId: this.searchForm.get("searchEvaluationTypeId").value,
      ExamId: this.searchForm.get("searchExamId").value,
      StudentClassId: 0,
      Active: 0,
      Action: false
    }
    this.StudentEvaluationList = [];
    this.StudentEvaluationList.push(newItem);
    this.dataSource = new MatTableDataSource(this.StudentEvaluationList);
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    let checkFilterString = "StudentClassId eq " + this.StudentClassId +
      " and ClassEvaluationId eq " + row.ClassEvaluationId;


    if (row.StudentEvaluationId > 0)
      checkFilterString += " and StudentEvaluationId ne " + row.StudentEvaluationId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["StudentEvaluationId"];
    list.PageName = "StudentEvaluations";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          //this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
          this.StudentEvaluationForUpdate = [];;
          ////console.log("inserting-1",this.StudentEvaluationForUpdate);
          this.StudentEvaluationForUpdate.push(
            {
              StudentEvaluationId: row.StudentEvaluationId,
              StudentClassId: row.StudentClassId,
              ClassEvaluationId: row.ClassEvaluationId,
              EvaluationTypeId: row.EvaluationTypeId,
              ExamId: row.ExamId,
              RatingId: row.RatingId,
              Detail: row.Detail,
              Active: row.Active,
              OrgId: this.LoginUserDetail[0]["orgId"],
            });

          if (this.StudentEvaluationForUpdate[0].StudentEvaluationId == 0) {
            this.StudentEvaluationForUpdate[0]["CreatedDate"] = new Date();
            this.StudentEvaluationForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.StudentEvaluationForUpdate[0]["UpdatedDate"] = new Date();
            delete this.StudentEvaluationForUpdate[0]["UpdatedBy"];
            delete this.StudentEvaluationForUpdate[0]["SubCategories"];
            ////console.log("inserting1",this.StudentEvaluationForUpdate);
            this.insert(row);
          }
          else {
            this.StudentEvaluationForUpdate[0]["CreatedDate"] = new Date(row.CreatedDate);
            this.StudentEvaluationForUpdate[0]["CreatedBy"] = row.CreatedBy;
            this.StudentEvaluationForUpdate[0]["UpdatedDate"] = new Date();
            delete this.StudentEvaluationForUpdate[0]["SubCategories"];
            delete this.StudentEvaluationForUpdate[0]["UpdatedBy"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {
    this.dataservice.postPatch('StudentEvaluations', this.StudentEvaluationForUpdate, 0, 'post')
      .subscribe(
        (data: any) => {
          row.StudentEvaluationId = data.StudentEvaluationId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    //console.log("updating",this.StudentEvaluationForUpdate);
    this.dataservice.postPatch('StudentEvaluations', this.StudentEvaluationForUpdate[0], this.StudentEvaluationForUpdate[0].StudentEvaluationId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetStudentEvaluation() {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and StudentClassId eq ' + this.StudentClassId

    var _searchEvaluationTypeId = this.searchForm.get("searchEvaluationTypeId").value;
    var _searchExamId = this.searchForm.get("searchExamId").value;
    var _searchSubjectId = this.searchForm.get("searchSubjectId").value;
    if (_searchEvaluationTypeId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select evaluation type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    
    var _classEvaluations = this.ClassEvaluations.filter(f => f.EvaluationTypeId == _searchEvaluationTypeId
      && (f.ClassId == 0 || f.ClassId == this.ClassId));
    if (_searchExamId > 0) {
      _classEvaluations = _classEvaluations.filter(f => f.ExamId == _searchExamId);
    }
    if (_searchSubjectId > 0) {
      _classEvaluations = _classEvaluations.filter(f => f.SubjectId == _searchSubjectId);
    }
    let list: List = new List();
    list.fields = [
      'StudentEvaluationId',
      'StudentClassId',
      'ClassEvaluationId',
      'RatingId',
      'Detail',
      'EvaluationTypeId',
      'ExamId',
      'Active'
    ];

    list.PageName = "StudentEvaluations";
    //list.lookupFields = ["StudentClass($select=ClassId)"];

    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        
        var item;
        _classEvaluations.forEach(clseval => {
          var existing = data.value.filter(f => f.ClassEvaluationId == clseval.ClassEvaluationId);
          if (existing.length > 0) {
            item = {
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentClassId: this.StudentClassId,
              CatSequence: clseval.DisplayOrder,
              RatingId: existing[0].RatingId,
              Description:clseval.Description,
              Detail: existing[0].Detail,
              StudentEvaluationId: existing[0].StudentEvaluationId,
              ClassEvaluationId: existing[0].ClassEvaluationId,
              Active: existing[0].Active,
              EvaluationTypeId: existing[0].EvaluationTypeId,
              ExamId: existing[0].ExamId
            }
          }
          else {
            item = {
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentClassId: this.StudentClassId,
              CatSequence: clseval.DisplayOrder,
              RatingId: 0,
              Description:clseval.Description,
              Detail: '',
              StudentEvaluationId: 0,
              ClassEvaluationId:clseval.ClassEvaluationId,
              Active: 0,
              EvaluationTypeId: _searchEvaluationTypeId,
              ExamId: 0
            }
          }
          this.StudentEvaluationList.push(item);
        })
        console.log("this.StudentEvaluationList", this.StudentEvaluationList)
        this.dataSource = new MatTableDataSource<IStudentEvaluation>(this.StudentEvaluationList);
        this.loadingFalse();
      });

  }
  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"];// + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = data.value.map(e => {
          return {
            ExamId: e.ExamId,
            ExamName: this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)[0].MasterDataName
          }
        })
        this.loading = false;
      })
  }
  // GetSelectedClassSubject() {
  //   debugger;
  //   this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.ClassId)
  // }
  GetClassSubjects() {
    let list = new List();
    list.PageName = "ClassSubjects";
    list.fields = ["ClassSubjectId,ClassId,SubjectId"];
    //list.lookupFields = ["ClassMaster($select=ClassId,ClassName)"];
    list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = data.value.map(m => {
          var _subjectname = "";
          var subjectobj = this.allMasterData.filter(f => f.MasterDataId == m.SubjectId);
          if (subjectobj.length > 0)
            _subjectname = subjectobj[0].MasterDataName;
          m.SubjectName = _subjectname;

          return m;

        });
        this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.ClassId);
      });
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Categories = this.getDropDownData(globalconstants.MasterDefinitions.school.PROFILECATEGORY);
        this.EvaluationTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.EVALUATIONTYPE);
        this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.GetExams();
        this.GetClassSubjects();
        this.GetClassEvaluations();
        //this.GetStudentEvaluation();
      });
  }
  // SelectSubCategory(pCategoryId) {
  //   this.SubCategories = this.allMasterData.filter(f => f.ParentId == pCategoryId.value);
  // }
  onBlur(row) {
    //row.RatingId = 
    row.Action = true;
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    //row.SubCategories = this.Categories.filter(f=>f.MasterDataId == row.CategoryId);
    var item = this.StudentEvaluationList.filter(f => f.StudentEvaluationId == row.StudentEvaluationId);
    item[0].SubCategories = this.allMasterData.filter(f => f.ParentId == row.CategoryId);

    ////console.log("dat", this.StudentEvaluationList);
    this.dataSource = new MatTableDataSource(this.StudentEvaluationList);


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
  GetClassEvaluations() {

    ////console.log(this.LoginUserDetail);

    let list: List = new List();
    list.fields = [
      'ClassEvaluationId',
      'ClassEvalCategoryId',
      'DisplayOrder',
      'ClassId',
      'SubjectId',
      'Description',
      'EvaluationTypeId',
      'AnswerOptionId',
      'ExamId'
    ];

    list.PageName = "ClassEvaluations";
    list.lookupFields = ["ClassEvaluationOptions($filter=Active eq 1;$select=AnswerOptionsId,Title,Value,Correct,Point)"]
    list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.ClassEvaluations = data.value.map(clseval => {
            var _categoryName = ''
            var catobj = this.allMasterData.filter(f => f.MasterDataId == clseval.ClassEvalCategoryId)
            if (catobj.length > 0)
              _categoryName = catobj[0].MasterDataName;
            var _subCategoryName = '';
            var subcatobj = this.allMasterData.filter(f => f.MasterDataId == clseval.ClassEvalSubCategoryId)
            if (subcatobj.length > 0)
              _subCategoryName = subcatobj[0].MasterDataName;
            clseval.CategoryName = _categoryName;
            clseval.SubCategoryName = _subCategoryName;
            return clseval;
          })
        }
        this.loadingFalse();
      })
  }

}
export interface IStudentEvaluation {
  StudentEvaluationId: number;
  ClassEvaluationId: number;
  RatingId: number;
  Detail: string;
  StudentClassId: number;
  EvaluationTypeId: number;
  ExamId: number;
  SubCategories: any[];
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}


