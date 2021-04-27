import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { DialogService } from 'src/app/shared/dialog.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';

@Component({
  selector: 'app-add-master-data',
  templateUrl: './add-master-data.component.html',
  styleUrls: ['./add-master-data.component.scss']
})
export class AddMasterDataComponent implements OnInit {
@ViewChild(MatPaginator) paginator:MatPaginator;
@ViewChild(MatSort) sort: MatSort;
  topMaster = 0;
  MasterData = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Locations = [];
  TopMasters = [];
  oldvalue = '';
  selectedData = '';
  datasource: MatTableDataSource<IMaster>;
  MasterDataStatus = [];
  DisplayColumns = [
    "Id",
    "Name",
    "Description",
    "Active"
  ];
  constructor(private fb: FormBuilder,
    private dataservice: NaomitsuService,
    private alert: AlertService,
    private dialog: DialogService) { }

  ngOnInit(): void {
    this.GetTopMasters();
  }
  enableAddNew=false;
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
      ParentId: [0]

    })
  GetTopMasters() {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "Description", "Active"];
    list.PageName = "MasterDatas";
    list.filter = ["ParentId eq 0 and Active eq 1"];//this.searchForm.get("ParentId").value];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          let defined;
          this.TopMasters = [...data.value];
          this.MasterDataStatus = Object.entries(globalconstants.MasterDefinitions).map(globalcons => {
            //console.log('inside',globalcons)
            defined = this.TopMasters.filter(fromdb => {
              return globalcons[1].toLowerCase() == fromdb.MasterDataName.toLowerCase();
            });

            if (defined.length > 0) {
              return {
                MasterDataName: globalcons[1],
                Done: true
              }
            }
            else {
              return {
                MasterDataName: globalcons[1],
                Done: false
              }
            }
          });
          //console.log('globalconstants', Object.entries(globalconstants.MasterDefinitions))
          //console.log('ok', this.MasterDataStatus)
        }
      });
  }
  enable(elment) {
    debugger;
    if (elment.value > 0)
      this.enableTopEdit = true;
    else
      this.enableTopEdit = false;
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
        "Description": toedit[0].Description==null?'edit me..':toedit[0].Description,
        "ParentId": 0,
        "Active": toedit[0].Active
      }
      if (this.searchForm.get("ParentId").value != 0) {
        this.MasterData = [];
        this.MasterData.push(newrow);
      }
      this.datasource = new MatTableDataSource<IMaster>(this.MasterData);
      this.datasource.paginator =this.paginator;
      this.datasource.sort = this.sort;
    }
  }
  NewTopMaster() {
    this.enableTopEdit=false;
    this.topMaster = 1;
    this.searchForm.patchValue({ ParentId: 0 });
    //console.log('searchvalue', this.searchForm.get("ParentId").value)
    this.AddData();
    this.GetTopMasters();
    this.topMaster = 0;
  }
  AddData() {
    debugger;
    this.enableTopEdit=false;

    if (this.searchForm.get("ParentId").value == 0 && this.topMaster == 0) {
      this.alert.error("Please select master name to add items to", this.optionAutoClose);
      return;
    }

    let newrow = {
      "Id": 0,
      "Name": "edit me..",
      "Description": "edit me..",
      "ParentId": this.searchForm.get("ParentId").value,
      "Active": 1
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
  GetMasterData() {
    this.enableTopEdit=false;
    this.enableAddNew =true;
    debugger;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "Description", "ParentId", "Active"];
    list.PageName = "MasterDatas";
    list.filter = ["ParentId eq " + this.searchForm.get("ParentId").value];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log("original",data.value);
        //this.MasterData = [...data.value];
        this.MasterData = data.value.map(item => {
          return {
            "Id": item.MasterDataId,
            "Name": item.MasterDataName,
            "Description": item.Description == null ? 'edit me..' : item.Description,
            "ParentId": item.ParentId,
            "Active": item.Active == 1 ? true : false
          }
        })
        this.datasource = new MatTableDataSource<IMaster>(this.MasterData);
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort;
        //console.log("after",this.MasterData);
        // this.FeeNames = this.getDropDownData(globalconstants.FEENAMES);
        // this.Classes = this.getDropDownData(globalconstants.CLASSES);
        // this.Batches = this.getDropDownData(globalconstants.BATCH);
        // this.Locations = this.getDropDownData(globalconstants.LOCATION);
        //this.classfeeForm.patchValue({ "LocationId": this.Locations[0].MasterDataId });
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
            MasterDataName: row.Name,
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
  updateName(value, row) {
    //console.log('d', row)
    debugger;
    if (row.Name == value)
      return;
    if (value.length == 0 || value.length > 50) {
      this.alert.error("Character should not be empty or less than 50!", this.optionAutoClose);
      return;
    }
    if (this.searchForm.get("ParentId").value == 0 || this.enableTopEdit) {
      let duplicate = this.TopMasters.filter(item => item.MasterDataName.toLowerCase() == value.toLowerCase())
      if (duplicate.length > 0) {
        this.alert.error("Data already exists in this master", this.optionNoAutoClose);
        return;
      }
    }
    else {
      let duplicate = this.MasterData.filter(item => item.Name.toLowerCase() == value.toLowerCase())
      if (duplicate.length > 0) {
        this.alert.error("Data already exists in this master", this.optionNoAutoClose);
        return;
      }
    }

    let mastertoUpdate = {
      MasterDataName: value,
      ParentId: this.enableTopEdit?0:this.searchForm.get("ParentId").value,
      Active: 1
    }

    let newlyAddedRow = this.MasterData.filter(item => {
      return item.Name == row.Name
    });

    let selectedMasterDataId = 0;
    if (newlyAddedRow[0].Id == 0) {
      this.dataservice.postPatch('MasterDatas', mastertoUpdate, 0, 'post')
        .subscribe(res => {
          if (res != undefined) {
            //newlyAddedRow[0].MasterDataId =res["MasterDataId"];
            this.GetTopMasters();
            if (this.searchForm.get("ParentId").value == 0)
              this.searchForm.patchValue({ ParentId: res["MasterDataId"] });
            this.GetMasterData();

            this.alert.success("Master data added!", this.optionAutoClose);
          }
        });
    }
    else {
      selectedMasterDataId = newlyAddedRow[0].Id;
      this.dataservice.postPatch('MasterDatas', mastertoUpdate, selectedMasterDataId, 'patch')
        .subscribe(res => {
          this.GetTopMasters();
          this.GetMasterData();
          this.alert.success("Master data updated!", this.optionAutoClose);

        });
    }
    this.enableTopEdit=false;
  }
  updateDescription(value, row) {
    debugger;
    if (this.oldvalue == value)
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