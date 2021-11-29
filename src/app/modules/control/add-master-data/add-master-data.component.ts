import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  Parent = '';
  topMaster = 0;
  MasterData = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  PermittedApplications = [];
  Organizations = [];
  Locations = [];
  TopMasters = [];
  DefinedMaster = [];
  oldvalue = '';
  selectedData = '';
  OrgId = 0;
  Permission = '';
  ApplicationDropdownVisible = false;
  datasource: MatTableDataSource<IMaster>;
  SelectedApplicationId = 0;
  DataToSaveCount = -1;
  SelectedApplicationName = '';
  ApplicationDataStatus = [];
  SchoolDataStatus = [];
  StudentVariableNames = [];
  DisplayColumns = [
    "MasterDataId",
    "MasterDataName",
    "Description",
    "Logic",
    "Sequence",
    "Active"
  ];
  UserDetails = [];
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
  searchForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private alert: AlertService,
    private dialog: DialogService) { }

  ngOnInit(): void {
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();

    this.PermittedApplications = this.tokenStorage.getPermittedApplications();
    this.SelectedApplicationName = '';
    var apps = this.PermittedApplications.filter(f => f.applicationId == this.SelectedApplicationId)
    if (apps.length > 0) {
      this.SelectedApplicationName = apps[0].applicationName;
    }

    // if (this.SelectedApplicationName.toLowerCase() == 'globaladmin')
    //   this.searchForm = this.fb.group(
    //     {
    //       ParentId: [0],
    //       AppId: [0],
    //       OrgId: [0]
    //     })
    // else
    this.searchForm = this.fb.group(
      {
        ParentId: [0]
      })
    this.PageLoad();
  }

  PageLoad() {

    this.UserDetails = this.tokenStorage.getUserDetail();
    if (this.UserDetails.length == 0) {
      this.alert.error('Please login to be able to add masters!', this.optionAutoClose);
      this.route.navigate(['auth/login']);
    }
    this.loading = true;


    if (this.UserDetails == null) {
      this.alert.error('Application selected is not valid!', this.optionAutoClose);
      this.route.navigate(['/dashboard']);
    }
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.common.CONTROL.MASTERS)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {

        this.StudentVariableNames = globalconstants.MasterDefinitions.StudentVariableName;
        this.OrgId = this.UserDetails[0]["orgId"];
        this.searchForm.patchValue({ "OrgId": this.OrgId });
        if (this.UserDetails[0]["org"].toLowerCase() != "ttp")
          this.searchForm.controls['OrgId'].disable();

        this.GetTopMasters();
        this.GetOrganizations();
      }
    }
  }
  GetTopMasters() {
    debugger;
    var applicationFilter = '';
    // if (!this.SelectedApplicationName.toLowerCase().includes("globaladmin")) {
    //   this.ApplicationDropdownVisible = true;
    //   applicationFilter = " and ApplicationId eq " + this.SelectedApplicationId
    // }
    applicationFilter = "ApplicationId eq " + this.SelectedApplicationId
    let list: List = new List();
    list.fields = [
      "MasterDataId", "ParentId",
      "MasterDataName", "Description",
      "Logic", "Sequence", "ApplicationId",
      "Active", "OrgId"];
    list.PageName = "MasterItems";
    list.filter = ["(ParentId eq 0 and " + applicationFilter + ") or (OrgId eq " + this.OrgId + " and " + applicationFilter + ")"];
    //debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {

          this.DefinedMaster = [...data.value];//.filter(m=>m.OrgId == this.UserDetails[0]["orgId"]);
          let applicationData = globalconstants.MasterDefinitions.ttpapps;

          delete applicationData.TTPAPP;
          this.ApplicationDataStatus = this.getSettingStatus(applicationData);

          let schoolData = globalconstants.MasterDefinitions.school;
          this.SchoolDataStatus = this.getSettingStatus(schoolData);
          //this.TopMasters = [];
          this.TopMasters = this.DefinedMaster.filter(t => (t.ApplicationId == this.SelectedApplicationId && t.ParentId == 0)
            || t.ParentId == this.SelectedApplicationId);
          this.loading = false;

        }
      });
  }
  GetOrganizations() {

    let list: List = new List();
    list.fields = ["OrganizationId", "OrganizationName"];
    list.PageName = "Organizations";
    list.filter = ["Active eq 1"];
    //debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Organizations = [...data.value];
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
  SaveAll() {
    var ToUpdate = this.MasterData.filter(f => f.Action);
    this.DataToSaveCount = ToUpdate.length;

    ToUpdate.forEach(s => {
      this.DataToSaveCount--;
      this.UpdateOrSave(s);
    });
  }
  ReSequence(editedrow) {
    //debugger;
    var diff = 0;
    if (editedrow.Sequence != editedrow.OldSequence) {

      if (editedrow.Sequence > editedrow.OldSequence) {
        var filteredData = this.MasterData.filter(currentrow => currentrow.MasterDataId != editedrow.MasterDataId
          && currentrow.Sequence > editedrow.OldSequence
          && currentrow.Sequence <= editedrow.Sequence)

        filteredData.forEach(currentrow => {

          currentrow.Sequence -= 1;
          currentrow.OldSequence -= 1;
          currentrow.Action = true;

        });
      }
      else if (editedrow.Sequence < editedrow.OldSequence) {
        var filteredData = this.MasterData.filter(currentrow => currentrow.MasterDataId != editedrow.MasterDataId
          && currentrow.Sequence >= editedrow.Sequence
          && currentrow.Sequence < editedrow.OldSequence)

        filteredData.forEach(currentrow => {
          currentrow.Sequence += 1;
          currentrow.OldSequence += 1;
          currentrow.Action = true;
        })
      }
      editedrow.Action = true;
      editedrow.OldSequence = editedrow.Sequence;
      this.MasterData.sort((a, b) => a.Sequence - b.Sequence);
      this.datasource = new MatTableDataSource<IMaster>(this.MasterData);
      this.datasource.sort = this.sort;
      this.datasource.paginator = this.paginator;
    }
  }
  onBlur(element) {
    //debugger;
    element.Action = true;
  }
  enable(element) {
    debugger;
    if (element.value > 0)
      this.enableTopEdit = true;
    else
      this.enableTopEdit = false;
    this.TopMasters = this.DefinedMaster.filter(t => (t.ApplicationId == this.SelectedApplicationId && t.ParentId == 0)
      || t.ParentId == this.SelectedApplicationId);

  }
  FilterMaster() {
    debugger;
    this.TopMasters = this.DefinedMaster.filter(t => (t.ApplicationId == this.SelectedApplicationId && t.ParentId == 0)
      || t.ParentId == this.SelectedApplicationId);
  }
  EditTopMaster() {
    //debugger;
    this.enableAddNew = false;
    let toedit = this.TopMasters.filter(t => {
      return t.MasterDataId == this.searchForm.get("ParentId").value
    })
    if (toedit.length > 0) {
      let newrow = {
        "MasterDataId": this.searchForm.get("ParentId").value,
        "MasterDataName": toedit[0].MasterDataName,
        "Description": toedit[0].Description,
        "Logic": toedit[0].Description,
        "Sequence": toedit[0].Sequence,
        "OldSequence": toedit[0].Sequence,
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
    //debugger;
    this.enableTopEdit = false;

    if (this.searchForm.get("ParentId").value == 0 && this.topMaster == 0) {
      this.alert.error("Please select master name to add items to", this.optionAutoClose);
      return;
    }

    let newrow = {
      "MasterDataId": 0,
      "OldSequence": 0,
      "MasterDataName": "",
      "Description": "",
      "Logic": "",
      "Sequence": 0,
      "ParentId": this.searchForm.get("ParentId").value,
      "OrgId": 0,
      "Active": 1,
      "ApplicationId": this.SelectedApplicationId,
      "Action": false
    }
    if (this.searchForm.get("ParentId").value == 0) {
      this.MasterData = [];
      this.MasterData.push(newrow);
    }
    else {
      let alreadyadded = this.MasterData.filter(item => item.MasterDataName == "");
      if (alreadyadded.length == 0)
        this.MasterData.push(newrow);
    }
    this.datasource = new MatTableDataSource<IMaster>(this.MasterData);
  }
  GetSearchMaster() {
    this.loading = true;
    this.enableTopEdit = false;
    this.enableAddNew = true;
    this.MasterData = [];
    this.Parent = '';
    this.datasource = new MatTableDataSource<IMaster>(this.MasterData);
    // this.datasource.paginator = this.paginator;
    // this.datasource.sort = this.sort;

    if (this.SelectedApplicationName.toLowerCase().includes("admin"))
      this.OrgId = this.searchForm.get("OrgId").value;

    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName",
      "Description", "Logic", "ApplicationId",
      "Sequence", "ParentId", "OrgId", "Active"];
    list.PageName = "MasterItems";
    list.filter = ["ParentId eq " + this.searchForm.get("ParentId").value + " and OrgId eq " + this.OrgId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.MasterData = data.value.map(item => {
          return {
            "MasterDataId": item.MasterDataId,
            "MasterDataName": item.MasterDataName,
            "Description": item.Description,
            "Logic": item.Logic,
            "Sequence": item.Sequence,
            "OldSequence": item.Sequence,
            "ParentId": item.ParentId,
            "ApplicationId": item.ApplicationId,
            "OrgId": item.OrgId,
            "Active": item.Active == 1 ? true : false,
            "Action": false
          }
        })
        if (this.MasterData.length == 0) {
          this.alert.error("No record found.", this.optionAutoClose);

        }
        this.Parent = this.TopMasters.filter(f => f.MasterDataId == this.searchForm.get("ParentId").value)[0].MasterDataName;
        console.log("parent", this.Parent)
        this.datasource = new MatTableDataSource<IMaster>(this.MasterData);
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort;
        this.loading = false;
      });

  }
  updateActive(row, value) {
    //console.log('clicked',value);
    //debugger;
    this.loading = true;
    let message = value.checked == true ? "activated" : "deactivated";
    this.dialog.openConfirmDialog("Are you sure you want to " + message + " " + row.MasterDataName + "?")
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
            Sequence: row.Sequence,
            MasterDataName: row.MasterDataName,
            OrgId: row.OrgId,
            Active: value.checked == true ? 1 : 0,

            // UploadDate: new Date()
          }

          this.dataservice.postPatch('MasterItems', mastertoUpdate, row.MasterDataId, 'patch')
            .subscribe(res => {
              this.loading = false;
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
  SaveRow(row) {
    this.DataToSaveCount = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    if (row.MasterDataName.length == 0 || row.MasterDataName.length > 50) {
      this.loading = false;
      this.alert.error("Character should not be empty or greater than 50!", this.optionAutoClose);
      return;
    }
    if (this.searchForm.get("ParentId").value == 0 || this.enableTopEdit) {
      let duplicate = this.TopMasters.filter(item => item.OrgId == this.UserDetails[0]["orgId"]
        && item.MasterDataName.toLowerCase() == row.MasterDataName.toLowerCase()
        && item.ApplicationId == row.ApplicationId)
      if (duplicate.length > 0) {
        this.loading = false;
        this.alert.error("Data already exists in this master", this.optionNoAutoClose);
        return;
      }
    }
    else {
      let duplicate = this.MasterData.filter(item => item.MasterDataName.toLowerCase() == row.MasterDataName.toLowerCase()
        && item.MasterDataId != row.MasterDataId && item.ApplicationId == row.ApplicationId)
      if (duplicate.length > 0) {
        this.loading = false;
        this.alert.error("Data already exists!", this.optionNoAutoClose);
        return;
      }
    }
    
    var parent = this.TopMasters.filter(f => f.MasterDataId == this.searchForm.get("ParentId").value)
    if (parent.length > 0) {
      if (parent[0].MasterDataName.toLowerCase() == "student grade") {
        if (row.Sequence == 0) {
          this.alert.error("Sequence is mandatory for Student Grade");
          return;
        }
      }
    }
    let mastertoUpdate = {
      MasterDataId: row.MasterDataId,
      MasterDataName: row.MasterDataName,
      Description: row.Description,
      Logic: row.Logic,
      Sequence: row.Sequence,
      ParentId: this.enableTopEdit ? 0 : this.searchForm.get("ParentId").value,
      ApplicationId: this.SelectedApplicationId,
      Active: 1
    }

    let selectedMasterDataId = 0;
    if (row.MasterDataId == 0) {

      mastertoUpdate["CreatedBy"] = this.UserDetails[0]["userId"];
      mastertoUpdate["OrgId"] = this.UserDetails[0]["orgId"];
      mastertoUpdate["ApplicationId"] = this.SelectedApplicationId;
      //console.log('data to update',mastertoUpdate);
      this.dataservice.postPatch('MasterItems', mastertoUpdate, 0, 'post')
        .subscribe((res: any) => {
          if (res != undefined) {
            row.MasterDataId = res.MasterDataId;
            row.Action = false;
            if (this.searchForm.get("ParentId").value == 0)
              this.searchForm.patchValue({ ParentId: res["MasterDataId"] });

            if (this.DataToSaveCount == 0) {
              this.loading = false;
              this.DataToSaveCount = -1;
              this.alert.success("Master data added!", this.optionAutoClose);
            }
          }
        }, error => console.log('insert error', error));
    }
    else {
      this.dataservice.postPatch('MasterItems', mastertoUpdate, row.MasterDataId, 'patch')
        .subscribe(res => {
          row.Action = false;
          if (this.DataToSaveCount == 0) {
            this.loading = false;
            this.DataToSaveCount = -1;
            this.alert.success("Master data updated!", this.optionAutoClose);
          }
        });
    }
    this.enableTopEdit = false;
  }
  updateDescription(value, row) {
    //debugger;
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

    this.dataservice.postPatch('MasterItems', mastertoUpdate, selectedMasterDataId, 'patch')
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
  MasterDataId: number;
  MasterDataName: string;
  Description: string;
  ParentId: number;
  Active;
}