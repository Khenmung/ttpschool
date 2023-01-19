import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-evaluationresultlist',
  templateUrl: './evaluationresultlist.component.html',
  styleUrls: ['./evaluationresultlist.component.scss']
})
export class EvaluationresultlistComponent implements OnInit {
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
  EvaluatedStudent = [];
  StudentEvaluationListColumns = [
    'Name',
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
  ExamClassGroups = [];
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
    this.searchForm = this.fb.group({
      searchStudentName: [0],
      searchEvaluationMasterId: [0],
      searchClassId: [0],
      searchSubjectId: [0],
      searchSectionId: [0],
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

        //this.Students = this.tokenstorage.getStudents();
        //this.GetStudentClasses();

      }
    }
  }
  getExamClassGroup(pExamId) {
    this.contentservice.GetExamClassGroup(this.LoginUserDetail[0]['orgId'], pExamId)
      .subscribe((data: any) => {
        this.ExamClassGroups = [...data.value];
      });
  }
  GetEvaluatedStudent(row) {
    debugger;
    this.loading = true;
    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();

    var _searchEvaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;
    //var _studentObj = this.searchForm.get("searchStudentName").value;

    var _evaluationobj = this.EvaluationMaster.filter(f => f.EvaluationMasterId == _searchEvaluationMasterId)
    if (_evaluationobj.length > 0)
      //  _studentObj["AssessmentName"] = _evaluationobj[0].EvaluationName;

      this.StudentName = row.Name;
    this.StudentClassId = row.StudentClassId;
    this.StudentId = row.StudentId;

    this.ApplyVariables(row);

    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    if (this.EvaluationUpdatable)
      filterStr += ' and StudentId eq ' + row.StudentId
    else {
      filterStr += ' and StudentClassId eq ' + row.StudentClassId
      filterStr += ' and EvaluationExamMapId eq ' + row.EvaluationExamMapId
    }
    var _classEvaluations = this.ClassEvaluations.filter(f => f.EvaluationMasterId == row.EvaluationMasterId
      && (f.ExamId == null || f.ExamId == 0 || f.ExamId == row.ExamId));
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
              Description: globalconstants.decodeSpecialChars(clseval.Description),
              AnswerText: globalconstants.decodeSpecialChars(existing[0].AnswerText),
              History: globalconstants.decodeSpecialChars(existing[0].History),
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
          else if (clseval.QuestionnaireType == 'Heading' || clseval.QuestionnaireType == 'Sub Heading') {
            clseval.ClassEvaluationOptions.forEach(f => f.checked = false);
            item = {
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentClassId: this.StudentClassId,
              StudentId: this.StudentId,
              CatSequence: clseval.DisplayOrder,
              AnswerOptionsId: 0,
              Description: globalconstants.decodeSpecialChars(clseval.Description),
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
        if (this.StudentEvaluationList.length == 0) {
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
    this.PrintHeading = JSON.parse(JSON.stringify(this.AssessmentPrintHeading));
    this.PrintHeading.forEach((stud, indx) => {
      Object.keys(studentInfo).forEach(studproperty => {
        if (stud.Description.includes(studproperty)) {
          this.PrintHeading[indx].Description = stud.Description.replaceAll("[" + studproperty + "]", studentInfo[studproperty]);
        }
      });
    })

  }
  trackCategories(indx, item) {
    return this.StudentEvaluationList.filter(f => f.ClassEvalCategoryId == item.ClassEvalCategoryId)
  }
  GetExams() {
    this.contentservice.GetExams(this.LoginUserDetail[0]["orgId"], this.SelectedBatchId)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.map(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId,
              AttendanceStartDate: e.AttendanceStartDate
            })
        })
        this.contentservice.GetEvaluationExamMaps(this.LoginUserDetail[0]["orgId"], 1)
          .subscribe((data: any) => {
            data.value.forEach(m => {

              let EvaluationObj = this.EvaluationMaster.filter(f => f.EvaluationMasterId == m.EvaluationMasterId);
              if (EvaluationObj.length > 0) {
                m.EvaluationName = EvaluationObj[0].EvaluationName;
                m.Duration = EvaluationObj[0].Duration;

                var _clsObj = this.ClassGroups.filter(f => f.ClassGroupId == EvaluationObj[0].ClassGroupId);
                if (_clsObj.length > 0) {
                  m.ClassGroupName = _clsObj[0].MasterDataName;
                  m.ClassGroupId = EvaluationObj[0].ClassGroupId;
                  var _examObj = this.Exams.filter(f => f.ExamId == m.ExamId);
                  if (_examObj.length > 0)
                    m.ExamName = _examObj[0].ExamName
                  else
                    m.ExamName = '';
                  m.Action1 = true;
                  this.EvaluationExamMap.push(m);
                }
                else
                  m.ClassGroupName = '';

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
        this.SelectedClassSubjects = this.ClassSubjects.filter(f => f.ClassId == this.ClassId);
      });
  }
  GetMasterData() {

    this.allMasterData = this.tokenstorage.getMasterData();
    this.QuestionnaireTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
    //this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP);
    this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.AssessmentPrintHeading = this.getDropDownData(globalconstants.MasterDefinitions.school.ASSESSMENTPRINTHEADING);
    //console.log("this.AssessmentPrintHeading",this.AssessmentPrintHeading)
    this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
      .subscribe((data: any) => {
        this.ClassGroups = [...data.value];
      });
    this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
      this.Classes = [...data.value];
    });
    this.GetExams();
    this.GetClassSubjects();
    this.GetClassEvaluations();
    this.contentservice.GetClassGroupMapping(this.LoginUserDetail[0]["orgId"], 1)
      .subscribe((data: any) => {
        this.ClassGroupMappings = data.value.map(m => {
          m.ClassName = m.Class.ClassName;
          return m;
        });
      })

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
      'Confidential',
      'Active'
    ];

    list.PageName = "EvaluationMasters";

    list.filter = [filterStr];
    this.EvaluationMaster = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          var result = data.value.map(d => {
            d.EvaluationName = globalconstants.decodeSpecialChars(d.EvaluationName);
            return d;
          })
          this.EvaluationMaster = this.contentservice.getConfidentialData(this.tokenstorage, result, "EvaluationName")
        }
        this.GetMasterData();
      });

  }
  FilteredClasses = [];
  FilteredExams = [];
  GetUpdatable() {
    debugger;
    var _evaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;
    if (_evaluationMasterId > 0)
      this.EvaluationUpdatable = this.EvaluationMaster.filter(f => f.EvaluationMasterId == _evaluationMasterId)[0].AppendAnswer;
    var _classgroupObj = this.EvaluationMaster.filter(f => f.EvaluationMasterId == _evaluationMasterId)
    var _classGroupId = 0;
    var _evaluationexammapforselectedEvaluation = this.EvaluationExamMap.filter(ee => ee.EvaluationMasterId == _evaluationMasterId);
    this.FilteredExams = this.Exams.filter(e => {
      return _evaluationexammapforselectedEvaluation.filter(ee => ee.ExamId == e.ExamId).length > 0
    })
    if (_classgroupObj.length > 0) {
      _classGroupId = _classgroupObj[0].ClassGroupId;
      this.FilteredClasses = this.ClassGroupMappings.filter(g => g.ClassGroupId == _classGroupId)
    }    
  }
  // SelectClass() {
  //   var _evaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value;
  //   var _classgroupObj = this.EvaluationMaster.filter(f => f.EvaluationMasterId == _evaluationMasterId)
  //   var _classGroupId = 0;
  //   if (_classgroupObj.length > 0) {
  //     _classGroupId = _classgroupObj[0].ClassGroupId;
  //     this.FilteredClasses = this.ClassGroupMappings.filter(g => g.ClassGroupId == _classGroupId)
  //   }
  // }
  GetEvaluationMapping(pClassId, pSectionId, pEvaluationExamMapId, pEvaluationMasterId, pExamId) {
    debugger;

    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and ClassId eq ' + pClassId
    filterStr += ' and EvaluationExamMapId eq ' + pEvaluationExamMapId
    filterStr += ' and Submitted eq true';
    let list: List = new List();
    list.fields = [
      'StudentEvaluationResultId',
      'StudentClassId',
      'EvaluationExamMapId',
      'ClassId',
      'AnswerText',
      'Active'
    ];

    list.PageName = "StudentEvaluationResults";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.EvaluatedStudent = [];
        var _students = [];
        var _evaluationName = this.EvaluationMaster.filter(e => e.EvaluationMasterId == pEvaluationMasterId)[0].EvaluationName;
        if (pSectionId > 0)
          _students = this.Students.filter(s => s.ClassId == pClassId && s.SectionId == pSectionId);
        else
          _students = this.Students.filter(s => s.ClassId == pClassId);
        _students.forEach(stud => {
          var answeredstudent = data.value.filter(ans => ans.StudentClassId == stud.StudentClassId)
          if (answeredstudent.length > 0) {
            answeredstudent[0].Name = stud.FullName;
            answeredstudent[0].EvaluationMasterId = pEvaluationMasterId;
            answeredstudent[0].EvaluationName = _evaluationName;
            answeredstudent[0].ExamId = pExamId;
            answeredstudent[0].StudentId = stud.StudentId;

            this.EvaluatedStudent.push(answeredstudent[0]);
          }
        })
        if (this.EvaluatedStudent.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        //console.log("this.StudentEvaluationList", this.EvaluatedStudent)
        this.AssessmentTypeDatasource = new MatTableDataSource<any>(this.EvaluatedStudent);
        this.AssessmentTypeDatasource.paginator = this.paginator;
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
        this.ClassEvaluations = [];
        if (data.value.length > 0) {
          data.value.forEach(clseval => {
            var obj = this.QuestionnaireTypes.filter(f => f.MasterDataId == clseval.QuestionnaireTypeId);
            if (obj.length > 0) {
              clseval.QuestionnaireType = obj[0].MasterDataName
              clseval.ClassEvaluationOptions = this.ClassEvaluationOptionList.filter(f => f.ParentId == clseval.ClassEvaluationAnswerOptionParentId)
              this.ClassEvaluations.push(clseval);
            }
          })
          //   console.log("this.ClassEvaluations", this.ClassEvaluations)
        }
        this.loading = false; this.PageLoading = false;
      })
  }

  GetStudentClasses() {
    //debugger;
    var _evaluationMasterId = this.searchForm.get("searchEvaluationMasterId").value
    var _searchClassId = this.searchForm.get("searchClassId").value;
    var _searchSectionId = this.searchForm.get("searchSectionId").value;
    var _examId = this.searchForm.get("searchExamId").value;

    var _evaluationGroupId = 0;
    this.loading = true;
    if (_evaluationMasterId == 0) {
      this.contentservice.openSnackBar("Please select evaluation type.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      return;
    }

    if (_searchClassId == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      return;
    }
    if (_searchSectionId > 0) {

    }
    var _evaluationObj = this.EvaluationMaster.filter(f => f.EvaluationMasterId == _evaluationMasterId);
    if (_evaluationObj.length > 0) {
      _evaluationGroupId = _evaluationObj[0].ClassGroupId;
    }


    var _evaluationdetail = [];
    _evaluationdetail = this.EvaluationExamMap.filter(f => f.EvaluationMasterId == _evaluationMasterId
      && f.ExamId == _examId);

    this.EvaluatedStudent = [];
    //var __classGroupId = 0;
    if (_evaluationdetail.length == 0) {
      this.loading = false;
      this.PageLoading = false;
      this.EvaluatedStudent = [];
      this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    //var _examId = this.searchForm.get("searchExamId").value;

    var filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
    filterOrgIdNBatchId += " and ClassId eq " + _searchClassId
    if (_searchSectionId > 0)
      filterOrgIdNBatchId + " and SectionId eq " + _searchSectionId
    let list: List = new List();
    list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId"];
    list.PageName = "StudentClasses";
    list.filter = [filterOrgIdNBatchId];
    this.PageLoading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClasses = [...data.value];
        this.GetStudents();
        this.GetEvaluationMapping(_searchClassId, _searchSectionId, _evaluationdetail[0].EvaluationExamMapId, _evaluationMasterId, _examId);
      })
  }
  GetStudents() {
    this.loading = true;
    var _filter = ''
    // let list: List = new List();
    // list.fields = [
    //   'StudentId',
    //   'FirstName',
    //   'LastName',
    //   'ContactNo',
    // ];
    var _students: any = this.tokenstorage.getStudents();
    //var filteredStudents =[];
    if (this.LoginUserDetail[0]["RoleUsers"][0].role.toLowerCase() == 'student') {
      this.StudentId = this.tokenstorage.getStudentId();
      _students = _students.filter(s => s.StudentId == this.StudentId)
      //_filter = ' and StudentId eq ' + this.StudentId;
    }
    // list.PageName = "Students";
    // list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"] + _filter];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    debugger;
    this.Students = [];
    //if (data.value.length > 0) {

    _students.forEach(student => {
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

        var _lastname = student.LastName == null ? '' : " " + student.LastName;
        _name = student.FirstName + _lastname;
        var _fullDescription = _RollNo + "-" + _name + "-" + _className + "-" + _section;
        this.Students.push({
          StudentClassId: _studentClassId,
          StudentId: student.StudentId,
          ClassId: _classId,
          ClassName: _className,
          RollNo: _RollNo,
          Name: _name,
          SectionId: studentclassobj[0].SectionId,
          Section: _section,
          Batch: _batchName,
          FullName: _fullDescription,
        });

      }
    })
    //}
    this.Students = this.Students.sort((a, b) => a.RollNo - b.RollNo)
    this.loading = false;
    this.PageLoading = false;
    //})
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



