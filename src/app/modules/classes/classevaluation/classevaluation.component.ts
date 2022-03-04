import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-ClassEvaluation',
  templateUrl: './ClassEvaluation.component.html',
  styleUrls: ['./ClassEvaluation.component.scss']
})
export class ClassEvaluationComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
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
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  ClassEvaluationList: IClassEvaluation[] = [];
  SelectedBatchId = 0;
  Categories = [];
  SubCategories = [];
  Classes = [];
  //Batches = [];
  //Sections = [];
  RatingOptions = [];
  //Students: IStudent[] = [];
  filteredOptions: Observable<IClassEvaluation[]>;
  dataSource: MatTableDataSource<IClassEvaluation>;
  allMasterData = [];

  ExamId = 0;
  ClassEvaluationData = {
    ClassEvaluationId: 0,
    ClassEvalCategoryId: 0,
    ClassEvalSubCategoryId: 0,
    RatingOptionId: 0,
    ClassId: 0,
    Description: '',
    DisplayOrder:0,
    OrgId: 0,
    Active: 0,
  };
  ClassEvaluationForUpdate = [];
  displayedColumns = [
    'ClassEvaluationId',
    'Description',
    'ClassId',
    'ClassEvalCategoryId',
    'ClassEvalSubCategoryId',
    'RatingOptionId',
    'DisplayOrder',
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
    this.StudentClassId = this.tokenstorage.getStudentClassId();
    this.searchForm = this.fb.group({
      searchProfileName: [''],
      searchCategoryId: [0],
      searchSubCategoryId: [0],
      searchClassId: [0]
    })
    this.PageLoad();
  }
  // private _filter(name: string): IStudent[] {

  //   const filterValue = name.toLowerCase();
  //   return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  // }
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

      }
    }
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
          this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

        });
  }
  AddNew() {
    var newItem = {
      ClassEvaluationId: 0,
      ClassEvalCategoryId: 0,
      ClassEvalSubCategoryId: 0,
      SubCategories: [],
      ClassId: 0,
      Description: '',
      DisplayOrder:0,
      RatingOptionId: 0,
      Active: 0,
      Action: false
    }
    this.ClassEvaluationList = [];
    this.ClassEvaluationList.push(newItem);
    this.dataSource = new MatTableDataSource(this.ClassEvaluationList);
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "ClassId eq " + row.ClassId +
      " and ClassEvalCategoryId eq " + row.ClassEvalCategoryId +
      " and ClassEvalSubCategoryId eq " + row.ClassEvalSubCategoryId +
      " and Description eq '" + row.Description + "'";


    if (row.ClassEvaluationId > 0)
      checkFilterString += " and ClassEvaluationId ne " + row.ClassEvaluationId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["ClassEvaluationId"];
    list.PageName = "ClassEvaluations";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
          //this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
        }
        else {
          //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
          this.ClassEvaluationForUpdate = [];;
          ////console.log("inserting-1",this.ClassEvaluationForUpdate);
          this.ClassEvaluationForUpdate.push(
            {
              ClassEvaluationId: row.ClassEvaluationId,
              ClassId: row.ClassId,
              Active: row.Active,
              ClassEvalCategoryId: row.ClassEvalCategoryId,
              ClassEvalSubCategoryId: row.ClassEvalSubCategoryId,
              RatingOptionId: row.RatingOptionId,
              Description: row.Description,
              DisplayOrder: row.DisplayOrder,
              OrgId: this.LoginUserDetail[0]["orgId"]
            });
          console.log('dta', this.ClassEvaluationForUpdate);

          if (this.ClassEvaluationForUpdate[0].ClassEvaluationId == 0) {
            this.ClassEvaluationForUpdate[0]["CreatedDate"] = new Date();
            this.ClassEvaluationForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ClassEvaluationForUpdate[0]["UpdatedDate"] = new Date();
            delete this.ClassEvaluationForUpdate[0]["UpdatedBy"];
            delete this.ClassEvaluationForUpdate[0]["SubCategories"];
            ////console.log("inserting1",this.ClassEvaluationForUpdate);
            this.insert(row);
          }
          else {
            this.ClassEvaluationForUpdate[0]["CreatedDate"] = new Date(row.CreatedDate);
            this.ClassEvaluationForUpdate[0]["CreatedBy"] = row.CreatedBy;
            this.ClassEvaluationForUpdate[0]["UpdatedDate"] = new Date();
            delete this.ClassEvaluationForUpdate[0]["SubCategories"];
            delete this.ClassEvaluationForUpdate[0]["UpdatedBy"];
            //this.ClassEvaluationForUpdate[0]["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            //this.insert(row);
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {
    //console.log("inserting",this.ClassEvaluationForUpdate);
    //debugger;
    this.dataservice.postPatch('ClassEvaluations', this.ClassEvaluationForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.ClassEvaluationId = data.ClassEvaluationId;
          row.Action = false;
          //this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    //console.log("updating",this.ClassEvaluationForUpdate);
    this.dataservice.postPatch('ClassEvaluations', this.ClassEvaluationForUpdate[0], this.ClassEvaluationForUpdate[0].ClassEvaluationId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetClassEvaluation() {
    //debugger;
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    var _classId = this.searchForm.get("searchClassId").value;
    var _categoryId = this.searchForm.get("searchCategoryId").value;
    var _subCategoryId = this.searchForm.get("searchSubCategoryId").value;
    var _description = this.searchForm.get("searchProfileName").value;

    if (_classId > 0)
      filterStr += " and ClassId eq " + _classId
    else {
      this.loading=false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.BlueBackground);
      return;
    }

    if (_categoryId > 0)
      filterStr += " and ClassEvalCategoryId eq " + _categoryId
    if (_subCategoryId > 0)
      filterStr += " and ClassEvalSubCategoryId eq " + _subCategoryId
    if (_description.length > 0)
      filterStr += " and Description eq " + _description;


    //filterStr += ' and StudentClassId eq ' + this.StudentClassId
    let list: List = new List();
    list.fields = [
      'ClassEvaluationId',
      'ClassEvalCategoryId',
      'ClassEvalSubCategoryId',
      'Description',
      'RatingOptionId',
      'ClassId',
      'DisplayOrder',
      'Active'
    ];

    list.PageName = "ClassEvaluations";

    list.filter = [filterStr];
    this.ClassEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.ClassEvaluationList = data.value.map(item => {
            return {
              ClassEvaluationId: item.ClassEvaluationId,
              Description: item.Description,
              ClassEvalCategoryId: item.ClassEvalCategoryId,
              ClassEvalSubCategoryId: item.ClassEvalCategoryId,
              SubCategories: this.allMasterData.filter(f => f.ParentId == item.ClassEvalCategoryId),
              RatingOptionId: item.RatingOptionId,
              ClassId: item.ClassId,
              DisplayOrder: item.DisplayOrder,
              Active: item.Active,
              Action: false
            }
          })
        }

        //console.log('ClassEvaluation', this.ClassEvaluationList)
        this.dataSource = new MatTableDataSource<IClassEvaluation>(this.ClassEvaluationList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Categories = this.getDropDownData(globalconstants.MasterDefinitions.school.PROFILECATEGORY);
        this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
        this.loading = false;
        //this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        //this.GetStudents();
        //this.GetClassEvaluation();
      });
  }
  onBlur(row) {
    row.Action = true;
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    //row.SubCategories = this.Categories.filter(f=>f.MasterDataId == row.CategoryId);
    var item = this.ClassEvaluationList.filter(f => f.ClassEvaluationId == row.ClassEvaluationId);
    item[0].SubCategories = this.allMasterData.filter(f => f.ParentId == row.ClassEvalCategoryId);

    ////console.log("dat", this.ClassEvaluationList);
    this.dataSource = new MatTableDataSource(this.ClassEvaluationList);


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
  // GetStudents() {

  //   ////console.log(this.LoginUserDetail);

  //   let list: List = new List();
  //   list.fields = [
  //     'StudentClassId',
  //     'StudentId',
  //     'ClassId',
  //     'RollNo',
  //     'SectionId'
  //   ];

  //   list.PageName = "StudentClasses";
  //   list.lookupFields = ["Student($select=FirstName,LastName)"]
  //   list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

  //   this.dataservice.get(list)
  //     .subscribe((data: any) => {
  //       //debugger;
  //       //  //console.log('data.value', data.value);
  //       if (data.value.length > 0) {
  //         this.Students = data.value.map(student => {
  //           var _name = student.Student.FirstName + " " + student.Student.LastName;
  //           var _fullDescription = _name; //+ " - " + _className + " - " + _Section + " - " + _RollNo;
  //           return {
  //             StudentClassId: student.StudentClassId,
  //             StudentId: student.StudentId,
  //             Name: _fullDescription
  //           }
  //         })
  //       }
  //       this.loadingFalse();
  //     })
  // }

}
export interface IClassEvaluation {
  ClassEvaluationId: number;
  ClassEvalCategoryId: number;
  ClassEvalSubCategoryId: number;
  SubCategories: any[];
  RatingOptionId: number;
  ClassId: number;
  Description: string;
  DisplayOrder:number;
  Active: number;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}



