import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-subject-types',
  templateUrl: './subject-types.component.html',
  styleUrls: ['./subject-types.component.scss']
})
export class SubjectTypesComponent implements OnInit {
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
  CheckBatchIdForEdit = 1;
  StandardFilterWithBatchId = '';
  loading = false;
  Classes = [];
  Subjects = [];
  SubjectTypes: ISubjectType[];
  SelectedBatchId = 0;
  Batches = [];
  dataSource: MatTableDataSource<ISubjectType>;
  allMasterData = [];
  SelectedApplicationId=0;
  SubjectTypeId = 0;
  SubjectTypeData = {
    SubjectTypeId: 0,
    SubjectTypeName: '',
    OrgId: 0,
    BatchId: 0,
    SelectHowMany: 0,
    Active: 1
  };
  displayedColumns = [
    'SubjectTypeName',
    'SelectHowMany',
    'Active',
    'Action'
  ];
  Permission = '';
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private contentservice: ContentService,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

  ngOnInit(): void {

    this.PageLoad();

  }

  PageLoad() {

    debugger;
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();

    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.SUBJECT.SUBJECT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
      this.GetSubjectTypes();
      //    this.GetMasterData();      
    }
  }
  onBlur(row) {
    row.Action = true;
  }
  addnew() {

    let toadd = {
      SubjectTypeId: 0,
      SubjectTypeName: 'new subject type',
      OrgId: 0,
      BatchId: 0,
      SelectHowMany: 0,
      Active: 1,
      Action: false
    };
    this.SubjectTypes.push(toadd);
    this.dataSource = new MatTableDataSource<ISubjectType>(this.SubjectTypes);

  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
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
  UpdateOrSave(row) {

    //debugger;

    this.loading = true;
    let checkFilterString = " and SubjectTypeName eq '" + row.SubjectTypeName + "' "


    if (row.SubjectTypeId > 0)
      checkFilterString += " and SubjectTypeId ne " + row.SubjectTypeId;

    this.StandardFilterWithBatchId += checkFilterString;
    let list: List = new List();
    list.fields = ["SubjectTypeId"];
    list.PageName = "SubjectTypes";
    list.filter = [this.StandardFilterWithBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.SubjectTypeData.Active = row.Active;
          this.SubjectTypeData.SubjectTypeName = row.SubjectTypeName;
          this.SubjectTypeData.SubjectTypeId = row.SubjectTypeId;
          this.SubjectTypeData.SelectHowMany = row.SelectHowMany;
          this.SubjectTypeData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.SubjectTypeData.BatchId = this.SelectedBatchId;
          ////console.log('data', this.ClassSubjectData);
          if (this.SubjectTypeData.SubjectTypeId == 0) {
            this.SubjectTypeData["CreatedDate"] = new Date();
            this.SubjectTypeData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.SubjectTypeData["UpdatedDate"];
            delete this.SubjectTypeData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.SubjectTypeData["CreatedDate"];
            delete this.SubjectTypeData["CreatedBy"];
            this.SubjectTypeData["UpdatedDate"] = new Date();
            this.SubjectTypeData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            //console.log('this', this.SubjectTypeData)
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('SubjectTypes', this.SubjectTypeData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.SubjectTypeId = data.SubjectTypeId;
          row.Action = false;
          this.loading = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch('SubjectTypes', this.SubjectTypeData, this.SubjectTypeData.SubjectTypeId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  GetSubjectTypes() {

    var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["SubjectTypeId", "SubjectTypeName", "SelectHowMany", "Active"];
    list.PageName = "SubjectTypes";
    list.filter = [orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SubjectTypes = data.value.map(m => {
          m.Action = false;
          return m;
        });
        this.dataSource = new MatTableDataSource<ISubjectType>(this.SubjectTypes);
        this.loading = false;
      })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];

        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));

        //this.shareddata.ChangeBatch(this.Batches);
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
export interface ISubjectType {
  SubjectTypeName: string;
  SelectHowMany: number;
  SubjectTypeId: number;
  OrgId: number;
  BatchId: number;
  Active: number;
}
