import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {  Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-studentevaluation',
  templateUrl: './studentevaluation.component.html',
  styleUrls: ['./studentevaluation.component.scss']
})
export class StudentevaluationComponent implements OnInit {
@ViewChild(MatPaginator) paginator:MatPaginator;
@ViewChild(MatSort) sort:MatSort;
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
  StudentEvaluationList: IStudentEvaluation[] = [];
  SelectedBatchId = 0;
  Categories = [];
  SubCategories = [];
  Classes = [];
  //Batches = [];
  //Sections = [];
  RatingOptions =[];
  Students: IStudent[] = [];
  filteredOptions: Observable<IStudent[]>;
  dataSource: MatTableDataSource<IStudentEvaluation>;
  allMasterData = [];

  ExamId = 0;
  StudentEvaluationData = {
    StudentEvaluationId: 0,
    StudentEvalCategoryId: 0,
    StudentEvalSubCategoryId: 0,
    RatingOptionId: 0,
    RatingOrSubject: 0,
    ClassId: 0,
    Description: '',
    OrgId: 0,
    Active: 0,
  };
  StudentEvaluationForUpdate = [];
  displayedColumns = [
    'StudentEvaluationId',
    'ClassId',
    'StudentEvalCategoryId',
    'StudentEvalSubCategoryId',
    'Description',
    'RatingOptionId',
    'RatingOrSubjective',    
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
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.StudentClassId = this.tokenstorage.getStudentClassId();
    this.searchForm = this.fb.group({
      searchProfileName:[''],
      searchCategoryId:[0],
      searchSubCategoryId:[0],
      searchClassId:[0]
    })
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

      }
    }
  }
  SelectSubCategory(pCategoryId){
    this.SubCategories =  this.allMasterData.filter(f=>f.ParentId == pCategoryId.value);
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
      StudentEvalCategoryId: 0,
      StudentEvalSubCategoryId: 0,
      SubCategories: [],
      ClassId: 0,
      Description: '',
      RatingOptionId: 0,
      RatingOrSubjective: 0,
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
    let checkFilterString = "ClassId eq " + row.ClassId +
      " and StudentEvalCategoryId eq " + row.StudentEvalCategoryId + 
    " and StudentEvalSubCategoryId eq " + row.StudentEvalSubCategoryId +
    " and Description eq '" + row.Description + "'";


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
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistAlert,globalconstants.AddedAlert,globalconstants.RedAlert);
          //this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
          this.StudentEvaluationForUpdate = [];;
          ////console.log("inserting-1",this.StudentEvaluationForUpdate);
          this.StudentEvaluationForUpdate.push(
            {
              StudentEvaluationId: row.StudentEvaluationId,
              ClassId: row.ClassId,
              Active: row.Active,
              StudentEvalCategoryId: row.StudentEvalCategoryId,
              StudentEvalSubCategoryId: row.StudentEvalSubCategoryId,
              RatingOptionId: row.RatingOptionId,
              RatingOrSubjective: +row.RatingOrSubjective,
              Description: row.Description,
              OrgId: this.LoginUserDetail[0]["orgId"]
            });
            console.log('dta',this.StudentEvaluationForUpdate)
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
            //this.StudentEvaluationForUpdate[0]["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.insert(row);
            //this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {
    //console.log("inserting",this.StudentEvaluationForUpdate);
    //debugger;
    this.dataservice.postPatch('StudentEvaluations', this.StudentEvaluationForUpdate[0], 0, 'post')
      .subscribe(
        (data: any) => {
          row.StudentEvaluationId = data.StudentEvaluationId;
          row.Action = false;
          //this.alert.success("Data saved successfully.", this.optionAutoClose);
          this.contentservice.openSnackBar(globalconstants.AddedAlert,globalconstants.AlertCloseText,globalconstants.BlueAlert);
          this.loadingFalse()
        });
  }
  update(row) {
    //console.log("updating",this.StudentEvaluationForUpdate);
    this.dataservice.postPatch('StudentEvaluations', this.StudentEvaluationForUpdate[0], this.StudentEvaluationForUpdate[0].StudentEvaluationId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedAlert,globalconstants.AlertCloseText,globalconstants.BlueAlert);
          //this.alert.success("Data updated successfully.", this.optionAutoClose);
          this.loadingFalse();
        });
  }
  GetStudentEvaluation() {
    //debugger;
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and StudentClassId eq ' + this.StudentClassId
    let list: List = new List();
    list.fields = [
      'StudentEvaluationId',
      'StudentClassId',
      'StudentId',
      'StudentEvalCategoryId',
      'StudentEvalSubCategoryId',
      'Description',
      'RatingOptionId',
      'RatingOrSubjective',
      'Active'
    ];

    list.PageName = "StudentEvaluations";
    list.lookupFields = ["StudentClass($select=RollNo;$expand=Student($select=FirstName,LastName))"];
    list.filter = [filterStr];
    this.StudentEvaluationList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.StudentEvaluationList = data.value.map(item => {
            return {
              StudentEvaluationId: item.StudentEvaluationId,
              StudentClassId: item.StudentClassId,
              Description: item.Description,
              StudentEvalCategoryId: item.StudentEvalCategoryId,
              StudentEvalSubCategoryId: item.StudentEvalCategoryId,
              SubCategories: this.allMasterData.filter(f => f.ParentId == item.StudentEvalCategoryId),
              RatingOptionId: item.RatingOptionId,
              RatingOrSubjective: item.RatingOrSubjective,
              Active: item.Active,
              Action: false
            }
          })
        }

        //console.log('StudentEvaluation', this.StudentEvaluationList)
        this.dataSource = new MatTableDataSource<IStudentEvaluation>(this.StudentEvaluationList);
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
        //this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.GetStudents();
        this.GetStudentEvaluation();
      });
  }
  onBlur(row) {
    row.Action = true;
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    //row.SubCategories = this.Categories.filter(f=>f.MasterDataId == row.CategoryId);
    var item = this.StudentEvaluationList.filter(f => f.StudentEvaluationId == row.StudentEvaluationId);
    item[0].SubCategories = this.allMasterData.filter(f => f.ParentId == row.StudentEvalCategoryId);

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

    ////console.log(this.LoginUserDetail);

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
            var _name = student.Student.FirstName + " " + student.Student.LastName;
            var _fullDescription = _name; //+ " - " + _className + " - " + _Section + " - " + _RollNo;
            return {
              StudentClassId: student.StudentClassId,
              StudentId: student.StudentId,
              Name: _fullDescription
            }
          })
        }
        this.loadingFalse();
      })
  }

}
export interface IStudentEvaluation {
  StudentEvaluationId: number;
  StudentEvalCategoryId: number;
  StudentEvalSubCategoryId: number;
  SubCategories: any[];
  RatingOptionId: number;
  RatingOrSubjective: number;
  ClassId: number;
  Description: string;
  Active: number;
  Action: boolean;
}

export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}



