import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';

@Component({
  selector: 'app-dashboardclassfee',
  templateUrl: './dashboardclassfee.component.html',
  styleUrls: ['./dashboardclassfee.component.scss']
})

export class DashboardclassfeeComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  loading = false;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  Months = [];
  //SaveAll = false;
  DataCountToUpdate = -1;
  LoginUserDetail = [];
  StandardFilterWithBatchId = '';
  CurrentBatch = '';
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  FeeNames = [];
  Classes = [];
  Batches = [];
  Locations = [];
  //Months = [];
  //Years = [];
  DataToSaveInLoop = [];
  ClassStatuses = [];
  ELEMENT_DATA: Element[] = [];
  dataSource: MatTableDataSource<Element>;
  allMasterData = [];
  searchForm: any;
  classFeeData = {
    ClassFeeId: 0,
    FeeNameId: 0,
    ClassId: 0,
    Amount: 0,
    BatchId: 0,
    Recurring: 0,
    Month: 0,
    OrgId: 0,
    Active: 0,
    PaymentOrder: 0,
    LocationId: 0
  };
  //matcher = new TouchedErrorStateMatcher();
  constructor(
    private contentservice: ContentService,
    private token: TokenStorageService,
    private dataservice: NaomitsuService,
    private alert: AlertService,
    private route: Router,
    private fb: FormBuilder,
    private shareddata: SharedataService) { }

  ngOnInit(): void {


    this.searchForm = this.fb.group({
      ClassId: [0],
      FeeNameId: [0],

    });
  }
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.token.getUserDetail();
    //this.Months = this.GetSessionFormattedMonths();
    this.Months = this.contentservice.GetSessionFormattedMonths();
    console.log(this.Months)
    if (this.LoginUserDetail == null || this.LoginUserDetail.length == 0)
      this.route.navigate(['auth/login']);

    this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.token);
    this.SelectedBatchId = +this.token.getSelectedBatchId();
    if (this.SelectedBatchId == 0) {
      //this.alert.error("Current batch not defined in master!", this.options);
      this.route.navigate(['/admin']);
      this.loading = false;
    }
    else {
      this.searchForm.patchValue({ Batch: this.SelectedBatchId });
      if (this.Classes.length == 0) {
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
          if (this.FeeNames.length == 0)
            this.GetMasterData();
          this.loading = false;

        })
      }
    }
  }

  //displayedColumns = ['position', 'name', 'weight', 'symbol'];
  displayedColumns = [
    'SlNo',
    'FeeName',
    'Amount',
    'PaymentOrder',
    //'Recurring',
    'Month',
    'Active',
    'Action'];
  updateActive(row, value) {
    if (value.checked)
      row.Active = 1;
    else
      row.Active = 0;
    row.Action = true;
  }
  onBlur(element) {
    element.Action = true;
  }
  UpdateSelectedBatchId(value) {
    this.SelectedBatchId = value;
  }
  SaveAll() {
    this.loading = true;
    this.DataToSaveInLoop = this.ELEMENT_DATA.filter(f => f.Action);
    this.DataCountToUpdate = this.DataToSaveInLoop.length;
    this.DataToSaveInLoop.forEach((record) => {
      this.DataCountToUpdate--
      this.UpdateOrSave(record);
    })
  }
  GetSessionFormattedMonths() {
    var _sessionStartEnd = {
      StartDate: new Date(),
      EndDate: new Date()
    };
    var Months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    var monthArray = [];
    var selectedBatch = this.token.getSelectedBatchStartEnd();
    var b = JSON.parse(selectedBatch);
    if (b.length != 0) {
      _sessionStartEnd = { ...b };
      var _Year = new Date(_sessionStartEnd.StartDate).getFullYear();
      var startMonth = new Date(_sessionStartEnd.StartDate).getMonth();

      for (var month = 0; month < 12; month++, startMonth++) {
        monthArray.push({
          MonthName: Months[startMonth] + " " + _Year,
          val: _Year + startMonth.toString().padStart(2, "0")
        })
        if (startMonth == 11) {
          startMonth = -1;
          _Year++;
        }
      }
    }
    return monthArray;
  }
  //   this.shareddata.CurrentSelectedBatchStartEnd$.subscribe((b: any) => {

  //     if (b.length != 0) {
  //       _sessionStartEnd = { ...b };
  //       var _Year = new Date(_sessionStartEnd.StartDate).getFullYear();
  //       var startMonth = new Date(_sessionStartEnd.StartDate).getMonth();

  //       for (var month = 0; month < 12; month++, startMonth++) {
  //         monthArray.push({
  //           MonthName: Months[startMonth] + " " + _Year,
  //           val: _Year + startMonth.toString().padStart(2, "0")
  //         })
  //         if (startMonth == 11) {
  //           startMonth = -1;
  //           _Year++;
  //         }
  //       }
  //     }
  //   });
  //   return monthArray;
  // }
  Save(row) {
    this.DataCountToUpdate = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {
    //debugger;
    if (row.Amount == 0) {
      row.Action = false;
      this.alert.error("Amount should be greater than zero.", this.optionsNoAutoClose);
      return;
    }
    else if (row.Amount > 100000) {
      row.Action = false;
      this.alert.error("Amount should be smaller than 100,000.", this.optionsNoAutoClose);
      return;
    }
    else if (row.PaymentOrder > 99) {
      row.Action = false;
      this.alert.error("only two digits are allowed for payment order!", this.optionsNoAutoClose);
      return;
    }

    this.loading = true;
    let checkFilterString = "1 eq 1 " +
      " and FeeNameId eq " + row.FeeNameId +
      " and ClassId eq " + row.ClassId +
      " and Month eq " + row.Month +
      " and BatchId eq " + row.BatchId +
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
          this.alert.error("Record already exists!", this.optionAutoClose);
        }
        else {
          this.classFeeData.Active = row.Active;
          this.classFeeData.Amount = row.Amount;
          this.classFeeData.BatchId = row.BatchId;
          this.classFeeData.ClassFeeId = row.ClassFeeId;
          this.classFeeData.ClassId = row.ClassId;
          this.classFeeData.FeeNameId = row.FeeNameId;
          this.classFeeData.PaymentOrder = +row.PaymentOrder;
          this.classFeeData.LocationId = +row.LocationId;
          this.classFeeData.Month = row.Month;
          this.classFeeData.Recurring = 0;
          this.classFeeData.OrgId = this.LoginUserDetail[0]["orgId"];
          console.log("dataclassfee", this.classFeeData);
          if (this.classFeeData.ClassFeeId == 0)
            this.insert(row);
          else
            this.update(row);
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('ClassFees', this.classFeeData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.loading = false;
          if (this.DataCountToUpdate == 0) {
            this.DataCountToUpdate = -1;
            this.alert.success("All data saved sucessfully.", this.optionAutoClose);
          }
        });

  }
  update(row) {

    this.dataservice.postPatch('ClassFees', this.classFeeData, this.classFeeData.ClassFeeId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.loading = false;
          if (this.DataCountToUpdate == 0) {
            this.DataCountToUpdate = -1;
            this.alert.success("All data saved sucessfully.", this.optionAutoClose);
          }

        });
  }
  GetDistinctClassFee() {
    let list: List = new List();
    list.fields = ["ClassId"];
    list.PageName = "ClassFees";
    //list.groupby = "ClassId";
    list.filter = ["Active eq 1 and " + this.StandardFilterWithBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          const unique = [...new Set(data.value.map(item => {
            return item.ClassId
          }))];
          this.ClassStatuses = this.Classes.map(cls => {
            let isdefined = unique.filter(definedcls => {
              return definedcls == cls.ClassId;
            });
            if (isdefined.length == 0)
              return {
                "className": cls.ClassName,
                "Done": false
              }
            else
              return {
                "className": cls.ClassName,
                "Done": true
              }
          })
          //console.log('classes', this.ClassStatuses);
          this.loading = false;
        }
      })
  }
  GetClassFee() {

    if (this.searchForm.get("ClassId").value == 0) {
      this.alert.info("Please select class/course.", this.optionAutoClose);
      return;

    }

    this.loading = true;
    let filterstr = "";
    if (this.searchForm.get("ClassId").value > 0)
      filterstr += " and ClassId eq " + this.searchForm.get("ClassId").value;
    if (this.searchForm.get("FeeNameId").value > 0)
      filterstr += " and FeeNameId eq " + this.searchForm.get("FeeNameId").value;
    //if (this.searchForm.get("Batch").value > 0)
    //filterstr += " and Batch eq " + this.SelectedBatchId;

    let list: List = new List();
    list.fields = [
      "ClassFeeId",
      "FeeNameId",
      "ClassId",
      "Amount",
      "Recurring",
      "Month",
      "BatchId",
      "Active",
      "LocationId",
      "PaymentOrder"];
    list.PageName = "ClassFees";
    //list.orderBy ="PaymentOrder";
    list.filter = [this.StandardFilterWithBatchId + filterstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;

        if (data.value.length > 0) {


          if (this.searchForm.get("FeeNameId").value == 0) {
            this.ELEMENT_DATA = this.FeeNames.map((mainFeeName, indx) => {
              let existing = data.value.filter(fromdb => fromdb.FeeNameId == mainFeeName.MasterDataId)
              if (existing.length > 0) {
                existing[0].SlNo = indx + 1;
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
                  "Recurring": 0,
                  "Month": 0,
                  "BatchId": this.SelectedBatchId,// this.Batches[0].MasterDataId,
                  "Active": 0,
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
                "Month": item.Month,
                "Recurring": item.Recurring,
                "BatchId": item.BatchId,
                "Active": item.Active,
                "PaymentOrder": 0,
                "LocationId": item.LocationId,
                "Action": false
              }
            })
          }
        }
        else { //no existing data
          if (this.searchForm.get("FeeNameId").value == 0) {
            this.ELEMENT_DATA = this.FeeNames.map((fee, indx) => {
              return {
                "SlNo": indx + 1,
                "ClassFeeId": 0,
                "FeeNameId": fee.MasterDataId,
                "ClassId": this.searchForm.get("ClassId").value,
                "FeeName": fee.MasterDataName,
                "Amount": 0,
                "Recurring": 0,
                "Month": 0,
                "BatchId": this.SelectedBatchId,
                "Active": 0,
                "PaymentOrder": 0,
                "LocationId": this.Locations[0].MasterDataId,
                "Action": false
              }
            });
          }
          else {
            this.ELEMENT_DATA = [];
            this.alert.info("No record found!", this.optionAutoClose);
          }
        }
        console.log("this.ELEMENT_DATA",this.ELEMENT_DATA);
        this.dataSource = new MatTableDataSource<Element>(this.ELEMENT_DATA);
        this.dataSource.sort = this.sort;
        this.loading = false;
      });
  }
  updateEnable(row, value) {
    row.Action = true;
    row.Status = value.checked;
  }
  updateRecurring(row, event) {
    row.Action = true;
    if (event.checked)
      row.Recurring = 1;
    else
      row.Recurring = 0;
  }
  updateAmount(row, value) {

    row.Action = true;
    // row.Amount = value;
  }
  updatePaymentOrder(row, value) {

    row.Action = true;

    //row.PaymentOrder = value;
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

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];

        //this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASS);
        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions.school.FEENAME);
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        //this.MonthYears = this.getDropDownData(globalconstants.MasterDefinitions.application);

        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));

        //this.shareddata.ChangeSubjects(this.Subjects);
        //this.shareddata.ChangeBatch(this.Batches);
        this.GetDistinctClassFee();

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
export interface Element {
  ClassFeeId: number;
  FeeNameId: number;
  ClassId: number;
  Amount: any;
  Month: number;
  Recurring: number;
  BatchId: number;
  Active: number;
  PaymentOrder: number;
  LocationId: number;
  Action: boolean;
}