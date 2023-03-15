import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
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
import { SwUpdate } from '@angular/service-worker';
@Component({
  selector: 'app-StudentEvaluation',
  templateUrl: './studentevaluation.component.html',
  styleUrls: ['./studentevaluation.component.scss']
})
export class StudentEvaluationComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  //EvaluationUpdatable: any = null;
  //AlreadyAnswered = false;
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
  //ExamModes = [];
  SelectedApplicationId = 0;
  StudentId = 0;
  StudentClassId = 0;
  ClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  RelevantEvaluationListForSelectedStudent = [];
  StudentEvaluationList: any[] = [];
  SelectedBatchId = 0;SubOrgId = 0;
  QuestionnaireTypes = [];
  Sections = [];
  Classes = [];
  ClassEvaluations = [];
  AssessmentTypeDatasource: MatTableDataSource<any>;
  RatingOptions = [];
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  EvaluationMaster = [];
  StudentList = [];
  Exams = [];
  ExamNames = [];
  SelectedClassSubjects = [];
  StudentClasses = [];
  Students = [];
  EvaluationPlanColumns = [
    'EvaluationName',
    'ClassGroup',
    'ExamName',
    'Action1'
  ];
  //ExamDurationMinutes = 0;
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
    OrgId: 0,SubOrgId: 0,
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
  searchForm: UntypedFormGroup;
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    debugger;
    this.searchForm = this.fb.group({
      searchStudentName: [0],
      searchClassId: [0],
      searchSectionId: [0]
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
        this.StudentId = +localStorage.getItem('studentId');
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.SubOrgId = +this.tokenstorage.getSubOrgId();
        this.StandardFilter = globalconstants.getOrgSubOrgFilter(this.LoginUserDetail,this.SubOrgId);
        this.contentservice.GetClassGroupMapping(this.LoginUserDetail[0]["orgId"], 1)
          .subscribe((data: any) => {
            this.ClassGroupMappings = [...data.value];
          })

        this.GetEvaluationNames();
        this.GetMasterData();
        this.GetStudents();

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
    this.ClassId = this.searchForm.get("searchClassId").value.ClassId;
    this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.ClassId);
  }
  UpdateAnswers(row, item, event, i) {
    debugger;
    var exItem = row.StudentEvaluationAnswers.filter(f => f.ClassEvaluationAnswerOptionsId == item.ClassEvaluationAnswerOptionsId);
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
    this.StudentEvaluationForUpdate = [];
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
    var _sectionId= this.searchForm.get("searchSectionId").value;
    let checkFilterString = "ClassEvaluationId eq " + row.ClassEvaluationId;
    if (!row.Updatable) {
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
          //row.EvaluationSubmitted = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.SubOrgId = +this.tokenstorage.getSubOrgId();

          var _toappend = '', _answerText = '', _history = '', _studentClassId = 0;
          _answerText = row.AnswerText;
          if (row.Updatable) {
            if (this.EvaluationSubmitted && !this.boolSaveAsDraft) {
              var _borderwidth = "border-width:0px 1px 1px 1px;"
              if (row.History == "") {
                _borderwidth = "border-width:1px 1px 1px 1px;"
              }

              _toappend = moment().format('DD/MM/YYYY');

              _history = row.AnswerText.length == 0 ? row.History : row.History + "<div style='border-style:solid; " + _borderwidth + "border-color:lightgray;padding:15px'>" +
                _answerText + "<br>" + _toappend + "</div>"
              _answerText = '';
            }
            else {
              _history = row.History;
              //_answerText = row.AnswerText;
            }
            //_studentClassId = 0;
          }
          else {
            //_studentClassId = row.StudentClassId;
            _history = '';
            //_answerText = row.AnswerText;
          }
          _studentClassId = row.StudentClassId;

          this.StudentEvaluationForUpdate.push(
            {
              StudentEvaluationResultId: row.StudentEvaluationResultId,
              StudentClassId: _studentClassId,
              StudentId: row.StudentId,
              ClassId: this.ClassId,
              SectionId:_sectionId,
              ClassEvaluationId: row.ClassEvaluationId,
              AnswerText: _answerText,
              History: _history,
              EvaluationExamMapId: row.EvaluationExamMapId,
              StudentEvaluationAnswers: row.StudentEvaluationAnswers,
              Active: 1,
              Submitted: this.EvaluationSubmitted,
              OrgId: this.LoginUserDetail[0]["orgId"]
            });

          var _lastIndex = this.StudentEvaluationForUpdate.length - 1;
          if (this.StudentEvaluationForUpdate[_lastIndex].StudentEvaluationResultId == 0) {
            this.StudentEvaluationForUpdate[_lastIndex]["CreatedDate"] = new Date();
            this.StudentEvaluationForUpdate[_lastIndex]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.StudentEvaluationForUpdate[_lastIndex]["UpdatedDate"];
            delete this.StudentEvaluationForUpdate[_lastIndex]["UpdatedBy"];
            //console.log("this.StudentEvaluationForUpdate[0] insert", this.StudentEvaluationForUpdate[0])
            //this.insert(row);
          }
          else {
            //console.log("this.StudentEvaluationForUpdate[0] update", this.StudentEvaluationForUpdate[0])
            this.StudentEvaluationForUpdate[_lastIndex]["UpdatedDate"] = new Date();
            this.StudentEvaluationForUpdate[_lastIndex]["UpdatedBy"];
            delete this.StudentEvaluationForUpdate[_lastIndex]["CreatedDate"];
            delete this.StudentEvaluationForUpdate[_lastIndex]["CreatedBy"];
            //this.insert(row);
          }
          if (this.StudentEvaluationForUpdate.length == this.StudentEvaluationList.length) {
            this.insert(row);
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
          if (this.RowsToUpdate == 0) {
            this.RowsToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.loadingFalse();
            this.StudentEvaluationList = [];
            this.RelevantEvaluationListForSelectedStudent = [];
            this.AssessmentTypeDatasource = new MatTableDataSource<any>(this.RelevantEvaluationListForSelectedStudent);
            this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
          }
          row.StudentEvaluationResultId = data.StudentEvaluationResultId;
          row.Action = false;

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
          this.StudentEvaluationList = [];
          this.RelevantEvaluationListForSelectedStudent = [];
          this.AssessmentTypeDatasource = new MatTableDataSource<any>(this.RelevantEvaluationListForSelectedStudent);
          this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  interval;
  startTimer(row) {
    //  row.tempDuration = row.Duration;
    row.TempDuration *= 60;
    this.interval = setInterval(() => {
      if (row.TempDuration > 0) {
        row.TempDuration--;
      }
      else if (row.TempDuration == 0) {
        clearInterval(this.interval);
        this.SubmitEvaluation();
      }
    }, 1000)
  }

  StartEvaluation(row) {
    debugger;
    this.loading = true;
    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.SubOrgId = +this.tokenstorage.getSubOrgId();

    var objstudent = this.searchForm.get("searchStudentName").value;
    this.ClassId = this.searchForm.get("searchClassId").value;
    this.StudentClassId = objstudent.StudentClassId;
    this.StudentId = objstudent.StudentId;

    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and StudentClassId eq ' + this.StudentClassId
    filterStr += ' and EvaluationExamMapId eq ' + row.EvaluationExamMapId

    this.RelevantEvaluationListForSelectedStudent.forEach(mapping => {
      if (mapping.EvaluationExamMapId != row.EvaluationExamMapId)
        mapping.Action = false;
    })
    var _classEvaluations = this.ClassEvaluations.filter(f => f.EvaluationMasterId == row.EvaluationMasterId
      && (f.ExamId == null || f.ExamId == 0 || f.ExamId == row.ExamId));
    //delete row all except selected one
    for (var i = 0; i < this.RelevantEvaluationListForSelectedStudent.length; i++) {
      if (this.RelevantEvaluationListForSelectedStudent[i].EvaluationExamMapId != row.EvaluationExamMapId) {
        this.RelevantEvaluationListForSelectedStudent.splice(i, 1);
        i--;
      }
    }
    this.AssessmentTypeDatasource = new MatTableDataSource<any>(this.RelevantEvaluationListForSelectedStudent);

    let list: List = new List();
    list.fields = [
      'StudentEvaluationResultId',
      'StudentClassId',
      'StudentId',
      'ClassEvaluationId',
      'EvaluationExamMapId',
      'AnswerText',
      'History',
      'Submitted',
      'Active'
    ];

    list.PageName = "StudentEvaluationResults";
    list.lookupFields = ["StudentEvaluationAnswers($select=StudentEvaluationAnswerId,StudentEvaluationResultId,ClassEvaluationAnswerOptionsId,Active)"];

    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger
        if (data.value.length > 0) {
          row.Submitted = data.value[0].Submitted;
        }
        if (!row.Updatable && row.Duration > 0 && data.value.length == 0) {
          if (row.TempDuration == undefined || row.TempDuration==0)
            row.TempDuration = row.Duration;
          this.startTimer(row);
        }

        var item, indx = 0, SlNo = '';
        _classEvaluations.forEach((clseval, index) => {

          if (clseval.QuestionnaireType.toLowerCase() == 'questionnaire') {
            indx+=1;
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
                  cls.Title = globalconstants.decodeSpecialChars(cls.Title);
                  cls.StudentEvaluationAnswerId = answer.StudentEvaluationAnswerId
                })
              }
              else {
                cls.checked = false;
                cls.StudentEvaluationAnswerId = 0;
              }
            })
            // var _history = ''
            // if (existing[0].History == null || existing[0].History.length == 0 || existing[0].History=='<pre></pre>')
            //   _history = '';
            // else
            // {
            //   _history = "<pre>" + globalconstants.decodeSpecialChars(existing[0].History) + "</pre>"
            //   //_history = "<pre>" + globalconstants.decodeSpecialChars(existing[0].History) + "</pre>"
            // } 
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
              Updatable: row.Updatable,
              Description: globalconstants.decodeSpecialChars(clseval.Description),
              History: existing[0].History,
              AnswerText: globalconstants.decodeSpecialChars(existing[0].AnswerText),
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
              Description: globalconstants.decodeSpecialChars(clseval.Description),
              AnswerText: '',
              History: '',
              Updatable: row.Updatable,
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
        //console.log("this.StudentEvaluationList", this.StudentEvaluationList);
        row.EvaluationStarted = true;
        this.dataSource = new MatTableDataSource<IStudentEvaluation>(this.StudentEvaluationList);
        this.dataSource.paginator = this.paginator;
        //this.SaveAsDraft();
        this.loadingFalse();
      });

  }
  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
      ' and BatchId eq ' + this.SelectedBatchId //+


    let list: List = new List();
    this.Exams = [];
    list.fields = ["ExamId", "ExamNameId", "ClassGroupId"];
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
              ExamName: _examName,
              ClassGroupId: e.ClassGroupId
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
                m.TempDuration = EvaluationObj[0].Duration;
                m.Updatable = EvaluationObj[0].AppendAnswer;

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
            this.loading = false;
            this.PageLoading = false;
          })

      })
  }
  GetClassSubjects() {
    let list = new List();
    list.PageName = "ClassSubjects";
    list.fields = ["ClassSubjectId,ClassId,SubjectId"];
    //list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];
    list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and BatchId eq " + this.SelectedBatchId + " and Active eq 1"];
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

    this.allMasterData = this.tokenstorage.getMasterData();
    this.QuestionnaireTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
    //this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP);
    this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      })
    this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);

    this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
      this.Classes = data.value;
    });

    this.GetExams();
    this.GetEvaluationOption();

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
  GetEvaluationNames() {
    //debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.SubOrgId = +this.tokenstorage.getSubOrgId();
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
      'Confidential',
      'FullMark',
      'PassMark',
      'Active'
    ];

    list.PageName = "EvaluationMasters";

    list.filter = [filterStr];
    this.EvaluationMaster = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        var result = [...data.value];
        this.EvaluationMaster = this.contentservice.getConfidentialData(this.tokenstorage, result, "EvaluationName");
        this.loadingFalse();
      });

  }
  // GetAttribute() {
  //   var _EvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;

  //   var _obj = this.EvaluationMaster.filter(f => f.EvaluationMasterId == _EvaluationMasterId)
  //   if (_obj.length > 0) {
  //     this.EvaluationUpdatable = _obj[0].AppendAnswer;
  //     this.ExamDurationMinutes = _obj[0].Duration;
  //   }
  // }
  StudentSubmittedEvaluations = [];
  CheckIfEvaluationWasSubmitted() {
    var studentobj = this.searchForm.get("searchStudentName").value;
    var _studentClassId = studentobj.StudentClassId;
    var _filter = 'OrgId eq ' + this.LoginUserDetail[0]['orgId'] +
      ' and StudentClassId eq ' + _studentClassId +
      //' and Submitted eq true' +
      ' and Active eq 1';

    let list: List = new List();
    list.fields = [
      'StudentEvaluationResultId',
      // 'StudentClassId',
      // 'StudentId',
      // 'ClassEvaluationId',
      'EvaluationExamMapId',
      'Submitted',
      // 'Active'
    ];

    list.PageName = "StudentEvaluationResults";
    list.filter = [_filter];
    return this.dataservice.get(list);
  }
  GetEvaluationMapping() {
    debugger;
    this.loading = true;
    var studentobj = this.searchForm.get("searchStudentName").value;
    if (studentobj.ClassId == undefined) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _classgroupsOfSelectedStudent = this.ClassGroupMappings.filter(f => f.ClassId == studentobj.ClassId)
    var _EvaluationExamMapSelectedStudentObj = [];

    _EvaluationExamMapSelectedStudentObj = this.EvaluationExamMaps.filter(f => _classgroupsOfSelectedStudent.filter(s => s.ClassGroupId == f.ClassGroupId).length > 0);
    this.CheckIfEvaluationWasSubmitted()
      .subscribe((data: any) => {
        this.StudentSubmittedEvaluations = [...data.value];
        this.RelevantEvaluationListForSelectedStudent = [];
        if (_EvaluationExamMapSelectedStudentObj.length > 0) {
          _EvaluationExamMapSelectedStudentObj.forEach(m => {
            m.ClassGroup = this.ClassGroups.filter(f => f.ClassGroupId == m.ClassGroupId)[0].GroupName;
            m.EvaluationStarted = false;
            var existing = this.StudentSubmittedEvaluations.filter(f => f.EvaluationExamMapId == m.EvaluationExamMapId)
            if (existing.length > 0) {
              if (!existing[0].Submitted || m.Updatable) {
                m.StudentEvaluationResultId = existing[0].StudentEvaluationResultId
                this.RelevantEvaluationListForSelectedStudent.push(m);
              }
            }
            else {
              m.StudentEvaluationResultId = 0;
              this.RelevantEvaluationListForSelectedStudent.push(m);
            }
          });
        }
        else {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar("No class group/evaluation defined for this class.", globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }
        if (this.RelevantEvaluationListForSelectedStudent.length == 0) {
          this.contentservice.openSnackBar("No pending exam found for this student.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        //console.log("this.RelevantEvaluationListForSelectedStudent", this.RelevantEvaluationListForSelectedStudent);
        this.AssessmentTypeDatasource = new MatTableDataSource<any>(this.RelevantEvaluationListForSelectedStudent);

        this.StudentEvaluationList = [];
        this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
        this.dataSource.paginator = this.paginator;

        this.loading = false;
        this.PageLoading = false;
      })
  }
  GetEvaluationOption() {
    let list: List = new List();
    list.fields = [
      'ClassEvaluationAnswerOptionsId',
      'Title',
      'Description',
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
            item.Title = globalconstants.decodeSpecialChars(item.Title);
            item.Active = 0;
            item.StudentEvaluationAnswerId = 0;
            return item;
          })

        }
        this.GetClassEvaluations();
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
      'ExamId'
    ];

    list.PageName = "ClassEvaluations";
    list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassEvaluations = [];
          data.value.forEach(clseval => {
            var obj = this.QuestionnaireTypes.filter(f => f.MasterDataId == clseval.QuestionnaireTypeId);
            if (obj.length > 0) {
              clseval.QuestionnaireType = obj[0].MasterDataName;
              clseval.ClassEvaluationOptions = this.ClassEvaluationOptionList.filter(f => f.ParentId == clseval.ClassEvaluationAnswerOptionParentId)
              this.ClassEvaluations.push(clseval);
            }
          })
          this.ClassEvaluations = this.ClassEvaluations.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
        }
        this.loadingFalse();
      })
  }

  GetStudentClasses() {
    //debugger;
    var _filter = '';
    var filterOrgIdNBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenstorage);
    var _classId = this.searchForm.get("searchClassId").value;
    var _sectionId = this.searchForm.get("searchSectionId").value;

    // if (_classId == 0) {
    //   this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    // if (_sectionId == 0) {
    //   this.contentservice.openSnackBar("Please select section.", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }
    if (_classId == 0 || _sectionId == 0)
      return;

    _filter = ' and ClassId eq ' + _classId + ' and SectionId eq ' + _sectionId + ' and Active eq 1';


    if (this.LoginUserDetail[0]["RoleUsers"][0].role.toLowerCase() == 'student') {
      _filter = ' and StudentId eq ' + this.StudentId;
    }
    let list: List = new List();
    list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId"];
    list.PageName = "StudentClasses";
    list.filter = [filterOrgIdNBatchId + _filter];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //this.StudentClasses = [...data.value];
        this.Students = [];
        var filteredStudent = this.StudentList.filter(lst => data.value.findIndex(d => d.StudentId == lst.StudentId) > -1);
        filteredStudent.forEach(student => {
          var _RollNo = '';
          var _name = '';
          var _className = '';
          var _classId = '';
          var _section = '';
          var _studentClassId = 0;
          var studentclassobj = data.value.filter(f => f.StudentId == student.StudentId);
          if (studentclassobj.length > 0) {
            _studentClassId = studentclassobj[0].StudentClassId;
            var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);
            _classId = studentclassobj[0].ClassId;
            if (_classNameobj.length > 0) {
              _className = _classNameobj[0].ClassName;
              var _SectionObj = this.Sections.filter(f => f.MasterDataId == studentclassobj[0].SectionId)
              _RollNo = studentclassobj[0].RollNo;

              if (_SectionObj.length > 0)
                _section = _SectionObj[0].MasterDataName;
              var _lastname = student.LastName == null ? '' : " " + student.LastName;
              _name = student.FirstName + _lastname;
              var _fullDescription = _RollNo + "-" + _name + "-" + _className + "-" + _section;
              this.Students.push({
                StudentClassId: _studentClassId,
                StudentId: student.StudentId,
                ClassId: _classId,
                Name: _fullDescription,
              });
            }
          }
        })
      })
  }
  GetStudents() {
    this.loading = true;
    var _students: any = this.tokenstorage.getStudents();
    if (this.LoginUserDetail[0]["RoleUsers"][0].role.toLowerCase() == 'student') {
      this.StudentList = _students.filter(a => a.Active == 1 && a.StudentId == this.StudentId)
      //_filter = ' and StudentId eq ' + this.StudentId
    }
    else
      this.StudentList = _students.filter(a => a.Active == 1);

    this.loading = false;
    this.PageLoading = false;
    //})
  }
}
export interface IStudentEvaluation {
  StudentEvaluationId: number;
  ClassEvaluationId: number;
  EvaluationClassSubjectMapId: number;
  ClassEvaluationAnswerOptionParentId: number;
  StudentEvaluationResultId: number;
  ClassId: number;
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


