import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-StudentEvaluation',
  templateUrl: './StudentEvaluation.component.html',
  styleUrls: ['./StudentEvaluation.component.scss']
})
export class StudentEvaluationComponent implements OnInit {
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
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
  StudentEvaluationForUpdate = [];
  displayedColumns = [
    'StudentEvaluationId',
    'CategoryName',
    'SubCategoryName',
    'Description',
    'Detail',
    'RatingId',
    'Active',
    'Action'
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private nav: Router,
    private shareddata: SharedataService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    debugger;
    this.searchForm = this.fb.group({
      searchCategoryId: [0],
      searchSubCategoryId: [0],
      searchProfileName: ['']
    });
    // this.filteredOptions = this.searchForm.get("searchStudentName").valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => typeof value === 'string' ? value : value.Name),
    //     map(Name => Name ? this._filter(Name) : this.Students.slice())
    //   );
    this.StudentClassId = this.tokenstorage.getStudentClassId();
    this.PageLoad();
  }
  // private _filter(name: string): IStudent[] {

  //   const filterValue = name.toLowerCase();
  //   return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  // }
  // displayFn(user: IStudent): string {
  //   return user && user.Name ? user.Name : '';
  // }

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
          this.alert.success("Data deleted successfully.", this.optionAutoClose);

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
  UpdateOrSave(row) {

    //debugger;
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
          //this.alert.error("Record already exists!", this.optionsNoAutoClose);
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.AlertCloseText, globalconstants.RedBackground);
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
              RatingId: row.RatingId,
              Detail: row.Detail,
              Active: row.Active,
              OrgId: this.LoginUserDetail[0]["orgId"],
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
            this.insert(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {
    this.dataservice.postPatch('StudentEvaluations', this.StudentEvaluationForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.StudentEvaluationId = data.StudentEvaluationId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.AlertCloseText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    //console.log("updating",this.StudentEvaluationForUpdate);
    this.dataservice.postPatch('StudentEvaluations', this.StudentEvaluationForUpdate[0], this.StudentEvaluationForUpdate[0].StudentEvaluationId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.AlertCloseText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetStudentEvaluation() {
    //debugger;
    this.loading = true;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    var _ClassId = +this.tokenstorage.getClassId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and StudentClassId eq ' + this.StudentClassId
    //var _classId = this.searchForm.get("searchClassId").value;
    var _searchClassEvalCategoryId = this.searchForm.get("searchCategoryId").value;
    var _searchClassEvalSubCategoryId = this.searchForm.get("searchSubCategoryId").value;
    //var _classId = this.searchForm.get("searchClassId").value;
    // if(_classId ==0)
    // {
    //   this.loading=false;
    //   this.contentservice.openSnackBar("Please select class.",globalconstants.AlertCloseText,globalconstants.BlueBackground);
    //   return;
    // }
    //filterStr += ' and ClassId eq ' + _classId;

    // if (_searchClassEvalCategoryId > 0)
    //   filterStr += ' and ClassEvalCategoryId eq ' + _searchClassEvalCategoryId;

    // if (_searchClassEvalSubCategoryId > 0)
    //   filterStr += ' and ClassEvalSubCategoryId eq ' + _searchClassEvalSubCategoryId;

    let list: List = new List();
    list.fields = [
      'StudentEvaluationId,StudentClassId,ClassEvaluationId,RatingId,Detail,Active'
    ];

    list.PageName = "StudentEvaluations";
    //list.lookupFields = ["StudentClass($select=ClassId)"];

    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        var SelectedClassEvaluation = this.ClassEvaluations.filter(f => f.ClassId == _ClassId);

        if (_searchClassEvalCategoryId > 0)
          SelectedClassEvaluation = SelectedClassEvaluation.filter(f => f.ClassEvalCategoryId == _searchClassEvalCategoryId)
        if (_searchClassEvalSubCategoryId > 0)
          SelectedClassEvaluation = SelectedClassEvaluation.filter(f => f.ClassEvalSubCategoryId == _searchClassEvalSubCategoryId)


        SelectedClassEvaluation.forEach(clseval => {
          var existing = data.value.filter(f => f.ClassEvaluationId == clseval.ClassEvaluationId);
          if (clseval.RatingOptionId > 0)
            clseval.Ratings = this.allMasterData.filter(f => f.ParentId == clseval.RatingOptionId);
          else
            clseval.Ratings = [];
          clseval.StudentClassId = this.StudentClassId;
          
          if (existing.length > 0) {
            clseval.RatingId = existing[0].RatingId;
            clseval.Detail = existing[0].Detail;
            clseval.StudentEvaluationId = existing[0].StudentEvaluationId;
            clseval.Active =existing[0].Active;
          }
          else {
            clseval.Active =0;
            clseval.StudentEvaluationId = 0;
            clseval.Detail = '';
            clseval.RatingId = 0;
          }
          this.StudentEvaluationList.push(clseval);
        })
        console.log("this.StudentEvaluationList", this.StudentEvaluationList)
        this.dataSource = new MatTableDataSource<IStudentEvaluation>(this.StudentEvaluationList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Categories = this.getDropDownData(globalconstants.MasterDefinitions.school.PROFILECATEGORY);
        //this.Ratings = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
        this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
        this.GetClassEvaluations();
        //this.GetStudentEvaluation();
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


