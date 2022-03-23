import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ConfirmDialogComponent } from 'src/app/shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { ContentService } from 'src/app/shared/content.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { NaomitsuService } from '../../../shared/databaseService';
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
  //topMaster = 0;

  RowParent = [];
  MasterList = [];
  MasterData = [];
  SubMasters = [];
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
  filteredMaster: Observable<IMaster[]>;
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
    "ParentId",
    "Description",
    "Logic",
    "Sequence",
    "Active",
    "Action"
  ];
  //SearchParentId = 0;
  UserDetails = [];
  //enableAddNew = false;
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
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private contentservice: ContentService) { }

  ngOnInit(): void {
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();

    this.PermittedApplications = this.tokenStorage.getPermittedApplications();
    this.SelectedApplicationName = '';
    var apps = this.PermittedApplications.filter(f => f.applicationId == this.SelectedApplicationId)
    if (apps.length > 0) {
      this.SelectedApplicationName = apps[0].applicationName;
    }
    this.searchForm = this.fb.group(
      {
        ParentId: [0],
        SubId: [0]
      })
    this.filteredMaster = this.searchForm.get("ParentId").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.MasterDataName),
        map(Name => Name ? this._filter(Name) : this.MasterData.slice())
      );

    this.PageLoad();
  }

  PageLoad() {

    this.UserDetails = this.tokenStorage.getUserDetail();
    if (this.UserDetails.length == 0) {
      this.contentservice.openSnackBar("Please login to be able to add masters!", globalconstants.ActionText, globalconstants.RedBackground);
      //this.alert.error('Please login to be able to add masters!', this.optionAutoClose);
      this.route.navigate(['auth/login']);
    }
    this.loading = true;


    if (this.UserDetails == null) {
      this.contentservice.openSnackBar("Application selected is not valid!", globalconstants.ActionText, globalconstants.RedBackground);

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
        // if (this.UserDetails[0]["org"].toLowerCase() != "ttp")
        //   this.searchForm.controls['OrgId'].disable();

        // this.GetMasters(0, 0).subscribe((data: any) => {
        //   this.TopMasters = [...data.value];
        //   this.loading = false;
        // });
        this.GetMastersForAutoComplete();
        this.GetOrganizations();
      }
    }
  }
  private _filter(name: string): IMaster[] {

    const filterValue = name.toLowerCase();
    return this.MasterData.filter(option => option.MasterDataName.toLowerCase().includes(filterValue));

  }
  displayFn(master: IMaster): string {
    return master && master.MasterDataName ? master.MasterDataName : '';
  }

  GetMastersForAutoComplete() {
    debugger;
    var apps = this.tokenStorage.getPermittedApplications();
    var commonAppId = apps.filter(f => f.appShortName == 'common')[0].applicationId;

    var applicationFilter = '';
    //applicationFilter = "Active eq 1 and PlanId eq " + this.UserDetails[0]["planId"]
    var applicationFilter = "(OrgId eq 0 or OrgId eq " + this.UserDetails[0]["orgId"] +
      ") and (ApplicationId eq " + this.SelectedApplicationId + " or ApplicationId eq " + commonAppId + ")";
    let list: List = new List();
    list.fields = [
      "MasterDataId,ParentId,MasterDataName,Description,ApplicationId,OrgId"
    ];
    list.PageName = "MasterItems";
    list.lookupFields = ["PlanAndMasterItems($filter=PlanId eq " + this.UserDetails[0]["planId"] + ";$select=MasterDataId,PlanAndMasterDataId)"];

    list.filter = [applicationFilter];// + ") or (OrgId eq " + this.OrgId + " and " + applicationFilter + ")"];
    //debugger;
    //console.log("GetMastersForAutoComplete",this.SelectedApplicationId)  
    return this.dataservice.get(list).subscribe((data: any) => {
      var result = [];
      data.value.forEach(d => {
        if (d.PlanAndMasterItems.length > 0) {
          result.push({
            MasterDataId: d.MasterDataId,
            MasterDataName: d.MasterDataName,
            ParentId: d.ParentId,
            ApplicationId: d.ApplicationId,
            Description: d.Description,
            OrgId: d.OrgId,
          });
        }
      })//.filter(f=>f.ApplicationId == this.SelectedApplicationId)

      this.MasterData = result.sort((a, b) => a.ParentId - b.ParentId);
      //console.log("my MasterData", this.MasterData);
    })

  }
  emptyresult() {
    this.MasterList = [];
    this.datasource = new MatTableDataSource<IMaster>(this.MasterList);
  }
  GetOrganizations() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["OrganizationId", "OrganizationName"];
    list.PageName = "Organizations";
    list.filter = ["Active eq 1"];
    //debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Organizations = [...data.value];
        this.loading = false;
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
    var ToUpdate = this.MasterList.filter(f => f.Action);
    this.DataToSaveCount = ToUpdate.length;

    ToUpdate.forEach(s => {
      this.DataToSaveCount--;
      this.UpdateOrSave(s);
    });
  }
  ReSequence(editedrow) {
    debugger;
    var diff = editedrow.OldSequence - editedrow.Sequence;
    var newSequence = editedrow.Sequence;
    this.MasterList = this.MasterList.sort((a, b) => a.Sequence - b.Sequence)

    if (diff > 0) {
      var indx = -1;
      //search in loop using ">=" since the new sequence may not exist in the list.
      for (var i = 0; i < this.MasterList.length; i++) {
        if (this.MasterList[i].OldSequence >= editedrow.Sequence) {
          indx = i;
          break;
        }
      }
      //var indx = this.MasterList.findIndex(x => x.OldSequence == editedrow.Sequence);

      for (var start = indx; start < this.MasterList.length; start++) {
        newSequence += 1;
        //if (start != newSequence)
        this.MasterList[start].Sequence = newSequence;
        this.MasterList[start].Action = true;
      }
    }
    else {
      var indx = this.MasterList.findIndex(x => x.Sequence == editedrow.Sequence);
      for (var start = indx + 1; start < this.MasterList.length; start++) {
        newSequence += 1;
        this.MasterList[start].Sequence = newSequence;
        this.MasterList[start].Action = true;
      }
    }


    // editedrow.Action = true;
    editedrow.OldSequence = editedrow.Sequence;
    this.MasterList.sort((a, b) => a.Sequence - b.Sequence);
    this.datasource = new MatTableDataSource<IMaster>(this.MasterList);
    this.datasource.sort = this.sort;
    this.datasource.paginator = this.paginator;

  }
  onBlur(element) {
    //debugger;
    element.Action = true;
  }
  GetSubMasters(element) {
    debugger;
    this.loading = true;
    var _appId = this.MasterData.filter(f => f.MasterDataId == element.MasterDataId)[0].ApplicationId;
    this.SubMasters = [];
    this.contentservice.GetDropDownDataFromDB(element.MasterDataId, this.UserDetails[0]["orgId"], _appId, 0)
      .subscribe((data: any) => {
        this.SubMasters = [...data.value];
        this.loading = false;
      })
    this.emptyresult();

  }
  AddData() {
    debugger;
    var subMasterId = this.searchForm.get("SubId").value;
    if (this.searchForm.get("ParentId").value == 0) {
      this.contentservice.openSnackBar("Please select master name to add items to", globalconstants.ActionText, globalconstants.RedBackground);
      //this.contentservice.openSnackBar("Please select master name to add items to", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    var _ParentId = 0;
    var _appId = 0;

    if (subMasterId > 0)
      _ParentId = subMasterId;
    else
      _ParentId = this.searchForm.get("ParentId").value.MasterDataId;

    var obj = this.MasterData.filter(f => f.MasterDataId == _ParentId)
    if (obj.length > 0)
      _appId = obj[0].ApplicationId;
    this.MasterList = [];
    let newrow = {
      "MasterDataId": 0,
      "OldSequence": 0,
      "MasterDataName": "",
      "Description": "",
      "Logic": "",
      "Sequence": 0,
      "ParentId": _ParentId,
      "OrgId": 0,
      "Active": 0,
      "ApplicationId": _appId,
      "Action": false
    }
    this.MasterList.push(newrow);

    this.datasource = new MatTableDataSource<IMaster>(this.MasterList);
  }
  Delete(row) {

    this.openDialog(row)
  }
  openDialog(row) {
    debugger;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Save',
          cancel: 'No'
        }
      }
    });

    dialogRef.afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.UpdateAsDeleted(row);
        }
      });
  }

  UpdateAsDeleted(row) {
    debugger;
    let toUpdate = {
      Active: 0,
      Deleted: true,
      UpdatedDate: new Date()
    }

    this.dataservice.postPatch('MasterItems', toUpdate, row.MasterDataId, 'patch')
      .subscribe(res => {
        row.Action = false;
        this.loading = false;
        var idx = this.MasterList.findIndex(x => x.MasterDataId == row.MasterDataId)
        this.MasterList.splice(idx, 1);
        this.datasource = new MatTableDataSource<any>(this.MasterList);
        this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

      });
  }

  GetSearchMaster() {

    this.loading = true;
    this.MasterList = [];
    this.Parent = '';
    this.datasource = new MatTableDataSource<IMaster>(this.MasterList);

    debugger;
    var _searchParentId = 0;
    var _OrgId = 0;
    var _appId = 0;
    //this.RowParent = [...this.SubMasters];
    if (this.searchForm.get("SubId").value > 0) {
      _searchParentId = this.searchForm.get("SubId").value;

    }
    else if (this.searchForm.get("ParentId").value.MasterDataId != undefined) {
      _searchParentId = this.searchForm.get("ParentId").value.MasterDataId;
    }
    else {
      _searchParentId = 0;
      //this.RowParent = [];
    }
    //if (_searchParentId > 0) {
    //_appId = this..filter(f=>f.MasterDataId==_searchParentId)[0].ApplicationId;
    var commonAppId;
    var permittedAppIdObj = this.tokenStorage.getPermittedApplications();
    var Ids = '';
    if (permittedAppIdObj.length > 0) {
      commonAppId = permittedAppIdObj.filter(f => f.appShortName == 'common');
      Ids = commonAppId[0].applicationId + "," + this.SelectedApplicationId
    }
    _OrgId = this.UserDetails[0]["orgId"];
    //}
    this.contentservice.GetDropDownDataFromDB(_searchParentId, _OrgId, Ids, 0)
      //this.GetMasters(_searchParentId, _OrgId,_appId)
      .subscribe((data: any) => {
        debugger;
        this.MasterList = data.value.map(item => {
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
            "Active": item.Active,
            "Action": false
          }
        })
        if (this.MasterList.length == 0) {
          this.contentservice.openSnackBar("No record found.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        if (this.searchForm.get("SubId").value > 0) {
          var obj = this.SubMasters.filter(f => f.MasterDataId == _searchParentId)
          if (obj.length > 0)
            this.Parent = obj[0].MasterDataName;
        }
        else
          this.Parent = this.searchForm.get("ParentId").value.MasterDataName;

        ////console.log("parent", this.Parent)
        this.MasterList.sort((a, b) => a.Sequence - b.Sequence);

        this.datasource = new MatTableDataSource<IMaster>(this.MasterList);
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort;
        this.loading = false;
      });
  }
  updateActive(row, value) {
    debugger;
    if (value.checked)
      row.Active = 1;
    else
      row.Active = 0;
    row.Action = true;
  }

  selected(event) {
    this.selectedData = event.target.value;
  }
  getoldvalue(value: string, row) {
    this.oldvalue = row.MasterDataName;
    //  //console.log('old value', this.oldvalue);
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
      this.contentservice.openSnackBar("Character should not be empty or greater than 50!", globalconstants.ActionText, globalconstants.RedBackground);
      //this.contentservice.openSnackBar("Character should not be empty or greater than 50!", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if (this.searchForm.get("ParentId").value == 0) {
      this.SubMasters = [];
      let duplicate = this.TopMasters.filter(item => item.OrgId == this.UserDetails[0]["orgId"]
        && item.MasterDataName.toLowerCase() == row.MasterDataName.toLowerCase()
        && item.ApplicationId == row.ApplicationId)
      if (duplicate.length > 0) {
        this.loading = false;
        //this.contentservice.openSnackBar("Data already exists in this master", this.optionNoAutoClose);
        this.contentservice.openSnackBar("Data already exists in this master", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }
    else {
      let duplicate = this.MasterData.filter(item => item.MasterDataName.toLowerCase() == row.MasterDataName.toLowerCase()
        && item.MasterDataId != row.MasterDataId && item.ApplicationId == row.ApplicationId && item.OrgId == row.OrgId);
      if (duplicate.length > 0) {
        this.loading = false;
        this.contentservice.openSnackBar("Data already exists!", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }

    var parent = this.searchForm.get("ParentId").value.MasterDataName;
    if (parent.length > 0) {
      if (parent.toLowerCase() == "student grade") {
        if (row.Sequence == 0) {
          this.contentservice.openSnackBar("Sequence is mandatory for Student Grade!", globalconstants.ActionText, globalconstants.RedBackground);
          //this.contentservice.openSnackBar("Sequence is mandatory for Student Grade");
          return;
        }
      }
    }
    var _ParentId = 0;
    if (row.ParentId == undefined || row.ParentId == 0)
      _ParentId = this.searchForm.get("ParentId").value.MasterDataId;
    else
      _ParentId = row.ParentId;

    let mastertoUpdate = {
      MasterDataId: row.MasterDataId,
      MasterDataName: row.MasterDataName,
      Description: row.Description,
      Logic: row.Logic == null ? '' : row.Logic,
      Sequence: row.Sequence == null ? 0 : row.Sequence,
      ParentId: _ParentId,// this.SearchParentId,
      ApplicationId: row.ApplicationId,
      Active: row.Active == true ? 1 : 0
    }

    if (row.MasterDataId == 0) {
      mastertoUpdate["CreatedBy"] = this.UserDetails[0]["userId"];
      mastertoUpdate["OrgId"] = this.UserDetails[0]["orgId"];
      //mastertoUpdate["ApplicationId"] = this.SelectedApplicationId;

      this.dataservice.postPatch('MasterItems', mastertoUpdate, 0, 'post')
        .subscribe((res: any) => {
          if (res != undefined) {
            row.MasterDataId = res.MasterDataId;
            row.Action = false;

            if (this.DataToSaveCount == 0) {
              this.loading = false;
              this.DataToSaveCount = -1;
              this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
              this.GetMastersForAutoComplete();
            }
          }
        }, error => console.log('insert error', error));
    }
    else {
      //console.log('data to update', mastertoUpdate);
      this.dataservice.postPatch('MasterItems', mastertoUpdate, row.MasterDataId, 'patch')
        .subscribe(res => {
          row.Action = false;
          if (this.DataToSaveCount == 0) {
            this.loading = false;
            this.DataToSaveCount = -1;
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
    }

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