import { trigger, state, style, transition, animate } from '@angular/animations';
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
  allRowsExpanded: boolean = false;
  expandedElement: any;
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  Students = [];
  Ratings = [];
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  StudentEvaluationList: any[] = [];
  SelectedBatchId = 0;
  Categories = [];
  SubCategories = [];
  Classes = [];
  ClassEvaluations = [];
  RatingOptions = [];
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  Sections = [];
  ExamId = 0;
  StudentEvaluationData = {
    StudentEvaluationId: 0,
    ClassEvaluationId: 0,
    RatingId: 0,
    Detail: '',
    SubCategories: [],
    StudentClassId: 0,
    OrgId: 0,
    Active: 0
  };
  filteredOptions: Observable<IStudent[]>;
  StudentEvaluationForUpdate = [];
  displayedColumns = [
    'CategoryName'
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
      searchStudentName: [0]
    });
    this.filteredOptions = this.searchForm.get("searchStudentName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      );
    this.StudentClassId = this.tokenstorage.getStudentClassId();
    this.PageLoad();
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
      SubCategories: [],
      StudentClassId: 0,
      Active: 0,
      Action: false
    }
    this.StudentEvaluationList = [];
    this.StudentEvaluationList.push(newItem);

    this.dataSource = new MatTableDataSource(this.StudentEvaluationList);
  }

  loadingFalse() {
    this.loading = false;
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  GetStudentEvaluation() {
    debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    var _ClassId = +this.tokenstorage.getClassId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.StudentClassId = this.searchForm.get("searchStudentName").value.StudentClassId;

    if (this.StudentClassId != undefined)
      filterStr += ' and StudentClassId eq ' + this.StudentClassId;
    else {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let list: List = new List();
    list.fields = [
      'StudentEvaluationId,StudentClassId,ClassEvaluationId,RatingId,Detail,Active'
    ];

    list.PageName = "StudentEvaluations";
    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;

        var SelectedClassEvaluation = this.ClassEvaluations.filter(f => f.ClassId == _ClassId);
        this.Categories = this.Categories.filter(f => {
          return SelectedClassEvaluation.filter(s => s.ClassEvalCategoryId == f.MasterDataId).length > 0
        });
        
        SelectedClassEvaluation.forEach(clseval => {
          var existing = data.value.filter(f => f.ClassEvaluationId == clseval.ClassEvaluationId);
          if (clseval.RatingOptionId > 0)
            clseval.Ratings = this.allMasterData.filter(f => f.ParentId == clseval.RatingOptionId);
          else
            clseval.Ratings = [];
          clseval.StudentClassId = this.StudentClassId;
          clseval.CatSequence = clseval.Sequence;
          //clseval.ItemSequence = existing[0].Sequence;
          if (existing.length > 0) {
            clseval.RatingId = existing[0].RatingId==null?0:existing[0].RatingId;
            clseval.Detail = existing[0].Detail;
            clseval.StudentEvaluationId = existing[0].StudentEvaluationId;
            clseval.Active = existing[0].Active;
          }
          else {
            clseval.Active = 0;
            clseval.StudentEvaluationId = 0;
            clseval.Detail = '';
            clseval.RatingId = 0;
          }
          this.StudentEvaluationList.push(clseval);
        })

        //preparing nested profile under category.
        var result = this.Categories.map(m=>{
          m.CategoryName = m.MasterDataName;
          m.Profile = this.StudentEvaluationList.filter(f=>f.ClassEvalCategoryId == m.MasterDataId);
           return m;
        })
        
        console.log("this.StudentEvaluationList", result)
        const rows = [];
        result.forEach(element => rows.push(element, { detailRow: true, element }));

        this.dataSource = new MatTableDataSource<any>(rows);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Categories = this.getDropDownData(globalconstants.MasterDefinitions.school.PROFILECATEGORY);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
        this.GetClassEvaluations();
        this.GetStudents();
      });
  }
  SelectSubCategory(pCategoryId) {
    this.SubCategories = this.allMasterData.filter(f => f.ParentId == pCategoryId.value);
  }
  onBlur(row) {
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

            var _RollNo = student.RollNo;
            var _name = student.Student.FirstName + " " + student.Student.LastName;
            var _fullDescription = _name + " - " + _className + " - " + _Section + " - " + _RollNo;
            return {
              StudentClassId: student.StudentClassId,
              StudentId: student.StudentId,
              Name: _fullDescription
            }
          })
        }
        this.loading = false;
      })
  }
  GetClassEvaluations() {

    ////console.log(this.LoginUserDetail);

    let list: List = new List();
    list.fields = [
      'ClassEvaluationId',
      'ClassEvalCategoryId',
      'ClassEvalSubCategoryId',
      'ClassId',
      'Description',
      'RatingOptionId'
    ];

    list.PageName = "ClassEvaluations";
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
  SubCategories: any[];
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}


