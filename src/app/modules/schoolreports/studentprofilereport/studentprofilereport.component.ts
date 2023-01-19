import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
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
  selector: 'app-studentprofilereport',
  templateUrl: './studentprofilereport.component.html',
  styleUrls: ['./studentprofilereport.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class StudentprofilereportComponent implements OnInit {
  PageLoading = true;

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
  QuestionnaireTypes = [];
  Classes = [];
  ClassEvaluations = [];
  RatingOptions = [];
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  EvaluationTypes = [];
  Sections = [];
  Students = [];
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
    'Id',
    'Description',
    //'Detail',
    'RatingId',
  ];
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  searchForm: UntypedFormGroup;
  filteredOptions: Observable<IStudent[]>;
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
      searchEvaluationTypeId: [0],
      searchExamId: [0]
    });

    this.filteredOptions = this.searchForm.get("searchStudentName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      );
    // this.StudentClassId = this.tokenstorage.getStudentClassId();
    // if (this.StudentClassId == 0) {
    //   this.contentservice.openSnackBar("Student class Id is zero", globalconstants.ActionText, globalconstants.RedBackground);

    // }
    // else {
    //   this.ClassId = this.tokenstorage.getClassId();
    this.PageLoad();
    //}
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


  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }

  GetStudentEvaluation() {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and StudentClassId eq ' + this.StudentClassId

    var _searchEvaluationTypeId = this.searchForm.get("searchEvaluationTypeId").value;
    var _searchExamId = this.searchForm.get("searchExamId").value;
    //var _searchSubjectId = this.searchForm.get("searchSubjectId").value;
    if (_searchEvaluationTypeId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select evaluation type.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    console.log("ClassEvaluations", this.ClassEvaluations)
    var _classEvaluations = this.ClassEvaluations.filter(f => f.EvaluationTypeId == _searchEvaluationTypeId
      && (f.ClassId == 0 || f.ClassId == this.ClassId));
    if (_searchExamId > 0) {
      _classEvaluations = _classEvaluations.filter(f => f.ExamId == _searchExamId);
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
    list.lookupFields = ["StudentEvaluationAnswers($select=AnswerOptionsId)"];

    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        var item;
        _classEvaluations.forEach((clseval, indx) => {
          var existing = data.value.filter(f => f.ClassEvaluationId == clseval.ClassEvaluationId);
          var slNo = indx + 1 + ""
          slNo = slNo.length == 1 ? "0" + slNo : slNo;
          if (existing.length > 0) {
            clseval.ClassEvaluationOptions.forEach(cls => {
              cls.checked = existing[0].StudentEvaluationAnswers.findIndex(stud => stud.AnswerOptionsId == cls.AnswerOptionsId) >= 0
            })

            item = {
              Id: slNo,
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
              Id: slNo,
              ClassEvaluationOptions: clseval.ClassEvaluationOptions,
              StudentClassId: this.StudentClassId,
              CatSequence: clseval.DisplayOrder,
              RatingId: 0,
              Description: clseval.Description,
              Detail: '',
              StudentEvaluationId: 0,
              ClassEvaluationId: clseval.ClassEvaluationId,
              Active: 0,
              EvaluationTypeId: _searchEvaluationTypeId,
              ExamId: 0,
              MultipleAnswer: 0,
              StudentEvaluationAnswers: []
            }
          }
          this.StudentEvaluationList.push(item);
        })
        console.log("this.StudentEvaluationList", this.StudentEvaluationList)
        this.dataSource = new MatTableDataSource<IStudentEvaluation>(this.StudentEvaluationList);
        this.loadingFalse();
      });

  }
  GetStudents() {

    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'StudentId',
      'ClassId',
      'RollNo',
      'SectionId'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student($select=FirstName,LastName)"]
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Students = data.value.map(student => {
            var _classNameobj = this.Classes.filter(c => c.ClassId == student.ClassId);
            var _className = '';
            if (_classNameobj.length > 0)
              _className = _classNameobj[0].ClassName;

            var _Section = '';
            var _sectionobj = this.Sections.filter(f => f.MasterDataId == student.SectionId);
            if (_sectionobj.length > 0)
              _Section = _sectionobj[0].MasterDataName;

            var _lastname = student.Student.LastName == null ? '' : " " + student.Student.LastName;
            var _RollNo = student.RollNo;
            var _name = student.Student.FirstName + _lastname;
            var _fullDescription = _name + " - " + _className + " - " + _Section + " - " + _RollNo;
            return {
              StudentClassId: student.StudentClassId,
              StudentId: student.StudentId,
              Name: _fullDescription
            }
          })
        }
        this.loading = false; this.PageLoading = false;
      })
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
              ClassGroupId: e.ClassGroupId
            })
        })
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
    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.QuestionnaireTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
    this.EvaluationTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.EVALUATIONTYPE);
    this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
    this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
    this.GetExams();
    this.GetClassSubjects();
    this.GetClassEvaluations();
    this.GetStudents();
    //this.GetStudentEvaluation();
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
      'MultipleAnswer',
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
  //QuestionnaireTypeId: any[];
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}



  //   allRowsExpanded: boolean = false;
//   expandedElement: any;
//   isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');

//   LoginUserDetail: any[] = [];
//   CurrentRow: any = {};
//   Students = [];
//   Ratings = [];
//   SelectedApplicationId = 0;
//   StudentClassId = 0;
//   Permission = '';
//   StandardFilter = '';
//   loading = false;
//   StudentEvaluationList: any[] = [];
//   SelectedBatchId = 0;
//   Categories = [];
//   SubCategories = [];
//   Classes = [];
//   ClassEvaluations = [];
//   RatingOptions = [];
//   dataSource: MatTableDataSource<any>;
//   allMasterData = [];
//   Sections = [];
//   ExamId = 0;
//   StudentEvaluationData = {
//     StudentEvaluationId: 0,
//     ClassEvaluationId: 0,
//     RatingId: 0,
//     Detail: '',
//     SubCategories: [],
//     StudentClassId: 0,
//     OrgId: 0,
//     Active: 0
//   };
//   filteredOptions: Observable<IStudent[]>;
//   StudentEvaluationForUpdate = [];
//   displayedColumns = [
//     'CategoryName'
//   ];
//   searchForm: FormGroup;
//   constructor(private servicework: SwUpdate,
//     private contentservice: ContentService,
//     private dataservice: NaomitsuService,
//     private tokenstorage: TokenStorageService,
//     private nav: Router,
//     private fb: FormBuilder
//   ) { }

//   ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
//     debugger;
//     this.searchForm = this.fb.group({
//       searchStudentName: [0]
//     });
//     this.filteredOptions = this.searchForm.get("searchStudentName").valueChanges
//       .pipe(
//         startWith(''),
//         map(value => typeof value === 'string' ? value : value.Name),
//         map(Name => Name ? this._filter(Name) : this.Students.slice())
//       );
//     this.StudentClassId = this.tokenstorage.getStudentClassId();
//     this.PageLoad();
//   }

//   PageLoad() {
//     this.loading = true;
//     this.LoginUserDetail = this.tokenstorage.getUserDetail();
//     if (this.LoginUserDetail == null)
//       this.nav.navigate(['/auth/login']);
//     else {
//       var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.STUDENT.STUDENTAPROFILE)
//       if (perObj.length > 0) {
//         this.Permission = perObj[0].permission;
//       }

//       if (this.Permission != 'deny') {
//         this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
//         this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
//         this.GetMasterData();
//         if (this.Classes.length == 0) {
//           this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
//             this.Classes = [...data.value];
//           });
//         }

//       }
//     }
//   }

//   delete(element) {
//     let toupdate = {
//       Active: element.Active == 1 ? 0 : 1
//     }
//     this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
//       .subscribe(
//         (data: any) => {
//           // this.GetApplicationRoles();
//           this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

//         });
//   }

//   AddNew() {
//     var newItem = {
//       StudentEvaluationId: 0,
//       ClassEvaluationId: 0,
//       RatingId: 0,
//       Detail: '',
//       SubCategories: [],
//       StudentClassId: 0,
//       Active: 0,
//       Action: false
//     }
//     this.StudentEvaluationList = [];
//     this.StudentEvaluationList.push(newItem);

//     this.dataSource = new MatTableDataSource(this.StudentEvaluationList);
//   }

//   loadingFalse() {
//     this.loading = false; this.PageLoading=false;
//   }
//   private _filter(name: string): IStudent[] {

//     const filterValue = name.toLowerCase();
//     return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

//   }
//   displayFn(user: IStudent): string {
//     return user && user.Name ? user.Name : '';
//   }
//   GetStudentEvaluation() {
//     debugger;
//     this.loading = true;
//     this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
//     var _ClassId = +this.tokenstorage.getClassId();
//     let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
//     this.StudentClassId = this.searchForm.get("searchStudentName").value.StudentClassId;

//     if (this.StudentClassId != undefined)
//       filterStr += ' and StudentClassId eq ' + this.StudentClassId;
//     else {
//       this.loading = false; this.PageLoading=false;
//       this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
//       return;
//     }
//     let list: List = new List();
//     list.fields = [
//       'StudentEvaluationId,StudentClassId,ClassEvaluationId,RatingId,Detail,Active'
//     ];

//     list.PageName = "StudentEvaluations";
//     list.filter = [filterStr];
//     this.StudentEvaluationList = [];
//     this.dataservice.get(list)
//       .subscribe((data: any) => {
//         debugger;

//         var SelectedClassEvaluation = this.ClassEvaluations.filter(f => f.ClassId == _ClassId);
//         this.Categories = this.Categories.filter(f => {
//           return SelectedClassEvaluation.filter(s => s.ClassEvalCategoryId == f.MasterDataId).length > 0
//         });

//         SelectedClassEvaluation.forEach(clseval => {
//           var existing = data.value.filter(f => f.ClassEvaluationId == clseval.ClassEvaluationId);
//           if (clseval.RatingOptionId > 0)
//             clseval.Ratings = this.allMasterData.filter(f => f.ParentId == clseval.RatingOptionId);
//           else
//             clseval.Ratings = [];
//           clseval.StudentClassId = this.StudentClassId;
//           clseval.CatSequence = clseval.Sequence;
//           //clseval.ItemSequence = existing[0].Sequence;
//           if (existing.length > 0) {
//             clseval.RatingId = existing[0].RatingId==null?0:existing[0].RatingId;
//             clseval.Detail = existing[0].Detail;
//             clseval.StudentEvaluationId = existing[0].StudentEvaluationId;
//             clseval.Active = existing[0].Active;
//           }
//           else {
//             clseval.Active = 0;
//             clseval.StudentEvaluationId = 0;
//             clseval.Detail = '';
//             clseval.RatingId = 0;
//           }
//           this.StudentEvaluationList.push(clseval);
//         })

//         //preparing nested profile under category.
//         var result = this.Categories.map(m=>{
//           m.CategoryName = m.MasterDataName;
//           m.Profile = this.StudentEvaluationList.filter(f=>f.ClassEvalCategoryId == m.MasterDataId);
//            return m;
//         })

//         console.log("this.StudentEvaluationList", result)
//         const rows = [];
//         result.forEach(element => rows.push(element, { detailRow: true, element }));

//         this.dataSource = new MatTableDataSource<any>(rows);
//         this.loadingFalse();
//       });

//   }

//   GetMasterData() {

//     this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
//       .subscribe((data: any) => {
//         this.allMasterData = [...data.value];
//         this.Categories = this.getDropDownData(globalconstants.MasterDefinitions.school.PROFILECATEGORY);
//         this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
//         this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
//         this.GetClassEvaluations();
//         this.GetStudents();
//       });
//   }
//   SelectSubCategory(pCategoryId) {
//     this.SubCategories = this.allMasterData.filter(f => f.ParentId == pCategoryId.value);
//   }
//   onBlur(row) {
//     row.Action = true;
//   }
//   CategoryChanged(row) {
//     debugger;
//     row.Action = true;
//     //row.SubCategories = this.Categories.filter(f=>f.MasterDataId == row.CategoryId);
//     var item = this.StudentEvaluationList.filter(f => f.StudentEvaluationId == row.StudentEvaluationId);
//     item[0].SubCategories = this.allMasterData.filter(f => f.ParentId == row.CategoryId);

//     ////console.log("dat", this.StudentEvaluationList);
//     this.dataSource = new MatTableDataSource(this.StudentEvaluationList);


//   }
//   UpdateActive(row, event) {
//     row.Active = event.checked ? 1 : 0;
//     row.Action = true;
//   }
//   getDropDownData(dropdowntype) {
//     let Id = 0;
//     let Ids = this.allMasterData.filter((item, indx) => {
//       return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
//     })
//     if (Ids.length > 0) {
//       Id = Ids[0].MasterDataId;
//       return this.allMasterData.filter((item, index) => {
//         return item.ParentId == Id
//       })
//     }
//     else
//       return [];

//   }
//   GetStudents() {

//     let list: List = new List();
//     list.fields = [
//       'StudentClassId',
//       'StudentId',
//       'ClassId',
//       'RollNo',
//       'SectionId'
//     ];

//     list.PageName = "StudentClasses";
//     list.lookupFields = ["Student($select=FirstName,LastName)"]
//     list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

//     this.dataservice.get(list)
//       .subscribe((data: any) => {
//         //debugger;
//         //  //console.log('data.value', data.value);
//         if (data.value.length > 0) {
//           this.Students = data.value.map(student => {
//             var _classNameobj = this.Classes.filter(c => c.ClassId == student.ClassId);
//             var _className = '';
//             if (_classNameobj.length > 0)
//               _className = _classNameobj[0].ClassName;

//             var _Section = '';
//             var _sectionobj = this.Sections.filter(f => f.MasterDataId == student.SectionId);
//             if (_sectionobj.length > 0)
//               _Section = _sectionobj[0].MasterDataName;

//             var _RollNo = student.RollNo;
//             var _name = student.Student.FirstName + " " + student.Student.LastName;
//             var _fullDescription = _name + " - " + _className + " - " + _Section + " - " + _RollNo;
//             return {
//               StudentClassId: student.StudentClassId,
//               StudentId: student.StudentId,
//               Name: _fullDescription
//             }
//           })
//         }
//         this.loading = false; this.PageLoading=false;
//       })
//   }
//   GetClassEvaluations() {

//     ////console.log(this.LoginUserDetail);

//     let list: List = new List();
//     list.fields = [
//       'ClassEvaluationId',
//       'ClassEvalCategoryId',
//       //'ClassEvalSubCategoryId',
//       'ClassId',
//       'Description',

//       //'RatingOptionId'
//     ];

//     list.PageName = "ClassEvaluations";
//     list.lookupFields["ClassEvaluationOptions($select=AnswerOptionsId,Title,Value,Point,Correct)"];
//     list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

//     this.dataservice.get(list)
//       .subscribe((data: any) => {
//         //debugger;
//         //  //console.log('data.value', data.value);
//         if (data.value.length > 0) {
//           this.ClassEvaluations = data.value.map(clseval => {
//             var _categoryName = ''
//             var catobj = this.allMasterData.filter(f => f.MasterDataId == clseval.ClassEvalCategoryId)
//             if (catobj.length > 0)
//               _categoryName = catobj[0].MasterDataName;
//             var _subCategoryName = '';
//             var subcatobj = this.allMasterData.filter(f => f.MasterDataId == clseval.ClassEvalSubCategoryId)
//             if (subcatobj.length > 0)
//               _subCategoryName = subcatobj[0].MasterDataName;
//             clseval.CategoryName = _categoryName;
//             clseval.SubCategoryName = _subCategoryName;
//             return clseval;
//           })
//         }
//         this.loadingFalse();
//       })
//   }

// }
// export interface IStudentEvaluation {
//   StudentEvaluationId: number;
//   ClassEvaluationId: number;
//   RatingId: number;
//   Detail: string;
//   StudentClassId: number;
//   SubCategories: any[];
//   Active: number;
//   Action: boolean;
// }
// export interface IStudent {
//   StudentClassId: number;
//   StudentId: number;
//   Name: string;
// }


