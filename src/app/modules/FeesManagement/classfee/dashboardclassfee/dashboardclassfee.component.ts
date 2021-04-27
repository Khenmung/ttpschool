import { CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY } from '@angular/cdk/overlay/overlay-directives';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';

@Component({
  selector: 'app-dashboardclassfee',
  templateUrl: './dashboardclassfee.component.html',
  styleUrls: ['./dashboardclassfee.component.scss']
})
export class DashboardclassfeeComponent implements OnInit {
@ViewChild(MatSort) sort:MatSort;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };

  CurrentBatch = '';
  CurrentBatchId = 0;
  FeeNames = [];
  Classes = [];
  Batches = [];
  Locations = [];
  ClassStatuses = [];
  ELEMENT_DATA: Element[];
  dataSource: MatTableDataSource<Element>;
  allMasterData = [];
  searchForm: any;
  classFeeData = {
    ClassFeeId: 0,
    FeeNameId: 0,
    ClassId: 0,
    Amount: 0,
    Batch: 0,
    Active: 0,
    PaymentOrder: 0,
    LocationId: 0
  };
  constructor(private dataservice: NaomitsuService,
    private alert: AlertService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      ClassId: [0],
      FeeNameId: [0],
      Batch: [0],
    });
    this.GetMasterData();
    this.GetClassFee();

  }

  //displayedColumns = ['position', 'name', 'weight', 'symbol'];
  displayedColumns = ['SlNo', 'FeeName', 'Amount', 'PaymentOrder', 'Status', 'Action'];
  updateAlbum() {

  }
  getoldvalue() {

  }
  UpdateOrSave(row) {
    debugger;
    if (row.Amount == 0) {
      this.alert.error("Amount should be greater than zero.", this.options);
      return;
    }
    if (row.PaymentOrder < 1) {
      this.alert.error("Payment order must start from 1.");
      return;
    }
    let checkFilterString = "1 eq 1 " +
      " and FeeNameId eq " + row.FeeNameId +
      " and ClassId eq " + row.ClassId +
      " and Batch eq " + row.Batch +
      " and LocationId eq " + row.LocationId
    if (row.ClassFeeId > 0)
      checkFilterString += " and ClassFeeId ne " + row.ClassFeeId;

    let list: List = new List();
    list.fields = ["ClassFeeId"];
    list.PageName = "ClassFees";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.options);
        }
        else {
          this.classFeeData.Active = row.Status == true ? 1 : 0;
          this.classFeeData.Amount = row.Amount;
          this.classFeeData.Batch = row.Batch;
          this.classFeeData.ClassFeeId = row.ClassFeeId;
          this.classFeeData.ClassId = row.ClassId;
          this.classFeeData.FeeNameId = row.FeeNameId;
          this.classFeeData.PaymentOrder = +row.PaymentOrder;
          this.classFeeData.LocationId = +row.LocationId;
          //console.log('classfeedata',this.classFeeData);

          if (this.classFeeData.ClassFeeId == 0)
            this.insert(row);
          else
            this.update(row);
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('ClassFees', this.classFeeData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data saved successfully", this.options);
          //this.router.navigate(['/pages']);
        });

  }
  update(row) {

    this.dataservice.postPatch('ClassFees', this.classFeeData, this.classFeeData.ClassFeeId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully", this.options);
          //this.router.navigate(['/pages']);
        });

  }
  GetDistinctClassFee() {
    let list: List = new List();
    list.fields = ["ClassId"];
    list.PageName = "ClassFees";
    //list.groupby = "ClassId";
    list.filter = ["Active eq 1 and Batch eq " + this.CurrentBatchId];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          const unique = [...new Set(data.value.map(item => {
            return item.ClassId
          }))];
          this.ClassStatuses = this.Classes.map(cls => {
            let isdefined = unique.filter(definedcls => {
              return definedcls == cls.MasterDataId;
            });
            if (isdefined.length == 0)
              return {
                "class": cls.MasterDataName,
                "Done": false
              }
            else
              return {
                "class": cls.MasterDataName,
                "Done": true
              }
          })
          console.log('classes', this.ClassStatuses);

        }
      })
  }
  GetClassFee() {
    if (this.searchForm.get("ClassId").value == 0)
      return;
    let filterstr = "1 eq 1 ";
    if (this.searchForm.get("ClassId").value > 0)
      filterstr += " and ClassId eq " + this.searchForm.get("ClassId").value;
    if (this.searchForm.get("FeeNameId").value > 0)
      filterstr += " and FeeNameId eq " + this.searchForm.get("FeeNameId").value;
    if (this.searchForm.get("Batch").value > 0)
      filterstr += " and Batch eq " + this.searchForm.get("Batch").value;

    let list: List = new List();
    list.fields = ["ClassFeeId", "FeeNameId", "ClassId", "Amount", "Batch", "Active", "LocationId", "PaymentOrder"];
    list.PageName = "ClassFees";
    //list.orderBy ="PaymentOrder";
    list.filter = [filterstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;

        if (data.value.length > 0) {

          if (this.searchForm.get("FeeNameId").value == 0) {
            this.ELEMENT_DATA = this.FeeNames.map((mainFeeName, indx) => {
              let existing = data.value.filter(fromdb => fromdb.FeeNameId == mainFeeName.MasterDataId)
              if (existing.length > 0) {
                existing[0].SlNo = indx + 1;
                existing[0].Status = existing[0].Active == 1 ? true : false;
                existing[0].FeeName = this.FeeNames.filter(item => item.MasterDataId == existing[0].FeeNameId)[0].MasterDataName;
                existing[0].Action = false;
                existing[0].PaymentOrder = existing[0].PaymentOrder == null ? 0 : existing[0].PaymentOrder;
                return existing[0];
              }
              else
                return {
                  "SlNo": indx + 1,
                  "ClassFeeId": 0,
                  "FeeNameId": mainFeeName.MasterDataId,
                  "ClassId": this.searchForm.get("ClassId").value,
                  "FeeName": mainFeeName.MasterDataName,
                  "Amount": 0,
                  "Batch": this.Batches[0].MasterDataId,
                  "Status": false,
                  "PaymentOrder": 0,
                  "LocationId": this.Locations[0].MasterDataId,
                  "Action": false
                }
            })
          }
          else {
            this.ELEMENT_DATA = data.value.map((item, indx) => {
              return {
                "SlNo": indx + 1,
                "ClassFeeId": item.ClassFeeId,
                "FeeNameId": item.FeeNameId,
                "ClassId": item.ClassId,
                "FeeName": this.FeeNames.filter(cls => cls.MasterDataId == item.FeeNameId)[0].MasterDataName,
                "Amount": item.Amount,
                "Batch": item.Batch,
                "Status": item.Active == 1 ? true : false,
                "PaymentOrder": 0,
                "LocationId": item.LocationId,
                "Action": false
              }
            })
          }
        }
        else {
          if (this.searchForm.get("FeeNameId").value == 0) {
            this.ELEMENT_DATA = this.FeeNames.map((fee, indx) => {
              return {
                "SlNo": indx + 1,
                "ClassFeeId": 0,
                "FeeNameId": fee.MasterDataId,
                "ClassId": this.searchForm.get("ClassId").value,
                "FeeName": fee.MasterDataName,
                "Amount": 0,
                "Batch": this.Batches[0].MasterDataId,
                "Status": false,
                "PaymentOrder": 0,
                "LocationId": this.Locations[0].MasterDataId,
                "Action": false
              }
            });
          }
          else {
            this.ELEMENT_DATA = [];
            this.alert.info("No record found!", this.options);
          }
        }
        //this.ELEMENT_DATA=this.ELEMENT_DATA.sort((a,b)=>(a.PaymentOrder>b.PaymentOrder?1:-1))
        this.dataSource = new MatTableDataSource<Element>(this.ELEMENT_DATA);
        this.dataSource.sort = this.sort;
        //console.log("element data", this.ELEMENT_DATA)
      });
  }
  updateActive(row, value) {
    row.Action = true;
    row.Status = value.checked;
  }
  updateAmount(row, value) {
    row.Action = true;
    row.Amount = value;
  }
  updatePaymentOrder(row, value) {
    row.Action = true;
    row.PaymentOrder = value;
  }
  enableAction(row, value) {
    row.Action = true;
    row.Active = !row.Active;
    //let amount = +value;
    if (value == NaN)
      value = 0;
    row.Amount = parseFloat(value);
    //console.log('from change', row);
  }
  GetMasterData() {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        this.allMasterData = [...data.value];
        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions.FEENAMES);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.CLASSES);
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.BATCH);
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions.LOCATION);
        this.CurrentBatch = globalconstants.getCurrentBatch();
        let currentSession = this.Batches.filter(bat => {
          return bat.MasterDataName.toLowerCase() == this.CurrentBatch.toLowerCase();
        });
        if (currentSession.length == 0) {
          this.alert.error("Current batch not defined in master!", this.options);
        }
        else {
          this.CurrentBatchId = currentSession[0].MasterDataId;
          this.searchForm.patchValue({ Batch: this.CurrentBatchId });
          this.GetDistinctClassFee();
        }
      });

  }
  getDropDownData(dropdowntype) {
    let Id = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    })[0].MasterDataId;
    return this.allMasterData.filter((item, index) => {
      return item.ParentId == Id
    });
  }
}
export interface Element {
  ClassFeeId: number;
  FeeNameId: number;
  ClassId: number;
  Amount: any;
  Batch: number;
  Status: boolean;
  PaymentOrder: number;
  LocationId: number;
}
