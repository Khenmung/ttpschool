import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  topMaster=0;
  MasterData = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Locations = [];
  TopMasters = [];
  oldvalue = '';
  selectedData = '';
  constructor(private fb: FormBuilder,
    private dataservice: NaomitsuService,
    private alert: AlertService,
    private dialog: DialogService) { }

  ngOnInit(): void {
    this.GetTopMasters();
  }
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
    list.fields = ["MasterDataId", "MasterDataName"];
    list.PageName = "MasterDatas";
    list.filter = ["ParentId eq 0 and Active eq 1"];//this.searchForm.get("ParentId").value];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.TopMasters = [...data.value];
      });

  }
  NewTopMaster(){
    this.topMaster=1;
    this.searchForm.patchValue({ParentId:0});
    this.AddData();
    this.GetTopMasters();
    this.topMaster=0;
  }
  AddData() {
    if(this.searchForm.get("ParentId").value==0 && this.topMaster==0)
    {
      this.alert.error("Please select master name to add items to",this.optionAutoClose);
      return;
    }

    let newrow = {
      "MasterDataId": 0,
      "MasterDataName": "edit me..",
      "Description": "",
      "ParentId": this.searchForm.get("ParentId").value,
      "Active": 1
    }
    let alreadyadded = this.MasterData.filter(item => item.MasterDataName == "");
    if (alreadyadded.length == 0)
      this.MasterData.push(newrow);
  }
  GetMasterData() {
    debugger;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "Description", "ParentId", "Active"];
    list.PageName = "MasterDatas";
    list.filter = ["ParentId eq " + this.searchForm.get("ParentId").value];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        this.MasterData = [...data.value];
        // this.FeeNames = this.getDropDownData(globalconstants.FEENAMES);
        // this.Classes = this.getDropDownData(globalconstants.CLASSES);
        // this.Batches = this.getDropDownData(globalconstants.BATCH);
        // this.Locations = this.getDropDownData(globalconstants.LOCATION);
        //this.classfeeForm.patchValue({ "LocationId": this.Locations[0].MasterDataId });
      });

  }
  updateActive(value) {
    //console.log('clicked',value);

    this.dialog.openConfirmDialog("Are you sure you want to deactivate " + value.MasterDataName + "?")
      .afterClosed().subscribe(res => {

        if(value.MasterDataId==0)
        {
          let indx =this.MasterData.map(item=>
            {
              return item.MasterDataId
            }).indexOf(0);

            this.MasterData.splice(indx,1);

        }
        if (res) {
          let mastertoUpdate = {
            Active: value.checked == true ? 1 : 0,
           // UploadDate: new Date()
          }

          this.dataservice.postPatch('MasterDatas', mastertoUpdate, value.MasterDataId, 'patch')
            .subscribe(res => {
              this.alert.success("Master data deactivated successfully.", this.optionAutoClose);
            });
        }
      });
  }

  selected(event) {
    this.selectedData = event.target.value;
    }
  getoldvalue(value: string) {
    this.oldvalue = value;
    //  console.log('old value', this.oldvalue);
  }
  updateName(value) {
    //console.log(value);
    //value.stopPropagation();
    debugger;
    if (this.oldvalue == value)
      return;
    if (value.length == 0 || value.length > 50) {
      this.alert.error("Character should not be empty or less than 50!",this.optionAutoClose);
      return;
    }
    
    let duplicate = this.MasterData.filter(item=>item.MasterDataName.toLowerCase() ==value.toLowerCase())
    if(duplicate.length>0)
    {
        this.alert.error("Data already exists in this master",this.optionNoAutoClose);
        return;
    }
    let mastertoUpdate = {
      MasterDataName: value,
      ParentId :this.searchForm.get("ParentId").value,
      Active: 1
    }

    let newlyAddedRow = this.MasterData.filter(item => {
      return item.MasterDataName == this.oldvalue
    });
    
    let selectedMasterDataId = newlyAddedRow[0].MasterDataId;
    if (selectedMasterDataId == 0) {
      
      this.dataservice.postPatch('MasterDatas', mastertoUpdate, 0, 'post')
        .subscribe(res => {
          if (res != undefined) {
            newlyAddedRow[0].MasterDataId = res["MasterDataId"];
            this.alert.success("Master data added!", this.optionAutoClose);
          }
        });
    }
    else {
      this.dataservice.postPatch('MasterDatas', mastertoUpdate, selectedMasterDataId, 'patch')
        .subscribe(res => {
          this.alert.success("Master data updated!", this.optionAutoClose);
        });
    }
  }
  updateDescription(value) {
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
      return item.Description == this.oldvalue
    })[0].MasterDataId;

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
