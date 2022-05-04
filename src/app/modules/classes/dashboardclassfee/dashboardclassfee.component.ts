import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { evaluate } from 'mathjs';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { AuthService } from 'src/app/_services/auth.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';

@Component({
  selector: 'app-dashboardclassfee',
  templateUrl: './dashboardclassfee.component.html',
  styleUrls: ['./dashboardclassfee.component.scss']
})

export class DashboardclassfeeComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
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
  VariableObjList = [];
  LedgerData = [];
  FeeDefinitionListName = 'FeeDefinitions'
  DataCountToUpdate = -1;
  LoginUserDetail = [];
  StandardFilterWithBatchId = '';
  StandardFilterWithPreviousBatchId = '';
  CurrentBatch = '';
  CurrentBatchId = 0;
  SelectedApplicationId = 0;
  SelectedBatchId = 0;
  PreviousBatchId = 0;
  FeeDefinitions = [];
  Classes = [];
  Batches = [];
  Locations = [];
  Permission = 'deny';
  DataToSaveInLoop = [];
  ClassStatuses = [];
  ELEMENT_DATA: Element[] = [];
  dataSource: MatTableDataSource<Element>;
  allMasterData = [];
  searchForm: any;
  classFeeData = {
    ClassFeeId: 0,
    FeeDefinitionId: 0,
    ClassId: 0,
    Amount: 0,
    BatchId: 0,
    Month: 0,
    OrgId: 0,
    Active: 0,
    LocationId: 0
  };
  //matcher = new TouchedErrorStateMatcher();
  constructor(
    private authservice: AuthService,
    private contentservice: ContentService,
    private token: TokenStorageService,
    private dataservice: NaomitsuService,

    private route: Router,
    private fb: FormBuilder,
    private shareddata: SharedataService) { }

  ngOnInit(): void {

    this.searchForm = this.fb.group({
      ClassId: [0],
      searchMonth: [0],
      //FeeDefinitionId: [0],

    });
    this.PageLoad();
  }
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.token.getUserDetail();

    if (this.LoginUserDetail == null || this.LoginUserDetail.length == 0)
      this.route.navigate(['auth/login']);
    else {
      this.SelectedApplicationId = +this.token.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.token, globalconstants.Pages.edu.CLASSCOURSE.CLASSFEE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      this.Months = this.contentservice.GetSessionFormattedMonths();
      //console.log("this.Months",this.Months);

      if (this.Permission == 'deny') {
      }
      else {
        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.token);
        //console.log("this.StandardFilterWithBatchId",this.StandardFilterWithBatchId);
        if (+this.token.getPreviousBatchId() > 0)
          this.StandardFilterWithPreviousBatchId = globalconstants.getStandardFilterWithPreviousBatchId(this.token)

        this.SelectedBatchId = +this.token.getSelectedBatchId();
        //console.log("this.SelectedBatchId",this.SelectedBatchId);
        this.PreviousBatchId = +this.token.getPreviousBatchId();
        if (this.SelectedBatchId == 0) {
          //this.contentservice.openSnackBar("Current batch not defined in master!", this.options);
          this.route.navigate(['/admin']);
          this.loading = false;
        }
        else {
          this.searchForm.patchValue({ Batch: this.SelectedBatchId });
          this.shareddata.CurrentFeeDefinitions.subscribe((f: any) => {
            this.FeeDefinitions = [...f];
            if (this.FeeDefinitions.length == 0) {
              this.contentservice.GetFeeDefinitions(this.LoginUserDetail[0]["orgId"], 1).subscribe((d: any) => {
                this.FeeDefinitions = [...d.value];
              })
            }
          })

          if (this.Classes.length == 0) {
            this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
              this.Classes = [...data.value];
              //this.GetMasterData();
            })
            this.GetDistinctClassFee();
            this.loading = false;
          }
        }
      }
    }
  }
  displayedColumns = [
    'ClassFeeId',
    'FeeName',
    'Amount',
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
  SelectAll(value) {

    if (value.checked) {
      this.ELEMENT_DATA.forEach(s => {
        s.Active = 1;
        s.Action = true;
      })
    }
    else {
      this.ELEMENT_DATA.forEach(s => {
        s.Active = 0;
        s.Action = true;
      })
    }
    this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort;
  }
  onBlur(element) {
    element.Action = true;
  }

  CreateInvoice() {
    // var selectedMonth = this.searchForm.get("searchMonth").value;
    // if (selectedMonth == 0) {
    //   this.contentservice.openSnackBar("Please select month.", globalconstants.ActionText, globalconstants.BlueBackground);
    //   return;
    // }
    //debugger;
    this.contentservice.getInvoice(this.LoginUserDetail[0]["orgId"], this.SelectedBatchId, 0)
      .subscribe((data: any) => {
        this.contentservice.createInvoice(data, this.SelectedBatchId, this.LoginUserDetail[0]["orgId"])
          .subscribe((data: any) => {
            this.loading = false;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          },
            error => {
              this.loading = false;
              this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage ,globalconstants.ActionText,globalconstants.RedBackground);
              console.log("error in createInvoice", error);
            })
      },
        error => {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage ,globalconstants.ActionText,globalconstants.RedBackground);
          console.log("error in getinvoice", error);
        })

    // var selectedMonth = this.searchForm.get("searchMonth").value;
    // if (selectedMonth == 0) {
    //   this.contentservice.openSnackBar("Please select month.", globalconstants.ActionText, globalconstants.BlueBackground);
    //   return;
    // }
    // var OrgIdAndbatchId = {
    //   OrgId: this.LoginUserDetail[0]["orgId"],
    //   BatchId: this.SelectedBatchId,
    //   Month: selectedMonth
    // }
    // this.loading = true;

    // this.authservice.CallAPI(OrgIdAndbatchId, 'getinvoice')
    //   .subscribe((data: any) => {
    //     console.log("invoices", data)
    //     var AmountAfterFormulaApplied = 0;

    //     data.forEach(inv => {
    //       this.VariableObjList.push(inv)
    //       if (inv.Formula.length > 0) {
    //         var formula = this.ApplyVariables(inv.Formula);
    //         //after applying, remove again since it is for each student
    //         this.VariableObjList.splice(this.VariableObjList.indexOf(inv), 1);
    //         AmountAfterFormulaApplied = evaluate(formula);
    //       }
    //       this.LedgerData.push({
    //         LedgerId: 0,
    //         Active: 1,
    //         GeneralLedgerId: 0,
    //         BatchId: this.SelectedBatchId,
    //         Balance: AmountAfterFormulaApplied,
    //         Month: inv.Month,
    //         StudentClassId: inv.StudentClassId,
    //         OrgId: this.LoginUserDetail[0]["orgId"],
    //         TotalDebit: AmountAfterFormulaApplied,
    //         TotalCredit: 0,
    //       });
    //     });
    //     var query = "select SUM(TotalCredit) TotalCredit, SUM(Balance) Balance, StudentClassId," +
    //       "LedgerId, Active, GeneralLedgerId, BatchId, Month, OrgId, TotalDebit " +
    //       "FROM ? GROUP BY StudentClassId, LedgerId,Active, GeneralLedgerId,BatchId, Month,OrgId";
    //     var sumFeeData = alasql(query, [this.LedgerData]);

    //     //console.log("sumFeeData",sumFeeData)
    //     this.authservice.CallAPI(sumFeeData, 'createinvoice')
    //       .subscribe((data: any) => {
    //         this.contentservice.openSnackBar("Invoice created successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
    //         this.loading = false;
    //       })
    //   });
  }
  ApplyVariables(formula) {
    var filledVar = formula;
    this.VariableObjList.forEach(stud => {
      Object.keys(stud).forEach(studproperty => {
        //var prop =studproperty.toLowerCase()
        if (filledVar.includes(studproperty)) {
          if (isNaN(stud[studproperty]))
            filledVar = filledVar.replaceAll("[" + studproperty + "]", "'" + stud[studproperty] + "'");
          else
            filledVar = filledVar.replaceAll("[" + studproperty + "]", stud[studproperty]);
        }
      });
    })
    return filledVar;
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
    debugger;
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

  Save(row) {
    this.DataCountToUpdate = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {
    debugger;
    if (row.Amount == 0) {
      row.Action = false;
      this.loading = false;
      this.contentservice.openSnackBar("Amount should be greater than zero.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else if (row.Amount > 100000) {
      row.Action = false;
      this.loading = false;
      this.contentservice.openSnackBar("Amount should be smaller than 100,000.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else if (row.Month == 0) {
      row.Action = false;
      this.loading = false;
      this.contentservice.openSnackBar("Please select month.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    let checkFilterString = "OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and FeeDefinitionId eq " + row.FeeDefinitionId +
      " and ClassId eq " + row.ClassId +
      " and Month eq " + row.Month
    //" and BatchId eq " + row.BatchId
    if (row.ClassFeeId > 0)
      checkFilterString += " and ClassFeeId ne " + row.ClassFeeId;

    let list: List = new List();
    list.fields = ["ClassFeeId"];
    list.PageName = "ClassFees";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar("Record already exists!", globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          this.classFeeData.Active = row.Active;
          this.classFeeData.Amount = row.Amount;
          this.classFeeData.BatchId = row.BatchId;
          this.classFeeData.ClassFeeId = row.ClassFeeId;
          this.classFeeData.ClassId = row.ClassId;
          this.classFeeData.FeeDefinitionId = row.FeeDefinitionId;
          this.classFeeData.LocationId = +row.LocationId;
          this.classFeeData.Month = row.Month;
          this.classFeeData.OrgId = this.LoginUserDetail[0]["orgId"];
          //console.log("dataclassfee", this.classFeeData);
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
          row.ClassFeeId = data.ClassFeeId;
          if (this.DataCountToUpdate == 0) {
            this.DataCountToUpdate = -1;
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
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
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
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
          ////console.log('classes', this.ClassStatuses);
          this.loading = false;
        }
      })
  }
  DataFromPreviousBatch = ''
  CopyFromPreviousBatch() {
    if (this.PreviousBatchId == -1)
      this.contentservice.openSnackBar("Previous batch not defined.", globalconstants.ActionText, globalconstants.RedBackground);
    else {

      this.GetClassFee(this.StandardFilterWithPreviousBatchId, 1)
    }
  }

  GetClassFee(OrgIdAndbatchId, previousbatch) {
    debugger;
    if (this.searchForm.get("ClassId").value == 0) {
      this.contentservice.openSnackBar("Please select class/course.", globalconstants.ActionText, globalconstants.RedBackground);
      return;

    }

    this.loading = true;
    let filterstr = " and Active eq 1 and ClassId eq " + this.searchForm.get("ClassId").value;
    if (this.searchForm.get("searchMonth").value > 0)
      filterstr += " and Month eq " + this.searchForm.get("searchMonth").value;

    let list: List = new List();
    list.fields = [
      "ClassFeeId",
      "FeeDefinitionId",
      "ClassId",
      "Amount",
      "Month",
      "BatchId",
      "Active",
      //"LocationId",
      "PaymentOrder"];
    list.PageName = "ClassFees";
    //list.orderBy ="PaymentOrder";
    list.filter = [OrgIdAndbatchId + filterstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        var _classFee = [...data.value];
        if (previousbatch == 1) {
          this.DataFromPreviousBatch = 'Data From Previous Batch'
          if (_classFee.length == 0) {
            this.contentservice.openSnackBar("No data from previous batch.", globalconstants.ActionText, globalconstants.RedBackground);
            this.loading = false;
            return;
          }
          list.filter = [this.StandardFilterWithBatchId + filterstr];
          this.dataservice.get(list)
            .subscribe((existingclsfee: any) => {
              _classFee = data.value.filter(f => existingclsfee.value.filter(g => g.FeeDefinitionId == f.FeeDefinitionId).length == 0)
              this.ProcessClassFee(_classFee, previousbatch)
            })
        }
        else {
          this.DataFromPreviousBatch = '';
          this.ProcessClassFee(_classFee, previousbatch)
        }

      });
  }
  ProcessClassFee(classFee, previousbatch) {
    if (classFee.length > 0) {
      this.ELEMENT_DATA = this.FeeDefinitions.map((mainFeeName, indx) => {
        let existing = classFee.filter(fromdb => fromdb.FeeDefinitionId == mainFeeName.FeeDefinitionId)
        if (existing.length > 0) {
          existing[0].SlNo = indx + 1;
          existing[0].FeeName = mainFeeName.FeeName;
          existing[0].Action = false;
          existing[0].ClassId = this.searchForm.get("ClassId").value
          existing[0].ClassFeeId = previousbatch == 1 ? 0 : existing[0].ClassFeeId
          existing[0].Active = previousbatch == 1 ? 0 : existing[0].Active
          existing[0].Month = previousbatch == 1 ? 0 : existing[0].Month;
          existing[0].BatchId = this.SelectedBatchId;

          return existing[0];
        }
        else if (previousbatch == 0)
          return {
            "SlNo": indx + 1,
            "ClassFeeId": 0,
            "FeeDefinitionId": mainFeeName.FeeDefinitionId,
            "ClassId": this.searchForm.get("ClassId").value,
            "FeeName": mainFeeName.FeeName,
            "Amount": 0,
            "Month": 0,
            "BatchId": this.SelectedBatchId,// this.Batches[0].MasterDataId,
            "Active": 0,
            "Action": false
          }
      })
    }
    else { //no existing data
      this.ELEMENT_DATA = this.FeeDefinitions.map((fee, indx) => {
        return {
          "SlNo": indx + 1,
          "ClassFeeId": 0,
          "FeeDefinitionId": fee.FeeDefinitionId,
          "ClassId": this.searchForm.get("ClassId").value,
          "FeeName": fee.FeeName,
          "Amount": 0,
          "Month": 0,
          "BatchId": this.SelectedBatchId,
          "Active": 0,
          //"LocationId": this.Locations[0].MasterDataId,
          "Action": false
        }
      });

    }
    //this.ELEMENT_DATA = 
    this.ELEMENT_DATA.sort((a, b) => b.Active - a.Active);
    ////console.log("this.ELEMENT_DATA", this.ELEMENT_DATA);
    this.dataSource = new MatTableDataSource<Element>(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loading = false;
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
  UpdateActive(row, value) {
    row.Action = true;
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
    ////console.log('from change', row);
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);


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
  FeeDefinitionId: number;
  ClassId: number;
  Amount: any;
  Month: number;
  BatchId: number;
  Active: number;
  //LocationId: number;
  Action: boolean;
}
