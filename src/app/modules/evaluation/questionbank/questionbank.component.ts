import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
//import { QuestionBankOptionComponent } from '../QuestionBankoption/QuestionBankoption.component';

@Component({
  selector: 'app-questionbank',
  templateUrl: './questionbank.component.html',
  styleUrls: ['./questionbank.component.scss']
})
export class QuestionbankComponent implements OnInit {
  PageLoading = true;
  @ViewChild("table") mattable;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  LoginUserDetail: any[] = [];
  ClassGroups = [];
  CurrentRow: any = {};
  selectedIndex = 0;
  selectedRowIndex = -1;
  RowToUpdate = -1;
  EvaluationNames = [];
  QuestionBankIdTopass = 0;
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  QuestionBankOptionList = [];
  QuestionBankList: IQuestionBank[] = [];
  //EvaluationMasterId = 0;
  SelectedBatchId = 0;
  QuestionnaireTypes = [];
  SubCategories = [];
  Classes = [];
  ClassSubjects = [];
  Exams = [];
  ExamNames = [];
  SelectedClassSubjects = [];
  filteredOptions: Observable<IQuestionBank[]>;
  dataSource: MatTableDataSource<IQuestionBank>;
  allMasterData = [];

  QuestionBankData = {
    QuestionBankId: 0,
    ClassId: 0,
    ClassSubjectId: 0,
    CategoryId: 0,
    SubCategoryId: 0,
    LessonId: 0,
    DifficultyLevelId: 0,
    Questions: '',
    Diagram: '',
    OrgId: 0,
    Active: false
  };
  EvaluationMasterForClassGroup = [];
  QuestionBankForUpdate = [];
  displayedColumns = [
    'QuestionBankId',
    'Questions',
    'CategoryId',
    'SubCategoryId',
    'LessonId',
    'DifficultyLevelId',
    'Active',
    'Action'
  ];
  searchForm: UntypedFormGroup;

  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private fb: UntypedFormBuilder
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
    this.StudentClassId = this.tokenstorage.getStudentClassId();
    this.searchForm = this.fb.group({
      searchClassId: [0],
      searchClassSubjectId: [0],
      searchCategoryId: [0],
      searchSubCategoryId: [0],
      searchLessonId: [0],
      searchDifficultyLevelId: [0]
    })
    this.PageLoad();
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
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONQUESTIONNAIRE)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        //this.GetEvaluationNames();
        this.GetMasterData();
        if (this.Classes.length == 0) {
          this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
            this.Classes = [...data.value];
            this.loading = false; this.PageLoading = false;
          });
          //this.GetQuestionBank();
        }
        this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
          .subscribe((data: any) => {
            this.ClassGroups = [...data.value];
          });
      }
    }
  }
  EscapeSpecialCharacter(str) {

    if ((str === null) || (str === ''))
      return false;
    else
      str = str.toString();

    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    var format = /[!@#$&%^&*_+\=\[\]{};:'"\\|<>]+/;
    return str.replace(format, function (m) { return map[m]; });
    //return str.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
  SelectedLessons = [];
  SelectCategory = [];
  SelectedSubCategory = [];
  SelectSubject() {
    debugger;
    var _searchClassId = this.searchForm.get("searchClassId").value;
    if (_searchClassId > 0)
      this.SelectedClassSubjects = this.ClassSubjects.filter(d => d.ClassId == _searchClassId);

  }
  SelectCategoryChanged() {
    debugger;
    var _searchCategoryId = this.searchForm.get("searchCategoryId").value;
    if (_searchCategoryId > 0)
      this.SelectedSubCategory = this.allMasterData.filter(d => d.ParentId == _searchCategoryId);

  }
  SelectSubCategoryChanged() {
    debugger;
    var _searchSubCategoryId = this.searchForm.get("searchSubCategoryId").value;
    if (_searchSubCategoryId > 0)
      this.SelectedLessons = this.allMasterData.filter(d => d.ParentId == _searchSubCategoryId);
    else
      this.SelectedLessons = [];
  }
  GetExams() {

    this.contentservice.GetExams(this.LoginUserDetail[0]["orgId"], this.SelectedBatchId)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.forEach(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId
            })
        });
        this.loading = false; this.PageLoading = false;
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
  // viewchild(row) {
  //   debugger;
  //   this.option.GetQuestionBankOption(row.QuestionBankId, row.QuestionBankAnswerOptionParentId);
  //   this.tabchanged(1);
  // }
  tabchanged(indx) {
    debugger;
    this.selectedIndex = indx;
  }
  // Detail(value) {
  //   debugger;
  //   this.EvaluationMasterId = value.EvaluationMasterId;
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
    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var _classSubjectId = this.searchForm.get("searchClassSubjectId").value;
    if (_classSubjectId == 0) {
      this.contentservice.openSnackBar("Please select subject.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _searchCategoryId = this.searchForm.get("searchCategoryId").value;
    var _searchSubCategoryId = this.searchForm.get("searchSubCategoryId").value;
    var _searchLessonId = this.searchForm.get("searchLessonId").value;
    var _difficultyLevelId = this.searchForm.get("searchDifficultyLevelId").value;

debugger;

    var newItem = {
      QuestionBankId: 0,
      ClassId: _classId,
      ClassSubjectId: _classSubjectId,
      CategoryId: _searchCategoryId,
      SubCategoryId: _searchSubCategoryId,
      LessonId: _searchLessonId,
      DifficultyLevelId: _difficultyLevelId,
      Questions: '',
      Diagram: '',
      Active: false,
      Action: false
    }
    this.QuestionBankList = [];
    this.QuestionBankList.push(newItem);
    this.dataSource = new MatTableDataSource(this.QuestionBankList);
  }
  SaveAll() {
    var _toUpdate = this.QuestionBankList.filter(f => f.Action);
    this.RowToUpdate = _toUpdate.length;
    _toUpdate.forEach(question => {
      this.RowToUpdate--;
      this.UpdateOrSave(question);
    })
  }
  SaveRow(row) {
    this.RowToUpdate = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    if (row.Description.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter description", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //this.EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value
    if (row.EvaluationMasterId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("No Evaluation type Id selected.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let checkFilterString = "Description eq '" + globalconstants.encodeSpecialChars(row.Description) + "'";
    if (row.QuestionnaireTypeId > 0)
      checkFilterString += " and QuestionnaireTypeId eq " + row.QuestionnaireTypeId
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;//searchDifficultyLevelId
    }


    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.QuestionBankForUpdate = [];;
    this.QuestionBankData.CategoryId = row.CategoryId;
    this.QuestionBankData.SubCategoryId = row.SubCategoryId;
    this.QuestionBankData.ClassId = row.ClassId;
    this.QuestionBankData.ClassSubjectId = row.ClassSubjectId;
    this.QuestionBankData.Diagram = row.Diagram;
    this.QuestionBankData.DifficultyLevelId = row.DifficultyLevelId;
    this.QuestionBankData.LessonId = row.LessonId;
    this.QuestionBankData.Questions = row.Questions;
    this.QuestionBankData.OrgId = this.LoginUserDetail[0]['orgId'];

    this.QuestionBankForUpdate.push(this.QuestionBankData);
    //console.log('dta', this.QuestionBankForUpdate);
    if (this.QuestionBankForUpdate[0].QuestionBankId == 0)
      this.QuestionBankForUpdate[0].QuestionBankAnswerOptionParentId == null;

    if (this.QuestionBankForUpdate[0].QuestionBankId == 0) {
      this.QuestionBankForUpdate[0]["CreatedDate"] = new Date();
      this.QuestionBankForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
      this.QuestionBankForUpdate[0]["UpdatedDate"] = new Date();
      delete this.QuestionBankForUpdate[0]["UpdatedBy"];
      this.insert(row);
    }
    else {
      this.QuestionBankForUpdate[0]["UpdatedDate"] = new Date();
      delete this.QuestionBankForUpdate[0]["SubCategories"];
      delete this.QuestionBankForUpdate[0]["UpdatedBy"];
      this.update(row);
    }
  }
  RandomArr=[];
  GetRandomNumber(NoOfRandom) {
    this.RandomArr = [];
    while (this.RandomArr.length < NoOfRandom) {
      var r = Math.floor(Math.random() * 100) + 1;
      if (this.RandomArr.indexOf(r) === -1) this.RandomArr.push(r);
    }

  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    this.dataservice.postPatch('QuestionBanks', this.QuestionBankForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.QuestionBankId = data.QuestionBankId;
          row.Action = false;
          if (this.RowToUpdate == 0) {
            this.RowToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
        });
  }
  update(row) {
    //console.log("updating",this.QuestionBankForUpdate);
    this.dataservice.postPatch('QuestionBanks', this.QuestionBankForUpdate[0], this.QuestionBankForUpdate[0].QuestionBankId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          if (this.RowToUpdate == 0) {
            this.RowToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse()
          }
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  Lessons = [];
  Category = [];
  SubCategory = [];
  DifficultyLevels = [];
  GetQuestionBank() {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _classId = this.searchForm.get("searchClassId").value;
    if (_classId > 0)
      filterStr += " and ClassId eq " + _classId
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var _classSubjectId = this.searchForm.get("searchClassSubjectId").value;
    if (_classSubjectId > 0)
      filterStr += " and ClassSubjectId eq " + _classSubjectId
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class subject.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _CategoryId = this.searchForm.get("searchCategoryId").value;
    if (_CategoryId > 0)
      filterStr += " and CategoryId eq " + _CategoryId

    var _SubCategoryId = this.searchForm.get("searchSubCategoryId").value;
    if (_SubCategoryId > 0)
      filterStr += " and SubCategoryId eq " + _SubCategoryId

    var _LessonId = this.searchForm.get("searchLessonId").value;
    if (_LessonId > 0)
      filterStr += " and LessonId eq " + _LessonId

    let list: List = new List();
    list.fields = [
      'QuestionBankId',
      'ClassSubjectId',
      'CategoryId',
      'SubCategoryId',
      'LessonId',
      'DifficultyLevelId',
      'Questions',
      'Diagram',
      'Active'
    ];

    list.PageName = "QuestionBanks";

    list.filter = [filterStr];
    this.QuestionBankList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          data.value.forEach(item => {
            // var objCat = this.Category.filter(f => f.MasterDataId == item.CategoryId);
            // if (objCat.length > 0)
            //   item.CategoryName = objCat[0].MasterDataName;
            if (item.SubCategoryId > 0) {
              item.SubCategories = this.allMasterData.filter(f => f.ParentId == item.SubCategoryId);
              if (item.LessonId > 0)
                item.Lessons = this.allMasterData.filter(f => f.ParentId == item.LessonId);
              else
                item.Lessons = [];
            }
            else {
              item.SubCategories = [];
              item.Lessons = [];
            }

            item.Questions = globalconstants.decodeSpecialChars(item.Description);
            this.QuestionBankList.push(item);

            //return item;
          })
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }

        //this.QuestionBankList = this.QuestionBankList.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
        this.dataSource = new MatTableDataSource<IQuestionBank>(this.QuestionBankList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }
  GetEvaluationNames() {
    //debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'EvaluationMasterId',
      'EvaluationName',
      'ClassGroupId',
      'Description',
      'Duration',
      'AppendAnswer',
      'DisplayResult',
      'ProvideCertificate',
      'FullMark',
      'PassMark',
      'Active'
    ];

    list.PageName = "EvaluationMasters";

    list.filter = [filterStr];
    this.EvaluationNames = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.EvaluationNames = data.value.map(item => {
            return item;
          })
        }
        //this.loadingFalse();
      });

  }
  GetQuestionBankOption() {
    //debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'ParentId eq 0 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'QuestionBankAnswerOptionsId',
      'Title',
      'Description',
      'Point',
      'Correct',
      'ParentId',
      'Active',
    ];

    list.PageName = "QuestionBankOptions";

    list.filter = [filterStr];
    this.QuestionBankOptionList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.QuestionBankOptionList = data.value.map(item => {
            return item;
          })
        }
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

  GetMasterData() {
    debugger;
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.school.BOOKCATEGORY);
        this.DifficultyLevels = this.getDropDownData(globalconstants.MasterDefinitions.school.DIFFICULTYLEVEL);
        this.GetExams();
        this.GetClassSubjects();
        //this.GetQuestionBankOption();
        this.loading = false
      });
  }
  onBlur(row) {
    row.Action = true;
  }
  Sequencing(editedrow) {
    debugger;
    editedrow.Action = true;
    var editedrowindx = this.QuestionBankList.findIndex(x => x.QuestionBankId == editedrow.QuestionBankId);
    //var numbering = 0;
    this.QuestionBankList.forEach((listrow, indx) => {
      if (indx > editedrowindx) {
        //numbering++;
        //listrow.DisplayOrder = editedrow.DisplayOrder + numbering;
        listrow.Action = true;
      }
    })
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    if (row.CategoryId > 0)
      row.SubCategories = this.allMasterData.filter(f => f.ParentId == row.CategoryId);
    else
      row.SubCategories = [];
  }
  SubCategoryChanged(row) {
    row.Action = true;
    if (row.SubCategoryId > 0)
      row.Lessons = this.allMasterData.filter(f => f.ParentId == row.SubCategoryId);
    else
      row.Lessons = [];
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
    return this.contentservice.getDropDownData(dropdowntype, this.tokenstorage, this.allMasterData);
  }

}

export interface IQuestionBank {
  QuestionBankId: number;
  ClassId: number;
  ClassSubjectId: number;
  CategoryId: number;
  SubCategoryId: number;
  LessonId: number;
  DifficultyLevelId: number;
  Questions: string;
  Diagram: string;
  Active: boolean;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}



