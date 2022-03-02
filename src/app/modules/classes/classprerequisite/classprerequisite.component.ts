import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-classprerequisite',
  templateUrl: './classprerequisite.component.html',
  styleUrls: ['./classprerequisite.component.scss']
})
export class ClassprerequisiteComponent implements OnInit {
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
  IscurrentBatchSelect=1;
  PrerequisiteListName = 'ClassPrerequisites';
  Applications = [];
  Permission = '';
  loading = false;
  SelectedApplicationId=0;
  SelectedBatchId = 0;
  PrerequisiteList: IPrerequisite[] = [];
  filteredOptions: Observable<IPrerequisite[]>;
  dataSource: MatTableDataSource<IPrerequisite>;
  allMasterData = [];
  ClassMasters = [];
  PrerequisiteData = {
    PrerequisiteId: 0,
    Description: '',
    ClassId: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 0
  };
  displayedColumns = [
    "PrerequisiteId",
    "Description",
    "Active",
    "Action"
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchClassId: [0]
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.IscurrentBatchSelect = +this.tokenstorage.getCheckEqualBatchId();
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.CLASSCOURSE.PREREQUISITE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu']);
      }
      else if (this.ClassMasters.length == 0) {
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.ClassMasters = [...data.value];
          this.loading = false;
        })
      }
      this.loading = false;
      //this.GetMasterData();
    }
  }
  AddNew() {

    if (this.searchForm.get("searchClassId").value == 0) {
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    var newdata = {
      PrerequisiteId: 0,
      Description: '',
      ClassId: this.searchForm.get("searchClassId").value,
      BatchId: 0,
      OrgId: 0,
      Active: 0,
      Action: false
    };
    this.PrerequisiteList = [];
    this.PrerequisiteList.push(newdata);
    this.dataSource = new MatTableDataSource<IPrerequisite>(this.PrerequisiteList);
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

          this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    //debugger;
    var _searchClassId = this.searchForm.get("searchClassId").value;
    if (_searchClassId == 0) {
      this.contentservice.openSnackBar("Class must be selected.", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    let checkFilterString = "Description eq '" + row.Description + "'"

    if (row.PrerequisiteId > 0)
      checkFilterString += " and PrerequisiteId ne " + row.PrerequisiteId;
    let list: List = new List();
    list.fields = ["PrerequisiteId"];
    list.PageName = this.PrerequisiteListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.AddedMessage, globalconstants.RedBackground);
        }
        else {

          this.PrerequisiteData.PrerequisiteId = row.PrerequisiteId;
          this.PrerequisiteData.Description = row.Description;
          this.PrerequisiteData.ClassId = _searchClassId;
          this.PrerequisiteData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.PrerequisiteData.BatchId = this.SelectedBatchId;

          this.PrerequisiteData.Active = row.Active;
          ////console.log('exam slot', this.PrerequisiteData)

          if (this.PrerequisiteData.PrerequisiteId == 0) {
            this.PrerequisiteData["CreatedDate"] = new Date();
            this.PrerequisiteData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.PrerequisiteData["UpdatedDate"] = new Date();
            delete this.PrerequisiteData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.PrerequisiteData["CreatedDate"];
            delete this.PrerequisiteData["CreatedBy"];
            this.PrerequisiteData["UpdatedDate"] = new Date();
            this.PrerequisiteData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.PrerequisiteListName, this.PrerequisiteData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.PrerequisiteId = data.PrerequisiteId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.PrerequisiteListName, this.PrerequisiteData, this.PrerequisiteData.PrerequisiteId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetPrerequisites() {
    //debugger;

    this.loading = true;
    let filterStr = '';// BatchId eq  + this.SelectedBatchId
    var _searchClassId = this.searchForm.get("searchClassId").value;
    if (_searchClassId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select class/course.", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    else {
      filterStr += ' ClassId eq ' + _searchClassId
    }
    let list: List = new List();
    list.fields = [
      "PrerequisiteId",
      "Description",
      "ClassId",
      "BatchId",
      "Active"
    ];

    list.PageName = this.PrerequisiteListName;
    list.filter = [filterStr];
    this.PrerequisiteList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.PrerequisiteList = [...data.value];
        }
        else
        {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage,globalconstants.ActionText,globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<IPrerequisite>(this.PrerequisiteList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        //this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
        // this.Durations = this.getDropDownData(globalconstants.MasterDefinitions.school.DURATION);
        // this.StudyArea = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDYAREA);
        // this.StudyMode = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDYMODE);
        this.loading = false;
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
export interface IPrerequisite {
  PrerequisiteId: number;
  Description: string;
  ClassId: number;
  Active: number;
  Action: boolean;
}





