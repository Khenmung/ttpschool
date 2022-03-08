import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-ClassEvaluationOption',
  templateUrl: './ClassEvaluationOption.component.html',
  styleUrls: ['./ClassEvaluationOption.component.scss']
})
export class ClassEvaluationOptionComponent implements OnInit {
  @Input("ClassEvaluationId") ClassEvaluationId: number;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  StudentClassId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  ClassEvaluationOptionList: IClassEvaluationOption[] = [];
  SelectedBatchId = 0;
  Categories = [];
  SubCategories = [];
  Classes = [];
  //Batches = [];
  //Sections = [];
  RatingOptions = [];
  //Students: IStudent[] = [];
  filteredOptions: Observable<IClassEvaluationOption[]>;
  dataSource: MatTableDataSource<IClassEvaluationOption>;
  allMasterData = [];

  ClassEvaluationOptionData = {
    AnswerOptionsId: 0,
    Title: '',
    Value: '',
    Point: 0,
    Correct: 0,
    ClassEvaluationOptionId: 0,
    Active: 0
  };
  ClassEvaluationOptionForUpdate = [];
  displayedColumns = [
    'AnswerOptionsId',
    'Title',
    'Value',
    'Point',
    'Correct',
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
    this.PageLoad();
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
        //this.GetMasterData();
        // if (this.Classes.length == 0) {
        //   this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
        //     this.Classes = [...data.value];

        //   });

        // }

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
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  AddNew() {
    var newItem = {
      AnswerOptionsId: 0,
      Title: '',
      Value: '',
      Point: 0,
      Correct: 0,
      ClassEvaluationOptionId: 0,
      Active: 0,
      Action: false
    }
    this.ClassEvaluationOptionList = [];
    this.ClassEvaluationOptionList.push(newItem);
    this.dataSource = new MatTableDataSource(this.ClassEvaluationOptionList);
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "ClassId eq " + row.ClassId +
      " and ClassEvaluationId eq " + row.ClassEvaluationId +
      " and Title eq '" + row.Title + "'";

    if (row.ClassEvaluationOptionId > 0)
      checkFilterString += " and ClassEvaluationOptionId ne " + row.ClassEvaluationOptionId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["ClassEvaluationOptionId"];
    list.PageName = "ClassEvaluationOptions";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
        }
        else {
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
          this.ClassEvaluationOptionForUpdate = [];;
          this.ClassEvaluationOptionForUpdate.push(
            {
              AnswerOptionsId: 0,
              Title: row.Title,
              Value: row.Value,
              Point: row.Point,
              Correct: row.Correct,
              ClassEvaluationId: row.ClassEvaluationId,
              Active: row.Active,
              OrgId: this.LoginUserDetail[0]["orgId"]
            });
          console.log('dta', this.ClassEvaluationOptionForUpdate);

          if (this.ClassEvaluationOptionForUpdate[0].AnswerOptionsId == 0) {
            this.ClassEvaluationOptionForUpdate[0]["CreatedDate"] = new Date();
            this.ClassEvaluationOptionForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ClassEvaluationOptionForUpdate[0]["UpdatedDate"] = new Date();
            delete this.ClassEvaluationOptionForUpdate[0]["UpdatedBy"];
            this.insert(row);
          }
          else {
            this.ClassEvaluationOptionForUpdate[0]["CreatedDate"] = new Date(row.CreatedDate);
            this.ClassEvaluationOptionForUpdate[0]["CreatedBy"] = row.CreatedBy;
            this.ClassEvaluationOptionForUpdate[0]["UpdatedDate"] = new Date();
            delete this.ClassEvaluationOptionForUpdate[0]["UpdatedBy"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {
    this.dataservice.postPatch('ClassEvaluationOptions', this.ClassEvaluationOptionForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.AnswerOptionsId = data.AnswerOptionsId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {
    this.dataservice.postPatch('ClassEvaluationOptions', this.ClassEvaluationOptionForUpdate[0], this.ClassEvaluationOptionForUpdate[0].AnswerOptionsId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          //this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetClassEvaluationOption() {
    //debugger;
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    //var _classId = this.searchForm.get("searchClassId").value;
    //var _title = this.searchForm.get("searchTitle").value;

    if (this.ClassEvaluationId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.BlueBackground);
      return;
    }

    filterStr += " and ClassEvaluationId eq " + this.ClassEvaluationId

    let list: List = new List();
    list.fields = [
      'AnswerOptionsId',
      'Title',
      'Value',
      'Point',
      'Correct',
      'Active',
    ];

    list.PageName = "ClassEvaluationOptions";

    list.filter = [filterStr];
    this.ClassEvaluationOptionList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.ClassEvaluationOptionList = data.value.map(item => {
            item.Action = false;
            return item;
          })
        }

        this.dataSource = new MatTableDataSource<IClassEvaluationOption>(this.ClassEvaluationOptionList);
      
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Categories = this.getDropDownData(globalconstants.MasterDefinitions.school.PROFILECATEGORY);
        this.RatingOptions = this.getDropDownData(globalconstants.MasterDefinitions.school.RATINGOPTION);
        this.loading = false;
      });
  }
  onBlur(row) {
    row.Action = true;
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

}
export interface IClassEvaluationOption {
  AnswerOptionsId: number;
  Title: string;
  Value: string;
  Point: number;
  Correct: number;
  ClassEvaluationOptionId: number;
  Active: number;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}




