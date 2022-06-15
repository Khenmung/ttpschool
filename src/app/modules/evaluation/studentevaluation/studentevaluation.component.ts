import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
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
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  EvaluationUpdatable: any = null;
  AlreadyAnswered = false;
  RowsToUpdate = -1;
  EvaluationStarted = false;
  EvaluationSubmitted = false;
  boolSaveAsDraft = false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ClassGroups = [];
  ClassGroupMappings = [];
  EvaluationExamMaps = [];
  ClassSubjects = [];
  Ratings = [];
  ExamModes = [];
  SelectedApplicationId = 0;
  StudentId = 0;
  StudentClassId = 0;
  ClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  RelevantEvaluationListForSelectedStudent = [];
  StudentEvaluationList: any[] = [];
  SelectedBatchId = 0;
  QuestionnaireTypes = [];
  Sections = [];
  Classes = [];
  ClassEvaluations = [];
  AssessmentTypeDatasource: MatTableDataSource<any>;
  RatingOptions = [];
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  EvaluationMaster = [];
  Exams = [];
  ExamNames = [];
  SelectedClassSubjects = [];
  StudentClasses = [];
  Students = [];
  EvaluationPlanColumns = [
    'EvaluationName',
    'ExamName',
    'Action1'
  ];
  ExamDurationMinutes = 0;
  ClassEvaluationOptionList = [];
  filteredStudents: Observable<IStudent[]>;
  StudentEvaluationData = {
    StudentEvaluationId: 0,
    ClassEvaluationId: 0,
    RatingId: 0,
    Detail: '',
    EvaluationMasterId: 0,
    ExamId: 0,
    StudentClassId: 0,
    StudentId: 0,
    OrgId: 0,
    Active: 0
  };
  ResultDetail = {
    TotalMarks: 0,
    Percentage: 0,
    StudentClassId: 0,
    ExamId: 0
  }
  StudentEvaluationForUpdate = [];
  displayedColumns = [
    //'AutoId',
    'Description',
    //'AnswerOptionsId',
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
      searchStudentName: [0],
      searchEvaluationMasterId: [0],
      searchSubjectId: [0],
      //searchExamId: [0]
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
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.contentservice.GetClassGroupMapping(this.LoginUserDetail[0]["orgId"], 1)
          .subscribe((data: any) => {
            this.ClassGroupMappings = [...data.value];
          })
        this.GetEvaluationNames();
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
  GetSubjects(val) {
    debugger;
    this.ClassId = this.searchForm.get("searchStudentName").value.ClassId;
    this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.ClassId);
  }
  UpdateAnswers(row, item, event, i) {
    debugger;
    var exItem = row.StudentEvaluationAnswers.filter(f => f.StudentEvaluationAnswerId == item.StudentEvaluationAnswerId);
    if (exItem.length > 0) {
      if (event.checked)
        exItem[0].Active = 1;
      else
        exItem[0].Active = 0;
    }
    else {
      item.Active = 1;
      row.StudentEvaluationAnswers.push({
        Active: 1,
        StudentEvaluationAnswerId: 0,
        StudentEvaluationResultId: row.StudentEvaluationResultId,
        ClassEvaluationAnswerOptionsId: item.ClassEvaluationAnswerOptionsId
      });
    }
    item.checked = true;
    row.Action = true;
  }
  UpdateRadio(row, item) {
    //row.StudentEvaluationAnswers = [];
    debugger;
    var exItem = row.StudentEvaluationAnswers.filter(f => f.ClassEvaluationAnswerOptionsId == item.ClassEvaluationAnswerOptionsId);
    if (exItem.length > 0) {
      row.StudentEvaluationAnswers.forEach(answer => {
        if (item.ClassEvaluationAnswerOptionsId == answer.ClassEvaluationAnswerOptionsId) {
          answer.Active = 1;
        }
        else
          answer.Active = 0;
      })
    }
    else {
      row.StudentEvaluationAnswers.forEach(answer => {
        answer.Active = 0;
      })
      row.StudentEvaluationAnswers.push(
        {
          Active: 1,
          StudentEvaluationAnswerId: 0,
          StudentEvaluationResultId: row.StudentEvaluationResultId,
          ClassEvaluationAnswerOptionsId: item.ClassEvaluationAnswerOptionsId
        })

    }
    item.checked = true;
    row.Action = true;
  }
  SaveAsDraft() {
    this.RowsToUpdate = this.StudentEvaluationList.length;
    this.boolSaveAsDraft = true;
    this.EvaluationSubmitted = false;
    //clearInterval(this.interval);
    //console.log("this.StudentEvaluationList", this.StudentEvaluationList);
    this.StudentEvaluationList.forEach(question => {
      this.RowsToUpdate--;
      this.UpdateOrSave(question);
    })
  }
  SubmitEvaluation() {
    this.RowsToUpdate = this.StudentEvaluationList.length;
    this.EvaluationSubmitted = true;
    this.boolSaveAsDraft = false;
    clearInterval(this.interval);
    this.StudentEvaluationForUpdate = [];
    this.StudentEvaluationList.forEach(question => {
      this.RowsToUpdate--;
      this.UpdateOrSave(question);
    })    
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    let checkFilterString = "ClassEvaluationId eq " + row.ClassEvaluationId;
    if (!this.EvaluationUpdatable) {
      checkFilterString += " and EvaluationExamMapId eq " + row.EvaluationExamMapId +
        " and StudentClassId eq " + this.StudentClassId
    }
    else {
      checkFilterString += " and StudentId eq " + this.StudentId;
    }


    if (row.StudentEvaluationResultId > 0)
      checkFilterString += " and StudentEvaluationResultId ne " + row.StudentEvaluationResultId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["StudentEvaluationResultId"];
    list.PageName = "StudentEvaluationResults";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.PageLoading = false;
          this.EvaluationSubmitted = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
          
          var _toappend = '', _answerText = '', _history = '', _studentClassId = 0;
          if (this.EvaluationUpdatable) {
            if (this.EvaluationSubmitted && !this.boolSaveAsDraft) {
              _history = row.AnswerText.length == 0 ? row.History : row.History + "<br><br>" + row.AnswerText + "<br>" + _toappend + "<br><br>"
              _answerText = '';
              _toappend = moment().format('DD/MM/YYYY');
            }
            else {
              _history = row.History;
              _answerText = row.AnswerText;
            }
            _studentClassId = 0;
          }
          else {
            _studentClassId = row.StudentClassId;
            _history = '';
            _answerText = row.AnswerText;
          }

          this.StudentEvaluationForUpdate.push(
            {
              StudentEvaluationResultId: row.StudentEvaluationResultId,
              StudentClassId: _studentClassId,
              StudentId: row.StudentId,
              ClassEvaluationId: row.ClassEvaluationId,
              AnswerText: _answerText,
              History: _history,
              EvaluationExamMapId: row.EvaluationExamMapId,
              StudentEvaluationAnswers: row.StudentEvaluationAnswers,
              Active: row.Active,
              OrgId: this.LoginUserDetail[0]["orgId"]
            });
          if (this.StudentEvaluationForUpdate.length == this.StudentEvaluationList.length) {

            if (this.StudentEvaluationForUpdate[0].StudentEvaluationResultId == 0) {
              this.StudentEvaluationForUpdate[0]["CreatedDate"] = new Date();
              this.StudentEvaluationForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
              delete this.StudentEvaluationForUpdate[0]["UpdatedDate"];
              delete this.StudentEvaluationForUpdate[0]["UpdatedBy"];
              console.log("this.StudentEvaluationForUpdate[0] insert", this.StudentEvaluationForUpdate[0])
              this.insert(row);
            }
            else {
              console.log("this.StudentEvaluationForUpdate[0] update", this.StudentEvaluationForUpdate[0])
              this.StudentEvaluationForUpdate[0]["UpdatedDate"] = new Date();
              this.StudentEvaluationForUpdate[0]["UpdatedBy"];
              delete this.StudentEvaluationForUpdate[0]["CreatedDate"];
              delete this.StudentEvaluationForUpdate[0]["CreatedBy"];
              this.insert(row);
            }
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {
    this.dataservice.postPatch('StudentEvaluationResults', this.StudentEvaluationForUpdate, 0, 'post')
      .subscribe(
        (data: any) => {
          row.StudentEvaluationResultId = data.StudentEvaluationResultId;
          row.Action = false;
          if (this.RowsToUpdate == 0) {
            this.RowsToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse();
          }
        }, error => {
          this.EvaluationSubmitted = false;

          this.loadingFalse();
          console.log("error on student evaluation insert", error);
        });
  }
  update(row) {
    //console.log("updating",this.StudentEvaluationForUpdate);
    this.dataservice.postPatch('StudentEvaluationResults', this.StudentEvaluationForUpdate[0], this.StudentEvaluationForUpdate[0].StudentEvaluationResultId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.EvaluationSubmitted = false;
          //console.log("data update", data.value);
          //this.StartEvaluation(row);
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  interval;
  startTimer() {
    this.ExamDurationMinutes *= 60;
    this.interval = setInterval(() => {
      if (this.ExamDurationMinutes > 0) {
        this.ExamDurationMinutes--;
      }
      else if (this.ExamDurationMinutes == 0) {
        clearInterval(this.interval);
        this.SubmitEvaluation();
      }
    }, 1000)
  }

  StartEvaluation(row) {
    debugger;
    this.loading = true;
    //this.AlreadyAnswered=false;
    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.StudentClassId = this.searchForm.get("searchStudentName").value.StudentClassId;
    this.StudentId = this.searchForm.get("searchStudentName").value.StudentId;
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    if (this.EvaluationUpdatable)
      filterStr += ' and StudentId eq ' + this.StudentId
    else {
      filterStr += ' and StudentClassId eq ' + this.StudentClassId
      filterStr += ' and EvaluationExamMapId eq ' + row.EvaluationExamMapId
    }

    this.RelevantEvaluationListForSelectedStudent.forEach(mapping => {
      if (mapping.EvaluationExamMapId != row.EvaluationExamMapId)
        mapping.Action = false;
    })
    var _classEvaluations = this.ClassEvaluations.filter(f => f.EvaluationMasterId == row.EvaluationMasterId);


    let list: List = new List();
    list.fields = [
      'StudentEvaluationResultId',
      'StudentClassId',
      'StudentId',
      'ClassEvaluationId',
      'EvaluationExamMapId',
      'AnswerText',
      'History',
      'Active'
    ];

    list.PageName = "StudentEvaluationResults";
    list.lookupFields = ["StudentEvaluationAnswers($select=StudentEvaluationAnswerId,StudentEvaluationResultId,ClassEvaluationAnswerOptionsId,Active)"];

    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger
        //console.log("data.value", data.value);
        if (!this.EvaluationUpdatable && this.ExamDurationMinutes > 0 && data.value.length == 0) {
          this.AlreadyAnswered = false;
          this.startTimer();
        }
        else if (data.value.length > 0 && !this.EvaluationUpdatable) {
          this.AlreadyAnswered = true;
        }

        var item, indx = 0, SlNo = '';
        _classEvaluations.forEach((clseval, index) => {

          if (clseval.QuestionnaireType.toLowerCase() == 'questionnaire') {
            indx++;
            SlNo = indx + "";
          }
          else
            SlNo = '';

          var existing = data.value.filter(f => f.ClassEvaluationId == clseval.ClassEvaluationId);

          if (existing.length > 0) {
            clseval.ClassEvaluationOptions.forEach(cls => {
              var selectedorNot = existing[0].StudentEvaluationAnswers.filter(stud => stud.ClassEvaluationAnswerOptionsId == cls.ClassEvaluationAnswerOptionsId)
              if (selectedorNot.length > 0) {
                selectedorNot.forEach(answer => {
                  if (answer.Active == 1)
                    cls.checked = true;
                  cls.StudentEvaluationAnswerId = answer.StudentEvaluationAnswerId
                })
              }
              else {
                cls.checked = false;
                cls.StudentEvaluationAnswerId = 0;
              }
            })
            item = {
              AutoId: SlNo,
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentEvaluationAnswers: existing[0].StudentEvaluationAnswers,
              StudentClassId: this.StudentClassId,
              StudentId: this.StudentId,
              CatSequence: clseval.DisplayOrder,
              QuestionnaireType: clseval.QuestionnaireType,
              ClassEvaluationAnswerOptionParentId: clseval.ClassEvaluationAnswerOptionParentId,
              EvaluationExamMapId: existing[0].EvaluationExamMapId,
              Description: clseval.Description,
              History: existing[0].History == null ? '' : existing[0].History,
              AnswerText: existing[0].AnswerText,
              StudentEvaluationResultId: existing[0].StudentEvaluationResultId,
              ClassEvaluationId: clseval.ClassEvaluationId,
              Active: existing[0].Active,
              EvaluationMasterId: row.EvaluationMasterId,
              MultipleAnswer: clseval.MultipleAnswer,
            }
          }
          else {
            clseval.ClassEvaluationOptions.forEach(f => f.checked = false);
            item = {
              AutoId: SlNo,
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentClassId: this.StudentClassId,
              StudentId: this.StudentId,
              CatSequence: clseval.DisplayOrder,
              QuestionnaireType: clseval.QuestionnaireType,
              AnswerOptionsId: 0,
              Description: clseval.Description,
              AnswerText: '',
              History: '',
              StudentEvaluationResultId: 0,
              ClassEvaluationAnswerOptionParentId: clseval.ClassEvaluationAnswerOptionParentId,
              EvaluationExamMapId: row.EvaluationExamMapId,
              ClassEvaluationId: clseval.ClassEvaluationId,
              Active: 0,
              EvaluationMasterId: row.EvaluationMasterId,
              MultipleAnswer: clseval.MultipleAnswer,
              StudentEvaluationAnswers: []
            }
          }
          this.StudentEvaluationList.push(JSON.parse(JSON.stringify(item)));
        })
        //console.log("1this.StudentEvaluationList", this.StudentEvaluationList)
        //var firstrow =[];
        //this.StudentEvaluationList = this.StudentEvaluationList.sort((a,b)=>a.DisplayOrder - b.DisplayOrder);
        this.EvaluationStarted = true;
        this.dataSource = new MatTableDataSource<IStudentEvaluation>(this.StudentEvaluationList);
        this.dataSource.paginator = this.paginator;
        this.loadingFalse();
      });

  }
  GetExams() {

    var _onLineExamModeId = this.ExamModes.filter(f => f.MasterDataName.toLowerCase() == 'online')[0].MasterDataId;
    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
      ' and BatchId eq ' + this.SelectedBatchId +
      ' and ExamModeId eq ' + _onLineExamModeId;

    let list: List = new List();
    this.Exams = [];
    list.fields = ["ExamId", "ExamNameId"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          var _examName = ''
          if (obj.length > 0) {
            _examName = obj[0].MasterDataName;
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: _examName
            })
          }
        })
        this.contentservice.GetEvaluationExamMaps(this.LoginUserDetail[0]["orgId"], 1)
          .subscribe((data: any) => {
            data.value.forEach(m => {

              let EvaluationObj = this.EvaluationMaster.filter(f => f.EvaluationMasterId == m.EvaluationMasterId);
              if (EvaluationObj.length > 0) {
                m.EvaluationName = EvaluationObj[0].EvaluationName;
                m.Duration = EvaluationObj[0].Duration;

                var _clsObj = this.ClassGroups.filter(f => f.MasterDataId == m.ClassGroupId);
                if (_clsObj.length > 0)
                  m.ClassGroupName = _clsObj[0].MasterDataName;
                else
                  m.ClassGroupName = '';
                m.ClassGroupId = EvaluationObj[0].ClassGroupId;
                var _examObj = this.Exams.filter(f => f.ExamId == m.ExamId);
                if (_examObj.length > 0)
                  m.ExamName = _examObj[0].ExamName
                else
                  m.ExamName = '';
                m.Action1 = true;
                this.EvaluationExamMaps.push(m);
              }
            })
            this.loading = false; this.PageLoading = false;
          })

      })
  }
  GetClassSubjects() {
    let list = new List();
    list.PageName = "ClassSubjects";
    list.fields = ["ClassSubjectId,ClassId,SubjectId"];
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
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.QuestionnaireTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
        this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP);
        this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.ExamModes = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMMODE);
        this.GetExams();
        this.GetEvaluationOption();
  
      });
  }
  onBlur(row) {
    row.Action = true;
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    var item = this.StudentEvaluationList.filter(f => f.StudentEvaluationId == row.StudentEvaluationId);
    item[0].SubCategories = this.allMasterData.filter(f => f.ParentId == row.CategoryId);

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
  GetEvaluationNames() {
    //debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'EvaluationMasterId',
      'EvaluationName',
      'Description',
      'Duration',
      'ClassGroupId',
      'DisplayResult',
      'AppendAnswer',
      'ProvideCertificate',
      'FullMark',
      'PassMark',
      'Active'
    ];

    list.PageName = "EvaluationMasters";

    list.filter = [filterStr];
    this.EvaluationMaster = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.EvaluationMaster = [...data.value];
        this.loadingFalse();
      });

  }
  GetAttribute() {
    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;

    var _obj = this.EvaluationMaster.filter(f => f.EvaluationMasterId == _EvaluationMasterId)
    if (_obj.length > 0) {
      this.EvaluationUpdatable = _obj[0].AppendAnswer;
      this.ExamDurationMinutes = _obj[0].Duration;
    }
  }
  GetEvaluationMapping() {
    debugger;
    this.loading = true;
    var __classGroupIdsForThisStudent = [];
    var studentobj = this.searchForm.get("searchStudentName").value;
    var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;
    if (studentobj.ClassId == undefined) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      __classGroupIdsForThisStudent = this.ClassGroupMappings.filter(f => f.ClassId == studentobj.ClassId);
    }
    if (_EvaluationMasterId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select evaluation name.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var _classGroupIdObj = [];
    if (this.EvaluationUpdatable) {
      _classGroupIdObj = this.EvaluationExamMaps.filter(f => f.EvaluationMasterId == _EvaluationMasterId);
    }
    else {
      _classGroupIdObj = this.EvaluationExamMaps.filter(f =>
        f.EvaluationMasterId == _EvaluationMasterId
        && __classGroupIdsForThisStudent.filter(g => g.ClassGroupId == f.ClassGroupId)[0].ClassGroupId);
    }
    this.RelevantEvaluationListForSelectedStudent = [];
    //var __classGroupId = 0;
    if (_classGroupIdObj.length > 0) {
      this.RelevantEvaluationListForSelectedStudent = [..._classGroupIdObj];
      //__classGroupId = _classGroupIdObj[0].ClassGroupId;
    }
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("No class group/evaluation defined for this class.", globalconstants.ActionText, globalconstants.RedBackground);

    }

    this.EvaluationStarted = false;
    this.EvaluationSubmitted = false;
    this.AssessmentTypeDatasource = new MatTableDataSource<any>(this.RelevantEvaluationListForSelectedStudent);

    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    this.dataSource.paginator = this.paginator;

    // var selectedEvaluationType = this.EvaluationMaster.filter(f => f.EvaluationMasterId == this.searchForm.get("searchEvaluationMasterId").value)
    // if (selectedEvaluationType.length > 0) {

    //   this.EvaluationUpdatable = selectedEvaluationType[0].AppendAnswer;
    //   this.ExamDurationMinutes = selectedEvaluationType[0].Duration;
    // }
    this.loading = false;
    this.PageLoading = false;

  }
  GetEvaluationOption() {
    let list: List = new List();
    list.fields = [
      'ClassEvaluationAnswerOptionsId',
      'Title',
      'Value',
      'Point',
      'Correct',
      'ParentId',
      'ClassEvaluationId',
      'Active',
    ];

    list.PageName = "ClassEvaluationOptions";
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.ClassEvaluationOptionList = [];
    this.dataSource = new MatTableDataSource<any>([]);
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassEvaluationOptionList = data.value.map(item => {
            item.Active = 0;
            item.StudentEvaluationAnswerId = 0;
            return item;
          })
          this.GetClassEvaluations();
        }
        else {
          this.contentservice.openSnackBar("No answer option found.", globalconstants.ActionText, globalconstants.BlueBackground);
        }
        
        //this.loadingFalse();
      });

  }
  GetClassEvaluations() {

    let list: List = new List();
    list.fields = [
      'ClassEvaluationId',
      'QuestionnaireTypeId',
      'EvaluationMasterId',
      'DisplayOrder',
      'Description',
      'ClassEvaluationAnswerOptionParentId',
      'MultipleAnswer',
    ];

    list.PageName = "ClassEvaluations";
    list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassEvaluations = data.value.map(clseval => {
            clseval.QuestionnaireType = this.QuestionnaireTypes.filter(f => f.MasterDataId == clseval.QuestionnaireTypeId)[0].MasterDataName;
            clseval.ClassEvaluationOptions = this.ClassEvaluationOptionList.filter(f => f.ParentId == clseval.ClassEvaluationAnswerOptionParentId)
            return clseval;
          })
          this.ClassEvaluations = this.ClassEvaluations.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
        }
        //      console.log("this.ClassEvaluations", this.ClassEvaluations)
        this.loadingFalse();
      })
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
              _RollNo = studentclassobj[0].RollNo;

              if (_SectionObj.length > 0)
                _section = _SectionObj[0].MasterDataName;
            }
            _name = student.FirstName + " " + student.LastName;
            var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo + "-" + student.ContactNo;
            this.Students.push({
              StudentClassId: _studentClassId,
              StudentId: student.StudentId,
              ClassId: _classId,
              Name: _fullDescription,
            });

          })
        }
        this.loading = false; this.PageLoading = false;
      })
  }
}
export interface IStudentEvaluation {
  StudentEvaluationId: number;
  ClassEvaluationId: number;
  EvaluationClassSubjectMapId: number;
  ClassEvaluationAnswerOptionParentId: number;
  StudentEvaluationResultId: number;
  AnswerText: string;
  History: string;
  StudentClassId: number;
  StudentId: number;
  EvaluationMasterId: number;
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}


