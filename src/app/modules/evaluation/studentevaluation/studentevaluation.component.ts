import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
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
  AssessmentTypeList = [];
  StudentEvaluationList: any[] = [];
  SelectedBatchId = 0;
  Categories = [];
  Sections = [];
  Classes = [];
  ClassEvaluations = [];
  AssessmentTypeDatasource: MatTableDataSource<any>;
  RatingOptions = [];
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  EvaluationTypes = [];
  Exams = [];
  ExamNames = [];
  SelectedClassSubjects = [];
  StudentClasses = [];
  Students = [];
  EvaluationPlanColumns = [
    'ExamName',
    'EvaluationType',
    'ClassName',
    'Subject'

  ];
  filteredStudents: Observable<IStudent[]>;
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
      searchStudentName: [0],
      searchEvaluationTypeId: [0],
      searchSubjectId: [0],
      searchExamId: [0]
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

  UpdateAnswers(row, item, event, i) {

    if (event.target.checked)
      row.StudentEvaluationAnswer.push(item);
    else
      row.StudentEvaluationAnswer.splice(i, 1);
  }
  UpdateRadio(row, item) {
    row.StudentEvaluationAnswer = [];
    row.StudentEvaluationAnswer.push(item);
    // else
    //   row.StudentEvaluationAnswer.splice(i, 1);
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
              StudentEvaluationAnswers: row.StudentEvaluationAnswers,
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
  StartEvaluation(row) {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and StudentClassId eq ' + this.StudentClassId

    this.StudentClassId = this.searchForm.get("searchStudentName").value.StudentClassId;
    //var _searchEvaluationTypeId = row.EvaluationTypeId; //this.searchForm.get("searchEvaluationTypeId").value;
    //var _searchExamId =  row.ExamId;// this.searchForm.get("searchExamId").value;
    //var _searchSubjectId = row. this.searchForm.get("searchSubjectId").value;
    if (row.EvaluationTypeId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select evaluation type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    //console.log("ClassEvaluations", this.ClassEvaluations)
    var _classEvaluations = this.ClassEvaluations.filter(f => f.EvaluationTypeId == row.EvaluationTypeId
      && (f.ClassId == 0 || f.ClassId == this.ClassId));
    if (row.ExamId > 0) {
      _classEvaluations = _classEvaluations.filter(f => f.ExamId == row.ExamId);
    }
    if (row.SubjectId > 0) {
      _classEvaluations = _classEvaluations.filter(f => f.SubjectId == row.SubjectId);
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

    list.PageName = "StudentEvaluationResults";
    list.lookupFields = ["ClassEvaluation($select=AnswerOptionsId)"];

    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        var item;
        _classEvaluations.forEach(clseval => {
          var existing = data.value.filter(f => f.ClassEvaluationId == clseval.ClassEvaluationId);

          if (existing.length > 0) {
            clseval.ClassEvaluationOptions.forEach(cls => {
              cls.checked = existing[0].StudentEvaluationAnswers.findIndex(stud => stud.AnswerOptionsId == cls.AnswerOptionsId) >= 0
            })
            item = {
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentClassId: this.StudentClassId,
              CatSequence: clseval.DisplayOrder,
              RatingId: existing[0].RatingId,
              Description: clseval.Description,
              Detail: existing[0].Detail,
              StudentEvaluationId: existing[0].StudentEvaluationId,
              ClassEvaluationId: existing[0].ClassEvaluationId,
              Active: existing[0].Active,
              EvaluationTypeId: existing[0].EvaluationTypeId,
              ExamId: existing[0].ExamId,
              MultipleAnswer: clseval.MultipleAnswer,
              StudentEvaluationAnswers: existing[0].StudentEvaluationAnswers,
              //Checked:StudentEvaluationAnswer.findIndex(f=>f.AnswerOptionsId===item.AnswerOptionsId) >= 0
            }
          }
          else {
            clseval.ClassEvaluationOptions.forEach(f => f.checked = false);
            item = {
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentClassId: this.StudentClassId,
              CatSequence: clseval.DisplayOrder,
              RatingId: 0,
              Description: clseval.Description,
              Detail: '',
              StudentEvaluationId: 0,
              ClassEvaluationId: clseval.ClassEvaluationId,
              Active: 0,
              EvaluationTypeId: row.EvaluationTypeId,
              ExamId: 0,
              MultipleAnswer: 0,
              StudentEvaluationAnswers: []
            }
          }
          this.StudentEvaluationList.push(item);
        })
        //console.log("this.StudentEvaluationList", this.StudentEvaluationList)
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
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = data.value.map(e => {
          return {
            ExamId: e.ExamId,
            ExamName: this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)[0].MasterDataName
          }
        })
        //this.GetEvaluationMapping();
        this.loading = false;
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
        this.Categories = this.getDropDownData(globalconstants.MasterDefinitions.school.EVALUATIONCATEGORY);
        this.EvaluationTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.EVALUATIONTYPE);
        this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.GetExams();
        this.GetClassSubjects();
        this.GetClassEvaluations();
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
  GetEvaluationMapping() {

    let list: List = new List();
    list.fields = [
      'EvaluationClassSubjectMapId',
      'EvaluationTypeId',
      'ClassId',
      'ClassSubjectId',
      'ExamId',
      'Active'
    ];

    list.PageName = "EvaluationClassSubjectMaps";
    //list.lookupFields = ["ClassEvaluationOptions($filter=Active eq 1;$select=AnswerOptionsId,Title,Value,Correct,Point)"]
    list.filter = ['(ClassId eq 0 or ClassId eq ' + this.ClassId + ') and Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.AssessmentTypeList = data.value.map(m => {
          m.EvaluationType = this.EvaluationTypes.filter(f => f.MasterDataId == m.EvaluationTypeId)[0].MasterDataName;

          var _clsObj = this.Classes.filter(f => f.ClassId == m.ClassId);
          if (_clsObj.length > 0)
            m.ClassName = _clsObj[0].MasterDataName;
          else
            m.ClassName = '';

          var _examObj = this.Exams.filter(f => f.ExamId == m.ExamId);
          if (_examObj.length > 0)
            m.ExamName = _examObj[0].ExamName
          else
            m.ExamName = '';

          return m;
        });
        console.log("this.AssessmentTypeList", this.AssessmentTypeList)

        this.AssessmentTypeDatasource = new MatTableDataSource<any>(this.AssessmentTypeList);
      })
  }
  GetClassEvaluations() {

    let list: List = new List();
    list.fields = [
      'ClassEvaluationId',
      'ClassEvalCategoryId',
      'ClassEvalSubCategoryId',
      'EvaluationTypeId',
      'DisplayOrder',
      'Description',
      'AnswerOptionId',
      'MultipleAnswer',
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
        if (data.value.length > 0) {
          this.Students = data.value.map(student => {
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
            }

            _name = student.FirstName + " " + student.LastName;
            var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo + "-" + student.ContactNo;
            return {
              StudentClassId: _studentClassId,
              StudentId: student.StudentId,
              ClassId: _classId,
              Name: _fullDescription,
            }
          })
        }
        this.loading = false;
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
  //SubCategories: any[];
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}


