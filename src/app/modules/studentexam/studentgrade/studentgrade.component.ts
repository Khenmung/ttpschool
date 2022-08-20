import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import {SwUpdate} from '@angular/service-worker';
@Component({
  selector: 'app-studentgrade',
  templateUrl: './studentgrade.component.html',
  styleUrls: ['./studentgrade.component.scss']
})
export class StudentgradeComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paging: MatPaginator;
  ClassGroups = [];
  SubjectCategory = [];
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  StudentGradeListName = 'StudentGrades';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;
  StudentGradeList: IStudentGrade[] = [];
  filteredOptions: Observable<IStudentGrade[]>;
  dataSource: MatTableDataSource<IStudentGrade>;
  allMasterData = [];
  StudentGrade = [];
  Permission = 'deny';
  Classes = [];
  ExamStatus = [];
  StudentGradeData = {
    StudentGradeId: 0,
    GradeName: '',
    Formula: '',
    ClassGroupId: 0,
    SubjectCategoryId: 0,
    GradeStatusId: 0,
    Sequence: 0,
    Points: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    "StudentGradeId",
    "GradeName",
    "Formula",
    "Points",
    "ClassGroupId",
    "SubjectCategoryId",
    "GradeStatusId",
    "Sequence",
    "Active",
    "Action"
  ];
  SelectedApplicationId = 0;
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
    //debugger;
    this.searchForm = this.fb.group({
      searchClassGroupId: [0],
      searchSubjectCategoryId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //this.EmployeeId = +this.tokenstorage.getEmployeeId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.EXAM.STUDENTGRADE);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu'])
      }
      else {

        this.GetMasterData();
        this.Getclassgroups();
      }
    }
  }

  AddNew() {

    var newdata = {
      StudentGradeId: 0,
      GradeName: '',
      Formula: '',
      ClassGroupId: 0,
      SubjectCategoryId: 0,
      GradeStatusId: 0,
      Sequence: 0,
      Points: 0,
      Active: 0,
      Action: false
    };
    this.StudentGradeList = [];
    this.StudentGradeList.push(newdata);
    this.dataSource = new MatTableDataSource<IStudentGrade>(this.StudentGradeList);
    this.dataSource.paginator = this.paging;
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    if (row.ClassGroupId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class group.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    row.GradeName = globalconstants.encodeSpecialChars(row.GradeName);
    if (row.Sequence > 250) {
      this.loading = false;
      this.contentservice.openSnackBar("Sequence should not be greater than 250.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.Points > 250) {
      this.loading = false;
      this.contentservice.openSnackBar("Points should not be greater than 250.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    let checkFilterString = "GradeName eq '" + row.GradeName + "' and OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and ClassGroupId eq " + row.ClassGroupId
    if (row.SubjectCategoryId == null || row.SubjectCategoryId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select subject category.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    checkFilterString += " and SubjectCategoryId eq " + row.SubjectCategoryId

    //+ " and BatchId eq " + this.SelectedBatchId;

    if (row.StudentGradeId > 0)
      checkFilterString += " and StudentGradeId ne " + row.StudentGradeId;
    let list: List = new List();
    list.fields = ["StudentGradeId"];
    list.PageName = this.StudentGradeListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.StudentGradeData.StudentGradeId = row.StudentGradeId;
          this.StudentGradeData.Active = row.Active;
          this.StudentGradeData.GradeName = row.GradeName;
          this.StudentGradeData.ClassGroupId = row.ClassGroupId;
          this.StudentGradeData.SubjectCategoryId = row.SubjectCategoryId;
          this.StudentGradeData.GradeStatusId = row.GradeStatusId;
          this.StudentGradeData.Formula = row.Formula;
          this.StudentGradeData.Sequence = row.Sequence;
          this.StudentGradeData.Points = row.Points;
          this.StudentGradeData.BatchId = this.SelectedBatchId;
          this.StudentGradeData.OrgId = this.LoginUserDetail[0]["orgId"];
          //console.log("this.StudentGradeData", this.StudentGradeData);
          if (this.StudentGradeData.StudentGradeId == 0) {
            this.StudentGradeData["CreatedDate"] = new Date();
            this.StudentGradeData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.StudentGradeData["UpdatedDate"] = new Date();
            delete this.StudentGradeData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.StudentGradeData["CreatedDate"];
            delete this.StudentGradeData["CreatedBy"];
            this.StudentGradeData["UpdatedDate"] = new Date();
            this.StudentGradeData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.StudentGradeListName, this.StudentGradeData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.StudentGradeId = data.StudentGradeId;
          row.GradeName = globalconstants.decodeSpecialChars(row.GradeName);
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.StudentGradeListName, this.StudentGradeData, this.StudentGradeData.StudentGradeId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          row.GradeName = globalconstants.decodeSpecialChars(row.GradeName);
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  Getclassgroups() {
    this.contentservice.GetClassGroups(this.LoginUserDetail[0]['orgId'])
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassGroups = [...data.value];
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
      });
  }
  GetStudentGrade() {

    this.loading = true;
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    //" and BatchId eq " + this.SelectedBatchId;

    var _ClassGroupId = this.searchForm.get("searchClassGroupId").value;
    var _SubjectCategoryId = this.searchForm.get("searchSubjectCategoryId").value;
    if (_ClassGroupId > 0) {
      filterStr += " and ClassGroupId eq " + _ClassGroupId;
    }
    if (_SubjectCategoryId > 0) {
      filterStr += " and SubjectCategoryId eq " + _SubjectCategoryId;
    }
    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.StudentGradeListName;
    list.filter = [filterStr];
    this.StudentGradeList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.StudentGradeList = data.value.map(f => {
            f.GradeName = globalconstants.decodeSpecialChars(f.GradeName);
            return f;
          });
          this.StudentGradeList = this.StudentGradeList.sort((a, b) => a.Sequence - b.Sequence);
        }
        this.dataSource = new MatTableDataSource<IStudentGrade>(this.StudentGradeList);
        this.dataSource.paginator = this.paging;
        this.loadingFalse();
      });
  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.SubjectCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTCATEGORY)
        this.ExamStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS)
        //this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP)
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
          this.loading = false; this.PageLoading = false;
        });
      });
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
}
export interface IStudentGrade {
  StudentGradeId: number;
  GradeName: string;
  Formula: string;
  SubjectCategoryId: number;
  GradeStatusId: number;
  ClassGroupId: number;
  Sequence: number;
  Points: number;
  Active: number;
  Action: boolean;
}
