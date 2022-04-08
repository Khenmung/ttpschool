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
import { ClassEvaluationOptionComponent } from '../classevaluationoption/classevaluationoption.component';

@Component({
  selector: 'app-ClassEvaluation',
  templateUrl: './classevaluation.component.html',
  styleUrls: ['./classevaluation.component.scss']
})
export class ClassEvaluationComponent implements OnInit {
  @ViewChild("table") mattable;
  @ViewChild(ClassEvaluationOptionComponent) option: ClassEvaluationOptionComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  selectedIndex = 0;
  selectedRowIndex = -1;
  EvaluationTypes = [];
  ClassEvaluationIdTopass = 0;
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  ClassEvaluationOptionList = [];
  ClassEvaluationList: IClassEvaluation[] = [];
  //EvaluationTypeId = 0;
  SelectedBatchId = 0;
  Categories = [];
  SubCategories = [];
  Classes = [];
  ClassSubjects = [];
  Exams = [];
  ExamNames = [];
  SelectedClassSubjects = [];
  filteredOptions: Observable<IClassEvaluation[]>;
  dataSource: MatTableDataSource<IClassEvaluation>;
  allMasterData = [];
  ClassEvaluationData = {
    ClassEvaluationId: 0,
    ClassEvalCategoryId: 0,
    MultipleAnswer: 0,
    EvaluationTypeId: 0,
    ExamId: 0,
    SubjectId: 0,
    ClassId: 0,
    Description: '',
    DisplayOrder: 0,
    AnswerOptionId: 0,
    OrgId: 0,
    Active: 0,
  };
  ClassEvaluationForUpdate = [];
  displayedColumns = [
    'ClassEvaluationId',
    'Description',
    'ClassEvalCategoryId',
    'ClassEvalSubCategoryId',
    'DisplayOrder',
    'AnswerOptionId',
    'MultipleAnswer',
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
    this.StudentClassId = this.tokenstorage.getStudentClassId();
    this.searchForm = this.fb.group({
      searchEvaluationTypeId: [0],     
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
    debugger;
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
            this.loading = false;
          });
          //this.GetClassEvaluation();
        }
      }
    }
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
  SelectSubCategory(pCategoryId) {
    this.SubCategories = this.allMasterData.filter(f => f.ParentId == pCategoryId.value);
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
  viewchild(row) {
    debugger;
    this.option.GetClassEvaluationOption(row.ClassEvaluationId, row.AnswerOptionId);
    this.tabchanged(1);
  }
  tabchanged(indx) {
    debugger;
    this.selectedIndex = indx;
  }
  // Detail(value) {
  //   debugger;
  //   this.EvaluationTypeId = value.EvaluationTypeId;
  //   this.selectedIndex += 1;
  //   this.PageLoad();
  // }
  highlight(rowId) {
    if (this.selectedRowIndex == rowId)
      this.selectedRowIndex = -1;
    else
      this.selectedRowIndex = rowId
  }
  AddNew() {
    var _evaluationTypeId = this.searchForm.get("searchEvaluationTypeId").value;

    var newItem = {
      ClassEvaluationId: 0,
      ClassEvalCategoryId: 0,
      ClassEvalSubCategoryId: 0,
      Description: '',
      MultipleAnswer: 0,
      EvaluationTypeId: _evaluationTypeId,
      DisplayOrder: 0,
      AnswerOptionId: 0,
      Active: 0,
      Action: false
    }
    this.ClassEvaluationList = [];
    this.ClassEvaluationList.push(newItem);
    this.dataSource = new MatTableDataSource(this.ClassEvaluationList);
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    if (row.Description.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter description", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //this.EvaluationTypeId = this.searchForm.get("searchEvaluationTypeId").value
    if (row.EvaluationTypeId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("No Evaluation type Id selected.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let checkFilterString = "Description eq '" + row.Description + "'";
    if (row.ClassEvalCategoryId > 0)
      checkFilterString += " and ClassEvalCategoryId eq " + row.ClassEvalCategoryId
    // if (row.ClassEvalSubCategoryId > 0)
    //   checkFilterString += " and ClassEvalSubCategoryId eq " + row.ClassEvalSubCategoryId

    if (row.ClassEvaluationId > 0)
      checkFilterString += " and ClassEvaluationId ne " + row.ClassEvaluationId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["ClassEvaluationId"];
    list.PageName = "ClassEvaluations";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
          //this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
        }
        else {
          //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
          this.ClassEvaluationForUpdate = [];;
          ////console.log("inserting-1",this.ClassEvaluationForUpdate);
          this.ClassEvaluationForUpdate.push(
            {
              ClassEvaluationId: row.ClassEvaluationId,
              Active: row.Active,
              ClassEvalCategoryId: row.ClassEvalCategoryId,
              ClassEvalSubCategoryId: row.ClassEvalSubCategoryId,
              MultipleAnswer: row.MultipleAnswer,
              AnswerOptionId: row.AnswerOptionId,
              EvaluationTypeId: row.EvaluationTypeId,
              Description: row.Description,
              DisplayOrder: row.DisplayOrder,
              OrgId: this.LoginUserDetail[0]["orgId"]
            });
          console.log('dta', this.ClassEvaluationForUpdate);

          if (this.ClassEvaluationForUpdate[0].ClassEvaluationId == 0) {
            this.ClassEvaluationForUpdate[0]["CreatedDate"] = new Date();
            this.ClassEvaluationForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ClassEvaluationForUpdate[0]["UpdatedDate"] = new Date();
            delete this.ClassEvaluationForUpdate[0]["UpdatedBy"];
            delete this.ClassEvaluationForUpdate[0]["SubCategories"];
            ////console.log("inserting1",this.ClassEvaluationForUpdate);
            this.insert(row);
          }
          else {
            //this.ClassEvaluationForUpdate[0]["CreatedDate"] = new Date(row.CreatedDate);
            //this.ClassEvaluationForUpdate[0]["CreatedBy"] = row.CreatedBy;
            this.ClassEvaluationForUpdate[0]["UpdatedDate"] = new Date();
            delete this.ClassEvaluationForUpdate[0]["SubCategories"];
            delete this.ClassEvaluationForUpdate[0]["UpdatedBy"];
            //this.ClassEvaluationForUpdate[0]["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    //console.log("inserting",this.ClassEvaluationForUpdate);
    //debugger;
    this.dataservice.postPatch('ClassEvaluations', this.ClassEvaluationForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.ClassEvaluationId = data.ClassEvaluationId;
          row.Action = false;
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    //console.log("updating",this.ClassEvaluationForUpdate);
    this.dataservice.postPatch('ClassEvaluations', this.ClassEvaluationForUpdate[0], this.ClassEvaluationForUpdate[0].ClassEvaluationId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetClassEvaluation() {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _evaluationTypeId = this.searchForm.get("searchEvaluationTypeId").value;

    // if (this.EvaluationMasterId > 0)
    //   filterStr += " and EvaluationMasterId eq " + this.EvaluationMasterId;
    if (_evaluationTypeId > 0)
      filterStr += " and EvaluationTypeId eq " + _evaluationTypeId

    //filterStr += ' and StudentClassId eq ' + this.StudentClassId
    let list: List = new List();
    list.fields = [
      'ClassEvaluationId',
      'ClassEvalCategoryId',
      'ClassEvalSubCategoryId',
      'Description',
      'EvaluationTypeId',
      'MultipleAnswer',
      'AnswerOptionId',
      'DisplayOrder',
      'Active'
    ];

    list.PageName = "ClassEvaluations";

    list.filter = [filterStr];
    this.ClassEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.ClassEvaluationList = data.value.map(item => {
            item.Action = false;
            return item;
          })
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }

        //console.log('ClassEvaluation', this.ClassEvaluationList)
        this.dataSource = new MatTableDataSource<IClassEvaluation>(this.ClassEvaluationList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }
  GetClassEvaluationOption() {
    //debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'ParentId eq 0 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'AnswerOptionsId',
      'Title',
      'Value',
      'Point',
      'Correct',
      'ParentId',
      'Active',
    ];

    list.PageName = "ClassEvaluationOptions";

    list.filter = [filterStr];
    this.ClassEvaluationOptionList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassEvaluationOptionList = data.value.map(item => {
            return item;
          })
        }

        this.loadingFalse();
      });

  }
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
      });
  }
  GetSelectedClassSubject() {
    debugger;
    this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.searchForm.get("searchClassId").value)
  }
  SelectCategory() {
    debugger;
    this.Categories = this.allMasterData.filter(f => f.ParentId == this.searchForm.get("searchSubjectId").value);
  }
  GetMasterData() {
    debugger;
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.EvaluationTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.EVALUATIONTYPE);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.Categories = this.getDropDownData(globalconstants.MasterDefinitions.school.EVALUATIONCATEGORY);
        this.GetExams();
        this.loading = false;
        this.GetClassSubjects();
        this.GetClassEvaluationOption();
        //this.GetClassEvaluation();
      });
  }
  onBlur(row) {
    row.Action = true;
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    this.SubCategories = this.allMasterData.filter(f => f.ParentId == row.ClassEvalCategoryId);
  }
  UpdateMultiAnswer(row, event) {
    row.MultipleAnswer = event.checked ? 1 : 0;
    row.Action = true;
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

export interface IClassEvaluation {
  ClassEvaluationId: number;
  ClassEvalCategoryId: number;
  ClassEvalSubCategoryId: number;
  MultipleAnswer: number;
  Description: string;
  DisplayOrder: number;
  Active: number;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}



