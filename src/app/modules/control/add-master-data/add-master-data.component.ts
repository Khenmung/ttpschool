import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { DialogService } from '../../../shared/dialog.service';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';

@Component({
  selector: 'app-add-master-data',
  templateUrl: './add-master-data.component.html',
  styleUrls: ['./add-master-data.component.scss']
})
export class AddMasterDataComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  topMaster = 0;
  MasterData = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Applications = [];
  Locations = [];
  TopMasters = [];
  DefinedMaster = [];
  oldvalue = '';
  selectedData = '';
  datasource: MatTableDataSource<IMaster>;
  ApplicationDataStatus = [];
  SchoolDataStatus = [];
  DisplayColumns = [
    "Name",
    "Logic",
    "Description",
    "Sequence",
    "Active"
  ];
  UserDetails = [];

  constructor(
    private fb: FormBuilder,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private alert: AlertService,
    private dialog: DialogService) { }

  ngOnInit(): void {
    // this.UserDetails = this.tokenStorage.getUserDetail();
    // if(this.UserDetails==null)
    // {
    //   this.alert.error('Please login to be able to add masters!',this.optionAutoClose);
    //   this.route.navigate(['auth/login']);
    // }
    // this.GetTopMasters();
  }

  enableAddNew = false;
  enableTopEdit = false;
  loading: boolean = false;
  error: string = '';
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  optionNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };

  searchForm = this.fb.group(
    {
      ParentId: [0],
      AppId:[0]
    })
  PageLoad() {
    debugger;
    this.loading = true;
    this.UserDetails = this.tokenStorage.getUserDetail();
    if (this.UserDetails == null) {
      this.alert.error('Please login to be able to add masters!', this.optionAutoClose);
      this.route.navigate(['auth/login']);
    }
    this.GetTopMasters();
  }

  GetTopMasters() {
    let list: List = new List();
    list.fields = ["MasterDataId", "ParentId", "MasterDataName", "Description", "Logic","Sequence","ApplicationId", "Active", "OrgId"];
    list.PageName = "MasterDatas";
    list.filter = ["(ParentId eq 0 or OrgId eq " + this.UserDetails[0]["orgId"] + ")"];//this.searchForm.get("ParentId").value];
    debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          var _applicationId = data.value.filter(d => d.MasterDataName.toLowerCase() == 'application')[0].MasterDataId;

          this.TopMasters = data.value.filter(m => {
            return m.ParentId == 0 && m.MasterDataId != _applicationId && m.ParentId != _applicationId
          });

          this.DefinedMaster = [...data.value];//.filter(m=>m.OrgId == this.UserDetails[0]["orgId"]);
          let applicationData = globalconstants.MasterDefinitions.applications;
          this.Applications = data.value.filter(d => d.ParentId == _applicationId);
          delete applicationData.APP;
          this.ApplicationDataStatus = this.getSettingStatus(applicationData);

          let schoolData = globalconstants.MasterDefinitions.school;
          this.SchoolDataStatus = this.getSettingStatus(schoolData);
          this.TopMasters =[];
          this.loading = false;

        }
      });
  }
  getSettingStatus(data) {
    let defined;
    return Object.keys(data).map(globalcons => {
      var _parentIds = this.TopMasters.filter(t => t.MasterDataName.toLowerCase().trim() == data[globalcons].toLowerCase().trim())
      if (_parentIds.length > 0) {
        defined = this.DefinedMaster.filter(fromdb => {
          return _parentIds[0].MasterDataId == fromdb.ParentId;
        });

        if (defined.length > 0) {
          return {
            MasterDataName: data[globalcons],
            Done: true
          }
        }
        else {
          return {
            MasterDataName: data[globalcons],
            Done: false
          }
        }
      }
      else
        return false;
    });

  }
  onBlur(element) {
    element.Action = true;
  }
  enable(elment) {
    debugger;
    if (elment.value > 0)
      this.enableTopEdit = true;
    else
      this.enableTopEdit = false;
    this.TopMasters = this.DefinedMaster.filter(t => t.ApplicationId == this.searchForm.get("AppId").value && t.ParentId ==0);
  }
  EditTopMaster() {
    debugger;
    this.enableAddNew = false;
    let toedit = this.TopMasters.filter(t => {
      return t.MasterDataId == this.searchForm.get("ParentId").value
    })
    if (toedit.length > 0) {
      let newrow = {
        "Id": this.searchForm.get("ParentId").value,
        "Name": toedit[0].MasterDataName,
        "Description": toedit[0].Description == null ? 'edit me..' : toedit[0].Description,
        "Logic": toedit[0].Logic == null ? 'edit me..' : toedit[0].Description,
        "Sequence":toedit[0].Sequence,
        "ParentId": 0,
        "Active": toedit[0].Active,
        "Action": false
      }
      if (this.searchForm.get("ParentId").value != 0) {
        this.MasterData = [];
        this.MasterData.push(newrow);
      }
      this.datasource = new MatTableDataSource<IMaster>(this.MasterData);
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    }
  }
  NewTopMaster() {
    this.enableTopEdit = false;
    this.topMaster = 1;
    this.searchForm.patchValue({ ParentId: 0 });
    //console.log('searchvalue', this.searchForm.get("ParentId").value)
    this.AddData();
    this.GetTopMasters();
    this.topMaster = 0;
  }
  AddData() {
    debugger;
    this.enableTopEdit = false;

    if (this.searchForm.get("ParentId").value == 0 && this.topMaster == 0) {
      this.alert.error("Please select master name to add items to", this.optionAutoClose);
      return;
    }

    let newrow = {
      "Id": 0,
      "Name": "edit me..",
      "Description": "edit me..",
      "Logic": "edit me..",
      "Sequence":0,
      "ParentId": this.searchForm.get("ParentId").value,
      "OrgId": 0,
      "Active": 1,
      "ApplicationId":this.searchForm.get("AppId").value,
      "Action": false
    }
    if (this.searchForm.get("ParentId").value == 0) {
      this.MasterData = [];
      this.MasterData.push(newrow);
    }
    else {
      let alreadyadded = this.MasterData.filter(item => item.Name == "edit me..");
      if (alreadyadded.length == 0)
        this.MasterData.push(newrow);
    }
    this.datasource = new MatTableDataSource<IMaster>(this.MasterData);
  }
  GetSearchMaster() {
    this.enableTopEdit = false;
    this.enableAddNew = true;
    debugger;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "Description", "Logic","ApplicationId","Sequence", "ParentId", "OrgId", "Active"];
    list.PageName = "MasterDatas";
    list.filter = ["ParentId eq " + this.searchForm.get("ParentId").value + " and OrgId eq " + this.UserDetails[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.MasterData = data.value.map(item => {
          return {
            "Id": item.MasterDataId,
            "Name": item.MasterDataName,
            "Description": item.Description == null ? 'edit me..' : item.Description,
            "Logic": item.Logic == null ? 'edit me..' : item.Logic,
            "Sequence":item.Sequence,
            "ParentId": item.ParentId,
            "ApplicationId":item.ApplicationId,
            "OrgId": item.OrgId,
            "Active": item.Active == 1 ? true : false,
            "Action": false
          }
        })
        this.datasource = new MatTableDataSource<IMaster>(this.MasterData);
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort;

      });

  }
  updateActive(row, value) {
    //console.log('clicked',value);
    debugger;
    let message = value.checked == true ? "activated" : "deactivated";
    this.dialog.openConfirmDialog("Are you sure you want to " + message + " " + row.Name + "?")
      .afterClosed().subscribe(res => {

        if (value.Id == 0) {
          let indx = this.MasterData.map(item => {
            return item.Id
          }).indexOf(0);

          this.MasterData.splice(indx, 1);

        }
        if (res) {
          let mastertoUpdate = {
            ParentId: this.searchForm.get("ParentId").value,
            Description: row.Description,
            Logic: row.Logic,
            Sequence:row.Sequence,
            MasterDataName: row.Name,
            OrgId: row.OrgId,
            Active: value.checked == true ? 1 : 0,

            // UploadDate: new Date()
          }

          this.dataservice.postPatch('MasterDatas', mastertoUpdate, row.Id, 'patch')
            .subscribe(res => {
              this.alert.success("Master data " + message + " successfully.", this.optionAutoClose);
            });
        }
      });
  }

  selected(event) {
    this.selectedData = event.target.value;
  }
  getoldvalue(value: string, row) {
    this.oldvalue = row.MasterDataName;
    //  console.log('old value', this.oldvalue);
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    if (row.Name.length == 0 || row.Name.length > 50) {
      this.loading = false;
      this.alert.error("Character should not be empty or less than 50!", this.optionAutoClose);
      return;
    }
    if (this.searchForm.get("ParentId").value == 0 || this.enableTopEdit) {
      let duplicate = this.TopMasters.filter(item => item.OrgId == this.UserDetails[0]["orgId"] && item.MasterDataName.toLowerCase() == row.Name.toLowerCase())
      if (duplicate.length > 0) {
        this.loading = false;
        this.alert.error("Data already exists in this master", this.optionNoAutoClose);
        return;
      }
    }
    else {
      let duplicate = this.MasterData.filter(item => item.OrgId == this.UserDetails[0]["orgId"] &&
        item.Name.toLowerCase() == row.Name.toLowerCase() && item.Id != row.Id)
      if (duplicate.length > 0) {
        this.loading = false;
        this.alert.error("Data already exists in this master", this.optionNoAutoClose);
        return;
      }
    }

    let mastertoUpdate = {
      MasterDataId: 0,
      MasterDataName: row.Name,
      Description: row.Description,
      Logic: row.Logic,
      Sequence:row.Sequence,
      ParentId: this.enableTopEdit ? 0 : this.searchForm.get("ParentId").value,
      ApplicationId:this.searchForm.get("AppId").value,
      Active: 1
    }

    let newlyAddedRow = this.MasterData.filter(item => {
      return item.Name == row.Name
    });

    let selectedMasterDataId = 0;
    mastertoUpdate.MasterDataId = newlyAddedRow[0].Id;
    if (newlyAddedRow[0].Id == 0) {

      mastertoUpdate["CreatedBy"] = this.UserDetails[0]["userId"];
      mastertoUpdate["OrgId"] = this.UserDetails[0]["orgId"];
      mastertoUpdate["ApplicationId"] = 0;//this.UserDetails[0]["applicationId"];
      //console.log('data to update',mastertoUpdate);
      this.dataservice.postPatch('MasterDatas', mastertoUpdate, 0, 'post')
        .subscribe((res: any) => {
          if (res != undefined) {
            row.MasterDataId = res.MasterDataId;
            row.Action = false;          
            if (this.searchForm.get("ParentId").value == 0)
              this.searchForm.patchValue({ ParentId: res["MasterDataId"] });
            this.loading = false;
            this.alert.success("Master data added!", this.optionAutoClose);
          }
        }, error => console.log('insert error', error));
    }
    else {
      selectedMasterDataId = newlyAddedRow[0].Id;
      this.dataservice.postPatch('MasterDatas', mastertoUpdate, selectedMasterDataId, 'patch')
        .subscribe(res => {
          this.loading = false;
          row.Action = false;
          this.alert.success("Master data updated!", this.optionAutoClose);

        });
    }
    this.enableTopEdit = false;
  }
  updateDescription(value, row) {
    debugger;
    if (row.Description.toLowerCase() == value.toLowerCase())
      return;
    let confirmYesNo: Boolean = false;
    if (value.length == 0 || value.length > 50) {
      this.alert.error("Character should not be empty or less than 50!");
      return;
    }

    let mastertoUpdate = {
      Description: value
    }

    let selectedMasterDataId = this.MasterData.filter(item => {
      return item.Id == row.Id
    })[0].Id;

    this.dataservice.postPatch('MasterDatas', mastertoUpdate, selectedMasterDataId, 'patch')
      .subscribe(res => {
        this.alert.success("Master data updated!", this.optionAutoClose);
      });
  }
  getDropDownData(dropdowntype) {
    let Id = this.MasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    })[0].MasterDataId;
    return this.MasterData.filter((item, index) => {
      return item.ParentId == Id
    });
  }
}
export interface IMaster {
  Id: number;
  Name: string;
  Description: string;
  ParentId: number;
  Active;
}