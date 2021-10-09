import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-applicationfeature',
  templateUrl: './applicationfeature.component.html',
  styleUrls: ['./applicationfeature.component.scss']
})
export class ApplicationfeatureComponent implements OnInit {
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
  ApplicationFeatureListName = 'ApplicationFeatures';
  Applications = [];
  loading = false;
  ApplicationFeatureList: IApplicationFeature[] = [];
  filteredOptions: Observable<IApplicationFeature[]>;
  dataSource: MatTableDataSource<IApplicationFeature>;
  allMasterData = [];

  ExamId = 0;
  ApplicationFeatureData = {
    ApplicationFeatureId: 0,
    FeatureName: '',
    ApplicationId: 0,
    Active: 0
  };
  displayedColumns = [
    'FeatureName',
    'Active',
    'Action'
  ];
  searchForm: FormGroup;
  constructor(
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
      searchApplicationName: [0]
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {

      this.GetMasterData();
    }
  }
  AddNew() {
    if (this.searchForm.get("searchApplicationName").value == 0) {
      this.alert.info("Please select application", this.optionAutoClose);
      return;
    }
    var newdata = {
      ApplicationFeatureId: 0,
      FeatureName: '',
      ApplicationId: this.searchForm.get("searchApplicationName").value,
      Application:this.Applications.filter(f=>f.MasterDataId == this.searchForm.get("searchApplicationName").value)[0].MasterDataName,
      Active: 0,
      Action: true
    };
    this.ApplicationFeatureList =[];
    this.ApplicationFeatureList.push(newdata);
    this.dataSource = new MatTableDataSource<IApplicationFeature>(this.ApplicationFeatureList);
  }
  onBlur(element)
  {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked? 1 : 0;
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
    let checkFilterString = "ApplicationId eq " + row.ApplicationId +
      " and FeatureName eq '" + row.FeatureName + "'";

    if (row.ApplicationFeatureId > 0)
      checkFilterString += " and ApplicationFeatureId ne " + row.ApplicationFeatureId;
    let list: List = new List();
    list.fields = ["ApplicationFeatureId"];
    list.PageName = this.ApplicationFeatureListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.ApplicationFeatureData.ApplicationFeatureId = row.ApplicationFeatureId;
          this.ApplicationFeatureData.ApplicationId = row.ApplicationId;
          this.ApplicationFeatureData.Active = row.Active;
          this.ApplicationFeatureData.FeatureName = row.FeatureName;
          if (this.ApplicationFeatureData.ApplicationFeatureId == 0) {
            this.ApplicationFeatureData["CreatedDate"] = new Date();
            this.ApplicationFeatureData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ApplicationFeatureData["UpdatedDate"] = new Date();
            delete this.ApplicationFeatureData["UpdatedBy"];
            //console.log('exam slot', this.SlotNClassSubjectData)
            this.insert(row);
          }
          else {
            delete this.ApplicationFeatureData["CreatedDate"];
            delete this.ApplicationFeatureData["CreatedBy"];
            this.ApplicationFeatureData["UpdatedDate"] = new Date();
            this.ApplicationFeatureData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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
    this.dataservice.postPatch(this.ApplicationFeatureListName, this.ApplicationFeatureData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ApplicationFeatureId = data.ApplicationFeatureId;
          row.Action = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ApplicationFeatureListName, this.ApplicationFeatureData, this.ApplicationFeatureData.ApplicationFeatureId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
          this.loadingFalse();
        });
  }
  GetApplicationFeatures() {
    //debugger;
    if(this.searchForm.get("searchApplicationName").value==0)
    {
      this.alert.info("Please select application",this.optionAutoClose);
      return;
    }
    this.loading = true;
    let filterStr = ' ApplicationId eq ' + this.searchForm.get("searchApplicationName").value
    let list: List = new List();
    list.fields = [
      'ApplicationFeatureId',
      'ApplicationId',
      'FeatureName',
      'Active'
    ];

    list.PageName = this.ApplicationFeatureListName;
    list.filter = [filterStr];
    this.ApplicationFeatureList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.ApplicationFeatureList = data.value.map(item => {
            return {
              ApplicationFeatureId: item.ApplicationFeatureId,
              Application: this.Applications.filter(f=>f.MasterDataId == item.ApplicationId)[0].Description,
              ApplicationId: item.ApplicationId,
              FeatureName: item.FeatureName,
              Active: item.Active,
              Action: false
            }
          })
        }
        else {
          this.ApplicationFeatureList.push({
            ApplicationFeatureId: 0,
            Application: this.Applications.filter(f=>f.MasterDataId == this.searchForm.get("searchApplicationName").value)[0].Description,
            ApplicationId: this.searchForm.get("searchApplicationName").value,
            FeatureName: '',
            Active: 0,
            Action: false
          })
        }
        this.dataSource = new MatTableDataSource<IApplicationFeature>(this.ApplicationFeatureList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

        let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId","Description"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (MasterDataName eq 'Application' or OrgId eq " + this.LoginUserDetail[0]["orgId"] + ")"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);
        this.loading=false;
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
export interface IApplicationFeature {
  ApplicationFeatureId: number;
  FeatureName: string;
  Application: string;
  ApplicationId: number;
  Active: number;
  Action: boolean;
}
export interface IApplication {
  ApplicationId: number;
  ApplicationName: string;
}



