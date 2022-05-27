import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-studentgrade',
  templateUrl: './studentgrade.component.html',
  styleUrls: ['./studentgrade.component.scss']
})
export class StudentgradeComponent implements OnInit {
  @ViewChild(MatPaginator) paging: MatPaginator;
  ClassGroups =[];
  StudentGradeTypes = [];
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
  Classes =[];
  StudentGradeData = {
    StudentGradeId: 0,
    GradeName: '',
    Formula: '',
    ClassGroupId:0,
    GradeTypeId: 0,
    Sequence: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    "StudentGradeId",
    "GradeName",
    "Formula",
    "ClassGroupId",
    "GradeTypeId",
    "Sequence",
    "Active",
    "Action"
  ];
  SelectedApplicationId = 0;
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchClassGroupId: [0]
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
      }
    }
  }

  AddNew() {

    var newdata = {
      StudentGradeId: 0,
      GradeName: '',
      Formula: '',
      ClassGroupId:0,
      GradeTypeId: 0,
      Sequence: 0,
      Active: 0,
      Action:false
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
    let checkFilterString = "GradeName eq '" + row.GradeName + "' and OrgId eq " + this.LoginUserDetail[0]["orgId"] + 
    " and ClassGroupId eq "+ row.ClassGroupId +" and BatchId eq " + this.SelectedBatchId;

    if (row.StudentGradeId > 0)
      checkFilterString += " and StudentGradeId ne " + row.StudentGradeId;
    let list: List = new List();
    list.fields = ["StudentGradeId"];
    list.PageName = this.StudentGradeListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.StudentGradeData.StudentGradeId = row.StudentGradeId;
          this.StudentGradeData.Active = row.Active;
          this.StudentGradeData.GradeName = row.GradeName;
          this.StudentGradeData.ClassGroupId = row.ClassGroupId;
          this.StudentGradeData.GradeTypeId = row.GradeTypeId;
          this.StudentGradeData.Formula = row.Formula;
          this.StudentGradeData.Sequence = row.Sequence;
          this.StudentGradeData.BatchId = this.SelectedBatchId;
          this.StudentGradeData.OrgId = this.LoginUserDetail[0]["orgId"];
          console.log("this.StudentGradeData",this.StudentGradeData)
          if (this.StudentGradeData.StudentGradeId == 0) {
            this.StudentGradeData["CreatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            this.StudentGradeData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.StudentGradeData["UpdatedDate"] = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
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
    this.loading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.StudentGradeListName, this.StudentGradeData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.StudentGradeId = data.StudentGradeId;
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
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetStudentGrade() {
    debugger;

    this.loading = true;
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]  
    //" and BatchId eq " + this.SelectedBatchId;

    var _ClassGroupId = this.searchForm.get("searchClassGroupId").value;
    if(_ClassGroupId>0)
    {
      filterStr += " and ClassGroupId eq " + _ClassGroupId;
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
          this.StudentGradeList = [...data.value];
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
        this.StudentGradeTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADETYPE)
        this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP)
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
          this.loading = false;
        });

       
      });
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
export interface IStudentGrade {
  StudentGradeId: number;
  GradeName: string;
  Formula: string;
  GradeTypeId: number;
  ClassGroupId:number;
  Sequence: number;
  Active: number;
  Action: boolean;
}
