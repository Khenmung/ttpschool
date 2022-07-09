import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-evaluationresult',
  templateUrl: './evaluationresult.component.html',
  styleUrls: ['./evaluationresult.component.scss']
})
export class EvaluationresultComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  EvaluationUpdatable = false;
  RowsToUpdate = -1;
  EvaluationStarted = false;
  EvaluationSubmitted = false;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ClassSubjects = [];
  Ratings = [];
  SelectedApplicationId = 0;
  StudentClassId = 0;
  StudentId = 0;
  ClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  AssessmentTypeList = [];
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
  PrintHeading = [];
  ClassGroups = [];
  ClassGroupMappings = [];
  Result = [];
  StudentName = '';
  RelevantEvaluationListForSelectedStudent = [];
  EvaluationPlanColumns = [
    'EvaluationName',
    'ExamName',    
    'Action'
  ];
  AssessmentPrintHeading: any[] = [];
  ClassEvaluationOptionList = [];
  filteredStudents: Observable<IStudent[]>;
  StudentEvaluationForUpdate = [];
  displayedColumns = [
    'Description',
    //'AnswerOptionsId',
  ];
  EvaluationExamMap = [];
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
      searchExamId: [0]
    });
    this.filteredStudents = this.searchForm.get("searchStudentName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.FullName),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      );
    //this.ClassId = this.tokenstorage.getClassId();
    this.PageLoad();

  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.FullName.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.FullName ? user.FullName : '';
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONRESULT)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetEvaluationNames();

        this.GetEvaluationOption();
        if (this.Classes.length == 0) {
          this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
            this.Classes = [...data.value];
          });
        }
        this.GetStudentClasses();

      }
    }
  }

  StartEvaluation(row) {
    debugger;
    this.loading = true;
    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();

    var _searchEvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;
    var _studentObj = this.searchForm.get("searchStudentName").value;

    // var _examobj = this.Exams.filter(f => f.ExamId == row.ExamId)
    // if (_examobj.length > 0)
    //   _studentObj["SessionName"] = _examobj[0].ExamName;
    // else if (!this.EvaluationUpdatable) {
    //   this.loading = false; this.PageLoading = false;
    //   this.contentservice.openSnackBar("Exam/Session name must be selected", globalconstants.ActionText, globalconstants.RedBackground);
    //   return;
    // }

    var _evaluationobj = this.EvaluationMaster.filter(f => f.EvaluationMasterId == _searchEvaluationMasterId)
    if (_evaluationobj.length > 0)
      _studentObj["AssessmentName"] = _evaluationobj[0].EvaluationName;

    this.StudentName = _studentObj.Name;
    this.StudentClassId = _studentObj.StudentClassId;
    this.StudentId = _studentObj.StudentId;

    this.ApplyVariables(_studentObj);

    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    if (this.EvaluationUpdatable)
      filterStr += ' and StudentId eq ' + this.StudentId
    else {
      filterStr += ' and StudentClassId eq ' + this.StudentClassId
      filterStr += ' and EvaluationExamMapId eq ' + row.EvaluationExamMapId
    }
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
        this.Result = [...data.value]
        //console.log("data.value", data.value);
        //console.log("_classEvaluations", _classEvaluations);
        var item;
        _classEvaluations.forEach(clseval => {
          var existing = this.Result.filter(f => f.ClassEvaluationId == clseval.ClassEvaluationId);

          if (existing.length > 0) {
            clseval.ClassEvaluationOptions.forEach(cls => {
              var selectedorNot = existing[0].StudentEvaluationAnswers
                .filter(stud => stud.ClassEvaluationAnswerOptionsId == cls.ClassEvaluationAnswerOptionsId)
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
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentEvaluationAnswers: existing[0].StudentEvaluationAnswers,
              StudentClassId: this.StudentClassId,
              StudentId: this.StudentId,
              CatSequence: clseval.DisplayOrder,
              ClassEvaluationAnswerOptionParentId: clseval.ClassEvaluationAnswerOptionParentId,
              EvaluationExamMapId: existing[0].EvaluationExamMapId,
              Description: clseval.Description,
              AnswerText: existing[0].AnswerText,
              History: existing[0].History,
              StudentEvaluationResultId: existing[0].StudentEvaluationResultId,
              ClassEvaluationId: clseval.ClassEvaluationId,
              Active: existing[0].Active,
              EvaluationMasterId: row.EvaluationMasterId,
              MultipleAnswer: clseval.MultipleAnswer,
              QuestionnaireTypeId: clseval.QuestionnaireTypeId,
              QuestionnaireType: clseval.QuestionnaireType,
              DisplayOrder: clseval.DisplayOrder
            }
            this.StudentEvaluationList.push(JSON.parse(JSON.stringify(item)));
          }
          else if (clseval.QuestionnaireType == 'Category' || clseval.QuestionnaireType == 'Sub Category') {
            clseval.ClassEvaluationOptions.forEach(f => f.checked = false);
            item = {
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentClassId: this.StudentClassId,
              StudentId: this.StudentId,
              CatSequence: clseval.DisplayOrder,
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
              QuestionnaireTypeId: clseval.QuestionnaireTypeId,
              QuestionnaireType: clseval.QuestionnaireType,
              DisplayOrder: clseval.DisplayOrder,
              StudentEvaluationAnswers: []
            }
            this.StudentEvaluationList.push(JSON.parse(JSON.stringify(item)));
          }

        })
        if (this.Result.length == 0) {
          this.StudentEvaluationList = [];
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        else
          this.StudentEvaluationList = this.StudentEvaluationList.sort((a, b) => a.DisplayOrder - b.DisplayOrder)

        row.EvaluationStarted = true;
        this.dataSource = new MatTableDataSource<IStudentEvaluation>(this.StudentEvaluationList);
        this.dataSource.paginator = this.paginator;
        this.loading = false; this.PageLoading = false;
      })
  }
  ApplyVariables(studentInfo) {
    //console.log("studentInfo", studentInfo)
    //console.log("this.AssessmentPrintHeading", this.AssessmentPrintHeading)
    this.PrintHeading = [...this.AssessmentPrintHeading];
    this.AssessmentPrintHeading.forEach((stud, indx) => {
      Object.keys(studentInfo).forEach(studproperty => {
        if (stud.Logic.includes(studproperty)) {
          this.PrintHeading[indx].Logic = stud.Logic.replaceAll("[" + studproperty + "]", studentInfo[studproperty]);
        }
      });
    })

  }
  trackCategories(indx, item) {
    return this.StudentEvaluationList.filter(f => f.ClassEvalCategoryId == item.ClassEvalCategoryId)
  }
  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = data.value.map(e => {
          return {
            ExamId: e.ExamId,
            ExamName: this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)[0].MasterDataName
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
                this.EvaluationExamMap.push(m);
              }
            })
            //this.EvaluationClassGroup = [...data.value];
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
        this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.ClassId);
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
        this.AssessmentPrintHeading = this.getDropDownData(globalconstants.MasterDefinitions.school.ASSESSMENTPRINTHEADING);
        //console.log("this.AssessmentPrintHeading",this.AssessmentPrintHeading)
        this.GetExams();
        this.GetClassSubjects();
        this.GetClassEvaluations();
        this.contentservice.GetClassGroupMapping(this.LoginUserDetail[0]["orgId"], 1)
          .subscribe((data: any) => {
            this.ClassGroupMappings = [...data.value];
          })

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
        if (data.value.length > 0) {
          this.EvaluationMaster = data.value.map(item => {
            return item;
          })
        }
        this.GetMasterData();
      });

  }
  GetUpdatable() {
    debugger;
    var _evaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;
    if (_evaluationMasterId > 0)
      this.EvaluationUpdatable = this.EvaluationMaster.filter(f => f.EvaluationMasterId == _evaluationMasterId)[0].AppendAnswer;
  }
  GetEvaluationMapping() {
    debugger;

    var _evaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value
    this.loading = true;
    if (_evaluationMasterId == 0) {
      this.contentservice.openSnackBar("Please select evaluation type.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false; this.PageLoading = false;
      return;
    }

    // this.ClassId = this.searchForm.get("searchStudentName").value.ClassId;
    // var _classGroupIdObj = this.ClassGroupMappings.filter(f => f.ClassId == this.ClassId)
    // var _classGroupId = 0;
    // if (_classGroupIdObj.length > 0) {
    //   _classGroupId = _classGroupIdObj[0].ClassGroupId;
    // }
    // var _examId = this.searchForm.get("searchExamId").value;
    // var filterstr = '';
    // if (_examId > 0 && !this.EvaluationUpdatable) {
    //   filterstr = 'ExamId eq ' + _examId + ' and '
    // }

    var _classGroupIdObj = [];
    //if (this.EvaluationUpdatable)
      _classGroupIdObj = this.EvaluationExamMap.filter(f => f.EvaluationMasterId == _evaluationMasterId);
    // else
    //   _classGroupIdObj = this.EvaluationExamMap.filter(f => f.EvaluationMasterId == _evaluationMasterId
    //     && f.ExamId == _examId);

    this.RelevantEvaluationListForSelectedStudent = [];
    var __classGroupId = 0;
    if (_classGroupIdObj.length > 0) {
      this.RelevantEvaluationListForSelectedStudent = [..._classGroupIdObj];
      __classGroupId = _classGroupIdObj[0].ClassGroupId;
    }
    else {
      this.loading = false; this.PageLoading = false;
      this.RelevantEvaluationListForSelectedStudent =[];
      this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.AssessmentTypeDatasource = new MatTableDataSource<any>(this.RelevantEvaluationListForSelectedStudent);
    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    this.dataSource.paginator = this.paginator;
    this.loading = false;
    this.PageLoading = false;
    //      })
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
            item.Active = 0;
            return item;
          })
        }
        else {
          this.contentservice.openSnackBar("No answer option found.", globalconstants.ActionText, globalconstants.BlueBackground);
        }
        //this.loading = false; this.PageLoading=false;
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
          console.log("this.ClassEvaluations", this.ClassEvaluations)
        }
        this.loading = false; this.PageLoading = false;
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

          data.value.map(student => {
            var _RollNo = '';
            var _name = '';
            var _className = '';
            var _classId = '';
            var _section = '';
            var _studentClassId = 0;
            var _batchName = '';
            var studentclassobj = this.StudentClasses.filter(f => f.StudentId == student.StudentId);
            if (studentclassobj.length > 0) {
              _studentClassId = studentclassobj[0].StudentClassId;
              _batchName = this.tokenstorage.getSelectedBatchName();
              var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);
              _classId = studentclassobj[0].ClassId;
              if (_classNameobj.length > 0)
                _className = _classNameobj[0].ClassName;
              var _SectionObj = this.Sections.filter(f => f.MasterDataId == studentclassobj[0].SectionId)

              if (_SectionObj.length > 0)
                _section = _SectionObj[0].MasterDataName;
              _RollNo = studentclassobj[0].RollNo;
            }
            _name = student.FirstName + " " + student.LastName;
            var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo + "-" + student.ContactNo;
            this.Students.push({
              StudentClassId: _studentClassId,
              StudentId: student.StudentId,
              ClassId: _classId,
              StudentClass: _className,
              RollNo: _RollNo,
              Name: _name,
              Section: _section,
              Batch: _batchName,
              FullName: _fullDescription,
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
  EvaluationExamMapId: number;
  ClassEvaluationAnswerOptionParentId: number;
  StudentEvaluationResultId: number;
  AnswerText: string;
  StudentClassId: number;
  EvaluationMasterId: number;
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
  FullName: string;
  ClassName: string;
  Section: string;
}



