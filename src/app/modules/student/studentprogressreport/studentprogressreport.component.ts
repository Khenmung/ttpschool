import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IStudentEvaluation } from '../../evaluation/evaluationresult/evaluationresult.component';

@Component({
  selector: 'app-studentprogressreport',
  templateUrl: './studentprogressreport.component.html',
  styleUrls: ['./studentprogressreport.component.scss']
})
export class StudentprogressreportComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  StudentAttendanceList = [];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  ExamStudentResults = [];
  GradedMarksResults = [];
  NonGradedMarkResults = [];
  SubjectCategory = [];
  StandardFilterWithBatchId = '';
  loading = false;
  rowCount = 0;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  SelectedBatchId = 0;
  StoredForUpdate = [];
  SubjectMarkComponents = [];
  MarkComponents = [];
  StudentGrades = [];
  Students = [];
  Classes = [];
  ClassGroups = [];
  Subjects = [];
  Sections = [];
  ExamStatuses = [];
  ExamNames = [];
  StudentClassId = 0;
  Exams = [];
  Batches = [];
  StudentSubjects = [];
  ClassEvaluations = [];
  QuestionnaireTypes = [];
  ClassEvaluationOptionList = [];
  ClassGroupMappings = [];
  CurrentStudentClassGroups = [];
  dataSource: MatTableDataSource<IExamStudentSubjectResult>;
  dataSourceEvaluation: MatTableDataSource<IStudentEvaluation>;
  GradedSubjectsDataSource: MatTableDataSource<any[]>;
  NonGradedSubjectsDataSource: MatTableDataSource<any[]>;
  allMasterData = [];
  Permission = 'deny';
  ExamId = 0;
  SelectedApplicationId = 0;
  ExamStudentSubjectResultData = {
    ExamStudentSubjectResultId: 0,
    ExamId: 0,
    StudentClassSubjectId: 0,
    ClassSubjectMarkComponentId: 0,
    Marks: 0,
    ExamStatus: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  DisplayColumns = [
    "FirstCol"
  ];
  GradedDisplayColumns = [
    "Subject"
  ];
  NonGradedDisplayColumns = [
    "Subject"
  ];
  EvaluationDisplayedColumns = [
    'Description',
    //'AnswerText'
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
  ) { }

  ngOnInit(): void {
    this.PageLoad();
  }

  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.STUDENT.PROGRESSREPORT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      ////console.log('this.Permission', this.Permission)
      if (this.Permission != 'deny') {
        this.StudentClassId = this.tokenstorage.getStudentClassId();
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.GetMasterData();

        //this.GetStudentAttendance();
      }
      else {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
    }
  }
  GetStudentSubject() {

    let filterStr = 'Active eq 1 and StudentClassId eq ' + this.StudentClassId;

    let list: List = new List();
    list.fields = [
      "StudentClassSubjectId",
      "ClassSubjectId",
      "StudentClassId",
      "Active",
      "SubjectId"
    ];
    list.PageName = "StudentClassSubjects";
    list.lookupFields = ["ClassSubject($select=SubjectCategoryId,ClassId)"]
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.StudentSubjects = data.value.map(ss => {
          ss.Subject = this.Subjects.filter(s => s.MasterDataId == ss.SubjectId)[0].MasterDataName;
          ss.SubjectCategoryId = ss.ClassSubject.SubjectCategoryId;
          ss.ClassId = ss.ClassSubject.ClassId;
          return ss;
        })
        this.CurrentStudentClassGroups = this.ClassGroupMappings.filter(f => f.ClassId == this.StudentSubjects[0].ClassId);
        this.GetEvaluationExamMap();
        this.GetStudentSubjectResults();
      })
  }

  GetExamGrandTotal() {
    debugger;
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    filterStr += ' and StudentClassId eq ' + this.StudentClassId;

    let list: List = new List();
    list.fields = [
      "ExamId",
      "StudentClassId",
      "TotalMarks",
      "MarkPercent",
      "Attendance",
      "ClassStrength",
      "Division",
      "Rank",
      "Active"
    ];

    list.PageName = "ExamStudentResults";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ExamStudentResults = [];
        this.ExamStudentResults.push(
          { "FirstCol": "Grand Total" },
          { "FirstCol": "Percentage (%)" },
          { "FirstCol": "Division" },
          { "FirstCol": "Rank" },
          { "FirstCol": "Attendance" },
          { "FirstCol": "Class Strength" });
        var ToInclude = [
          { "ColumnName": "TotalMarks", "Display": "Grand Total" },
          { "ColumnName": "MarkPercent", "Display": "Percentage (%)" },
          { "ColumnName": "Division", "Display": "Division" },
          { "ColumnName": "Rank", "Display": "Rank" },
          { "ColumnName": "Attendance", "Display": "Attendance" },
          { "ColumnName": "ClassStrength", "Display": "Class Strength" }
        ]

        data.value.forEach(eachexam => {
          var _ExamName = '';
          var obj = this.Exams.filter(exam => exam.ExamId == eachexam.ExamId);
          if (obj.length > 0) {
            _ExamName = obj[0].ExamName;
            eachexam.ExamName = _ExamName;
            if (this.DisplayColumns.indexOf(_ExamName) == -1)
              this.DisplayColumns.push(_ExamName);
            Object.keys(eachexam).forEach(col => {
              var objcolumn = ToInclude.filter(include => include.ColumnName == col);
              if (objcolumn.length > 0) {
                var resultrow = this.ExamStudentResults.filter(f => f.FirstCol == objcolumn[0].Display)
                resultrow[0][_ExamName] = eachexam[objcolumn[0].ColumnName]
              }
            })
          }
        })
        //this.loading = false;
        //this.PageLoading = false;
        this.GetGradedNonGradedSubjectMark();      
      });
  }
  GetGradedNonGradedSubjectMark() {

    let filterStr = 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    filterStr += ' and StudentClassId eq ' + this.StudentClassId;

    let list: List = new List();
    list.fields = [
      "ExamResultSubjectMarkId",
      "StudentClassId",
      "ExamId",
      "StudentClassSubjectId",
      "Marks",
      "Grade"
    ];

    list.PageName = "ExamResultSubjectMarks";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.GradedMarksResults = [];
        this.NonGradedMarkResults = [];

        data.value.map(eachexam => {
          var examName = '';
          var objSubject = this.StudentSubjects.filter(subject => subject.StudentClassSubjectId == eachexam.StudentClassSubjectId);
          if (objSubject.length > 0) {
            eachexam.Subject = objSubject[0].Subject;
            var _subjectCategory = this.SubjectCategory.filter(f => f.MasterDataId == objSubject[0].SubjectCategoryId);
            var objExam = this.Exams.filter(exam => exam.ExamId == eachexam.ExamId);
            if (objExam.length > 0) {
              examName = objExam[0].ExamName;
              eachexam.ExamName = examName;
              var currentSubjectrow = [];
              if (_subjectCategory[0].MasterDataName.toLowerCase() == 'grading') {
                if (this.GradedDisplayColumns.indexOf(examName) == -1)
                  this.GradedDisplayColumns.push(examName);

                currentSubjectrow = this.GradedMarksResults.filter(f => f.Subject.toLowerCase() == eachexam["Subject"].toLowerCase());
                if (currentSubjectrow.length == 0)
                  this.GradedMarksResults.push({ "Subject": eachexam["Subject"], [examName]: eachexam["Grade"] });
                else
                  currentSubjectrow[0][examName] = eachexam["Grade"]
              }
              else {
                if (this.NonGradedDisplayColumns.indexOf(examName) == -1)
                  this.NonGradedDisplayColumns.push(examName);

                currentSubjectrow = this.NonGradedMarkResults.filter(f => f.Subject.toLowerCase() == eachexam["Subject"].toLowerCase());
                if (currentSubjectrow.length == 0)
                  this.NonGradedMarkResults.push({ "Subject": eachexam["Subject"], [examName]: eachexam["Marks"] });
                else
                  currentSubjectrow[0][examName] = eachexam["Marks"]
              }
            }
          }
        })
        this.loading = false;
        this.PageLoading = false;
        this.GradedSubjectsDataSource = new MatTableDataSource<any>(this.GradedMarksResults);
        this.NonGradedSubjectsDataSource = new MatTableDataSource<any>(this.NonGradedMarkResults);
        this.dataSource = new MatTableDataSource<any>(this.ExamStudentResults);
      });
  }

  GetStudentSubjectResults() {
    this.PageLoading =true;
    this.GetExamGrandTotal();
    
  }
  GetStudentSubjectResults_old() {
    debugger;

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let filterStr = 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    filterStr += ' and StudentClassId eq ' + this.StudentClassId;

    let list: List = new List();
    list.fields = [
      "ExamStudentSubjectResultId",
      "ExamId",
      "StudentClassSubjectId",
      "StudentClassId",
      "ClassSubjectMarkComponentId",
      "Marks",
      "ExamStatus",
      "Active"
    ];

    list.PageName = "ExamStudentSubjectResults";
    list.lookupFields = [
      "StudentClassSubject($select=SubjectId,ClassSubjectId,StudentClassId;$expand=StudentClass($select=ClassId,StudentId,RollNo,SectionId))"];
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log("data", data)
        var _class = '';
        var _subject = '';
        var _section = '';
        var _Mark = '';
        this.ExamStudentSubjectResult = data.value.map(s => {
          _class = '';
          _subject = '';
          _Mark = '';
          let _stdClass = this.Classes.filter(c => c.ClassId == s.StudentClassSubject.StudentClass.ClassId);
          if (_stdClass.length > 0)
            _class = _stdClass[0].ClassName;

          let _stdSubject = this.Subjects.filter(c => c.MasterDataId == s.StudentClassSubject.SubjectId);
          if (_stdSubject.length > 0)
            _subject = _stdSubject[0].MasterDataName;

          let _stdSection = this.Sections.filter(c => c.MasterDataId == s.StudentClassSubject.StudentClass.SectionId);
          if (_stdSection.length > 0)
            _section = _stdSection[0].MasterDataName;
          var _ExamName = '';
          var examobj = this.Exams.filter(f => f.ExamId == s.ExamId)
          if (examobj.length > 0)
            _ExamName = examobj[0].ExamName;

          return {
            StudentClassSubjectId: s.StudentClassSubjectId,
            ClassSubjectId: s.StudentClassSubject.ClassSubjectId,
            StudentClassId: s.StudentClassId,
            Student: s.StudentClassSubject.StudentClass.RollNo,
            SubjectId: s.StudentClassSubject.SubjectId,
            Subject: _subject,
            ClassId: s.StudentClassSubject.StudentClass.ClassId,
            StudentId: s.StudentClassSubject.StudentClass.StudentId,
            SectionId: s.StudentClassSubject.StudentClass.SectionId,
            Mark: s.Marks,
            ExamStatus: s.ExamStatus,
            ExamName: _ExamName
          }
        })
        var marksum = alasql("select SubjectId,Subject,ExamName,sum(Mark) Mark from ? group by SubjectId,Subject,ExamName", [this.ExamStudentSubjectResult])

        var progressreport = [];
        var examEolumns = [];
        this.Exams.forEach(e => {
          examEolumns.push(e.ExamName)
        })

        //progressreport.push(JSON.parse(columns));

        this.StudentSubjects.forEach((ss) => {
          progressreport.push({
            "Subject": ss.Subject,
            "SubjectId": ss.SubjectId
          });
        })
        progressreport.forEach((subject) => {
          examEolumns.forEach(exam => {
            //subject["'"+exam + "'"] = ''
            subject[exam] = ''
            // if (this.DisplayColumns.indexOf(exam) == -1)
            //   this.DisplayColumns.push(exam)
          })
        })

        progressreport.forEach(report => {

          var current = marksum.filter(c => c.SubjectId == report.SubjectId);
          current.forEach(exam => {
            if (exam.ExamName.length > 0 && this.DisplayColumns.indexOf(exam.ExamName) == -1)
              this.DisplayColumns.push(exam.ExamName)
            report[exam.ExamName] = exam.Mark
          })
        })

        //console.log("this.DisplayColumns", this.DisplayColumns);
        //console.log("shd", progressreport);

        this.dataSource = new MatTableDataSource<any>(progressreport);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.loading = false; this.PageLoading = false;
      });
  }

  GetMasterData() {
    debugger;
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
        this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
        this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY);
        this.QuestionnaireTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
        this.Batches = this.tokenstorage.getBatches()
        this.contentservice.GetClassGroupMapping(this.LoginUserDetail[0]["orgId"], 1)
          .subscribe((data: any) => {
            this.ClassGroupMappings = [...data.value];
          })

        this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
          .subscribe((data: any) => {
            this.ClassGroups = [...data.value];
          });
        this.GetExams();
        
      });
  }
  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 and ReleaseResult eq 1 " + orgIdSearchstr];
    list.orderBy = "EndDate desc";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName
            })
        })
        this.GetStudentSubject();
        this.GetEvaluationOption();
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
          this.GetClassEvaluations();
        }
        else {
          this.contentservice.openSnackBar("No answer option found.", globalconstants.ActionText, globalconstants.BlueBackground);
        }
        //this.loading = false; this.PageLoading=false;
      });

  }
  EvaluationExamMap = [];
  GetEvaluationExamMap() {

    let list: List = new List();
    list.fields = [
      'EvaluationExamMapId',
      'ExamId',
      'EvaluationMasterId',
      'Active',
    ];
    list.PageName = "EvaluationExamMaps";
    list.lookupFields = ["EvaluationMaster($select=Active,EvaluationMasterId,ClassGroupId,EvaluationName,AppendAnswer)"];
    list.filter = ['Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.EvaluationExamMap = [];
        debugger;
        data.value.forEach(f => {
          var _ExamName = '';
          var obj = this.CurrentStudentClassGroups.filter(g => g.ClassGroupId == f.EvaluationMaster.ClassGroupId);

          if (obj.length > 0 && f.EvaluationMaster.Active == 1 && f.EvaluationMaster.AppendAnswer == 0) {
            var objexam = this.Exams.filter(e => e.ExamId == f.ExamId)
            if (objexam.length > 0) {
              _ExamName = objexam[0].ExamName;
              f.ClassGroupId = f.EvaluationMaster.ClassGroupId;
              f.ExamName = _ExamName;
              f.EvaluationName = f.EvaluationMaster.EvaluationName;
              this.EvaluationExamMap.push(f);
            }
          }
        });
        //console.log("this.EvaluationExamMap",this.EvaluationExamMap)
      })
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
    list.lookupFields = ["EvaluationMaster($select=AppendAnswer)"]
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];
    
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassEvaluations = [];
        var _data = data.value.filter(f => f.EvaluationMaster.AppendAnswer == false);
        if (_data.length > 0) {
          _data.forEach(clseval => {
            var obj = this.QuestionnaireTypes.filter(f => f.MasterDataId == clseval.QuestionnaireTypeId);
            if (obj.length > 0) {
              clseval.Description = globalconstants.decodeSpecialChars(clseval.Description);
              clseval.QuestionnaireType = obj[0].MasterDataName
              clseval.ClassEvaluationOptions = this.ClassEvaluationOptionList.filter(f => f.ParentId == clseval.ClassEvaluationAnswerOptionParentId)
              this.ClassEvaluations.push(clseval);
            }
          })
          this.StartEvaluation();
        }
        this.loading = false; this.PageLoading = false;
      })
  }
  StudentEvaluationList = [];
  Result = [];
  StartEvaluation() {
    debugger;
    this.loading = true;
    this.StudentEvaluationList = [];
    this.dataSource = new MatTableDataSource<any>(this.StudentEvaluationList);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();

    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and StudentClassId eq ' + this.StudentClassId
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
    list.lookupFields = ["StudentEvaluationAnswers($filter=Active eq 1;$select=StudentEvaluationAnswerId,StudentEvaluationResultId,ClassEvaluationAnswerOptionsId,Active)"];

    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger
        this.Result = [...data.value]
        var _distinctEvaluationType = alasql('select distinct EvaluationMasterId,EvaluationName from ?', [this.EvaluationExamMap])

        _distinctEvaluationType.forEach(distinctevaluation => {

          this.StudentEvaluationList.push({
            Description: distinctevaluation.EvaluationName,
            EvaluationName: distinctevaluation.EvaluationName,
            EvaluationMasterId: distinctevaluation.EvaluationMasterId,
            QuestionnaireType: 'Evaluation Master'
          });

          var _oneEvaluationMultipExam = this.EvaluationExamMap.filter(f => f.EvaluationMasterId == distinctevaluation.EvaluationMasterId);
          _oneEvaluationMultipExam.forEach(evalExam => {

            if (this.EvaluationDisplayedColumns.indexOf(evalExam.ExamName) == -1) {
              this.EvaluationDisplayedColumns.push(evalExam.ExamName);
            }
            var _classEvaluationExamMap = this.ClassEvaluations.filter(f => f.EvaluationMasterId == evalExam.EvaluationMasterId
              && f.ExamId ==null || f.ExamId == 0 || f.ExamId == evalExam.ExamId);
           
            _classEvaluationExamMap.forEach(clseval => {
              var existing = this.Result.filter(f => f.ClassEvaluationId == clseval.ClassEvaluationId
                && f.EvaluationExamMapId == evalExam.EvaluationExamMapId);
              var ans = [];
              if (existing.length > 0) {
                clseval.ClassEvaluationOptions.forEach(cls => {
                  var selected = existing[0].StudentEvaluationAnswers
                    .filter(stud => stud.ClassEvaluationAnswerOptionsId == cls.ClassEvaluationAnswerOptionsId)
                  if (selected.length > 0)
                    ans.push(cls.Title);
                });
                if (existing[0].AnswerText.length > 0 && ans.length==0)
                  ans = existing[0].AnswerText
              }

              var _description = globalconstants.decodeSpecialChars(clseval.Description);
              var row = this.StudentEvaluationList.filter(f => f["Description"] == _description
                && f.EvaluationMasterId == clseval.EvaluationMasterId);
              if (row.length > 0) {
                row[0][evalExam.ExamName] = ans;
              }
              else {
                // if (existing.length > 0)
                //   _textAnswer = existing[0].AnswerText
                this.StudentEvaluationList.push({
                  Description: _description,
                  [evalExam.ExamName]: ans,
                  EvaluationName: evalExam.EvaluationName,
                  EvaluationMasterId: evalExam.EvaluationMasterId,
                  QuestionnaireType: clseval.QuestionnaireType,
                  DisplayOrder: clseval.DisplayOrder
                });
              }
            })
          })//class evaluation
        })//each evaluation exam map

        if (this.StudentEvaluationList.length == 0) {
          this.StudentEvaluationList = [];
          this.contentservice.openSnackBar(globalconstants.NoEvaluationRecordFoundMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }
        else
          this.StudentEvaluationList = this.StudentEvaluationList.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
        //  console.log("this.StudentEvaluationList",this.StudentEvaluationList)
        this.dataSourceEvaluation = new MatTableDataSource<IStudentEvaluation>(this.StudentEvaluationList);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
        this.PageLoading = false;
      })
  }
  // ApplyVariables(studentInfo) {
  //   this.PrintHeading = [...this.AssessmentPrintHeading];
  //   this.AssessmentPrintHeading.forEach((stud, indx) => {
  //     Object.keys(studentInfo).forEach(studproperty => {
  //       if (stud.Logic.includes(studproperty)) {
  //         this.PrintHeading[indx].Logic = stud.Logic.replaceAll("[" + studproperty + "]", studentInfo[studproperty]);
  //       }
  //     });
  //   })

  // }
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
export interface IExamStudentSubjectResult {
  ExamStudentSubjectResultId: number;
  ExamId: number;
  ExamName: string;
  SubjectId: number;
  StudentClassSubjectId: number;
  Student: string;
  ClassSubjectMarkComponentId: number;
  SubjectMarkComponent: string;
  FullMark: number;
  PassMark: number;
  Mark: number;
  ExamStatus: number;
  Active: number;
  Action: boolean;
}



