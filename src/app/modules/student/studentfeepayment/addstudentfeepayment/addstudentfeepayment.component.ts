import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AlertService } from '../../../../shared/components/alert/alert.service';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
import { SharedataService } from '../../../../shared/sharedata.service';
import alasql from 'alasql';
import { evaluate } from 'mathjs';

@Component({
  selector: 'app-addstudentfeepayment',
  templateUrl: './addstudentfeepayment.component.html',
  styleUrls: ['./addstudentfeepayment.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AddstudentfeepaymentComponent implements OnInit {
  loading = false;
  NewDataCount = 0;
  TotalAmount = 0;
  exceptionColumns: boolean;
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any;
  CurrentRow: any = {};
  FeePayable = true;
  filteredOptions: Observable<string[]>;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SelectedBatchId = 0;
  studentInfoTodisplay = {
    BatchId: 0,
    StudentFeeType: '',
    StudentName: '',
    StudentClassName: '',
    FeeTypeId: 0,
    FeeType: '',
    Formula: '',
    StudentId: 0,
    ClassId: 0,
    SectionName: '',
    PayAmount: 0,
    StudentClassId: 0
  }

  Months = [];
  StudentName = '';
  loginUserDetail = [];
  Sections = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Locations = [];
  StudentClassFees: any[] = [];
  FeeTypes = [];
  LedgerListName = 'AccountingLedgerTrialBalances';
  ELEMENT_DATA: ILedger[] = [];
  ExistingStudentLedgerList = [];
  StudentLedgerList: ILedger[];
  Students: string[];
  dataSource: MatTableDataSource<ILedger>;
  billdataSource: MatTableDataSource<IPaymentDetail>;
  allMasterData = [];
  searchForm = new FormGroup({
    StudentId: new FormControl(0),
  });
  StudentBillList = [];
  StudentBillData = {
    PaymentId: 0,
    ClassFeeId: 0,
    PaymentAmount: 0,
    PaymentDate: Date,
    ParentId: 0,
    ReceiptNo: 0,
    OrgId: 0
  }
  StudentFeePaymentData = {
    StudentId: 0,
    StudentFeeId: 0,
    StudentClassId: 0,
    ClassFeeId: 0,
    FeeNameId: 0,
    FeeAmount: 0,
    PaidAmt: "0.00",
    BalanceAmt: "0.00",
    PaymentDate: new Date(),
    BatchId: 0,
    OrgId: 0,
    Remarks: '',
    Active: 1
  };
  displayedColumns = [
    'SlNo',
    'MonthName',
    'TotalCredit',
    'TotalDebit',
    'Balance',
    'Action'
  ];
  billDisplayedColumns = [
    'SlNo',
    'ClassFeeName',
    'PaymentAmt',
  ]
  constructor(private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private datepipe: DatePipe,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
    this.PageLoad();
  }
  PageLoad() {
    this.Months = globalconstants.getMonths();
    this.loginUserDetail = this.tokenstorage.getUserDetail();
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();

    this.shareddata.CurrentStudentId.subscribe(fy => (this.studentInfoTodisplay.StudentId = fy));
    this.shareddata.CurrentStudentClassId.subscribe(fy => (this.studentInfoTodisplay.StudentClassId = fy));
    this.shareddata.CurrentStudentName.subscribe(fy => (this.StudentName = fy));

    this.shareddata.CurrentFeeNames.subscribe(fy => (this.FeeNames = fy));
    this.shareddata.CurrentClasses.subscribe(fy => (this.Classes = fy));
    this.shareddata.CurrentBatch.subscribe(fy => (this.Batches = fy));
    this.shareddata.CurrentLocation.subscribe(fy => (this.Locations = fy));
    this.shareddata.CurrentFeeType.subscribe(fy => (this.FeeTypes = fy));
    this.shareddata.CurrentSection.subscribe(fy => (this.Sections = fy));
    this.GetStudentClass();
  }
  public calculateTotal() {
    this.TotalAmount = this.StudentBillList.reduce((accum, curr) => accum + curr.PaymentAmt, 0);
    return this.TotalAmount;
  }

  GetMasterData() {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].FEENAME);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASS);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions[0].applications[0].LOCATION);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SECTION);
        this.shareddata.CurrentFeeType.subscribe(f => this.FeeTypes = f);
        this.GetStudentClass();


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
  GetStudentClass() {

    if (this.studentInfoTodisplay.StudentClassId == undefined || this.studentInfoTodisplay.StudentClassId == 0)
      return;

    let filterstr = "Active eq 1 and StudentClassId eq " + this.studentInfoTodisplay.StudentClassId;

    let list: List = new List();
    list.fields = ["StudentClassId",
      "SectionId",
      "StudentId",
      "BatchId",
      "Student/Name",
      "ClassId",
      "FeeTypeId",
      "SchoolFeeType/FeeTypeName",
      "SchoolFeeType/Formula"
    ];
    list.lookupFields = ["Student", "SchoolFeeType"];
    list.PageName = "StudentClasses";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          //this.studentInfoTodisplay.studentClassId = data.value[0].StudentClassId
          this.studentInfoTodisplay.ClassId = data.value[0].ClassId
          this.studentInfoTodisplay.FeeTypeId = data.value[0].FeeTypeId;
          this.studentInfoTodisplay.FeeType = data.value[0].SchoolFeeType.FeeTypeName;
          this.studentInfoTodisplay.Formula = data.value[0].SchoolFeeType.Formula;
          this.studentInfoTodisplay.StudentName = data.value[0].Student.Name;

          this.studentInfoTodisplay.SectionName = this.Sections.filter(cls => {
            return cls.MasterDataId == data.value[0].SectionId
          })[0].MasterDataName;
          this.studentInfoTodisplay.StudentClassName = this.Classes.filter(cls => {
            return cls.MasterDataId == this.studentInfoTodisplay.ClassId
          })[0].MasterDataName;
          this.studentInfoTodisplay.StudentFeeType = this.FeeTypes.filter(f => {
            return f.FeeTypeId == this.studentInfoTodisplay.FeeTypeId
          })[0].FeeTypeName;

          this.GetStudentFeePayment();
        }
        else {
          this.alert.error("No class defined for this student!", this.optionsNoAutoClose);

        }
      })
  }
  GetStudentFeePayment() {
    debugger;
    if (this.studentInfoTodisplay.StudentId == 0)
      return;

    let list: List = new List();
    // list.fields = [
    //   'StudentFeeId',
    //   'StudentClassId',
    //   'StudentClass/ClassId',
    //   'ClassFeeId',
    //   'FeeAmount',
    //   'PaidAmt',
    //   'BalanceAmt',
    //   'BatchId',
    //   'PaymentDate',
    //   'PaymentDetails/PaymentId',
    //   'PaymentDetails/PaymentAmt',
    //   'PaymentDetails/PaymentDate',
    //   'Active'];

    //list.PageName = "StudentFeePayments";
    list.fields = ["StudentEmployeeLedegerId",
      "StudentClassId",
      "Month",
      "AccountGroupId",
      "AccountNatureId",
      "TotalDebit",
      "TotalCredit",
      "Balance",
      "OrgId",
      "BatchId",
      "Active"]
    list.PageName = this.LedgerListName;
    //list.lookupFields = ["StudentClass", "PaymentDetails"];
    list.filter = ['StudentClassId eq ' + this.studentInfoTodisplay.StudentClassId];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;

        this.ExistingStudentLedgerList = [...data.value];

        this.GetClassFee(this.studentInfoTodisplay.ClassId);

      });
  }

  GetClassFee(pclassId) {
    debugger;
    if (pclassId == undefined || pclassId == 0 || this.SelectedBatchId == 0) {
      this.alert.error('Invalid Id', this.optionsNoAutoClose);
      return;
    }
    //var selectedBatchStartEnd = {};
    //this.shareddata.CurrentSelectedBatchStartEnd.subscribe(b => selectedBatchStartEnd = b);

    let filterstr = "Active eq 1 and BatchId eq " + this.SelectedBatchId + " and ClassId eq " + pclassId;

    let list: List = new List();
    list.fields = [
      "ClassFeeId",
      "FeeNameId",
      "ClassId",
      "Amount",
      "BatchId",
      "Month",
      "Active",
      "LocationId",
      "PaymentOrder"];
    list.PageName = "ClassFees";
    list.orderBy = "PaymentOrder";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.StudentClassFees = data.value.map(f => {
            f.FeeName = this.FeeNames.filter(n => n.MasterDataId == f.FeeNameId)[0].MasterDataName;
            return f;
          });
          let itemcount = 0;
          let FeeName = '';
          this.StudentLedgerList = [];
          this.StudentClassFees.forEach((StudentClassFee, indx) => {

            let existing = this.ExistingStudentLedgerList.filter(fromdb => fromdb.Month == StudentClassFee.Month)
            //let toAdd;
            if (existing.length > 0) {
              existing.forEach(exitem => {
                itemcount += 1;

                this.StudentLedgerList.push({
                  SlNo: itemcount++,
                  StudentEmployeeLedegerId: exitem.StudentEmployeeLedegerId,
                  StudentClassId: exitem.StudentClassId,
                  Month: exitem.Month,
                  AccountGroupId: exitem.AccountGroupId,
                  AccountNatureId: exitem.AccountNatureId,
                  TotalDebit: exitem.TotalDebit,
                  TotalCredit: +exitem.TotalCredit,
                  PaymentOrder: StudentClassFee.PaymentOrder,
                  Balance: exitem.Balance,
                  MonthName: this.Months.filter(m => m.val == exitem.Month)[0].month,
                  BatchId: exitem.BatchId,
                  Action: false
                })
                //this.ELEMENT_DATA.push(toAdd);
              })
            }
            else {
              debugger;
              let AmountAfterFormulaApplied = 0;
              var formula = this.studentInfoTodisplay.Formula.replace('Amount', StudentClassFee.Amount);
              console.log('formula', formula)
              AmountAfterFormulaApplied = evaluate(formula);

              var monthadded = this.StudentLedgerList.filter(f => f.Month == StudentClassFee.Month);
              if (monthadded.length > 0) {
                monthadded[0].TotalCredit += +AmountAfterFormulaApplied;
                monthadded[0].Balance = monthadded[0].TotalCredit;
              }
              else
                this.StudentLedgerList.push({
                  SlNo: itemcount++,
                  StudentEmployeeLedegerId: 0,
                  StudentClassId: this.studentInfoTodisplay.StudentClassId,
                  Month: StudentClassFee.Month,
                  AccountGroupId: 0,
                  AccountNatureId: 0,
                  TotalDebit: 0,
                  TotalCredit: +AmountAfterFormulaApplied,
                  PaymentOrder: StudentClassFee.PaymentOrder,
                  Balance: +AmountAfterFormulaApplied,
                  MonthName: this.Months.filter(m => m.val == StudentClassFee.Month)[0].month,
                  BatchId: StudentClassFee.BatchId,
                  Action: false
                });
            }
          })
          // var res = alasql('SELECT MonthName,TotalCredit,TotalDebit,Balance SUM(TotalCredit) AS Amount FROM ? GROUP BY MonthName,Balance', [this.StudentLedgerList] );
          // console.log('data',this.StudentLedgerList)
          // console.log('res',res)
        }
        else {
          this.StudentLedgerList = [];
          this.alert.warn("Fees not defined for this class", this.optionsNoAutoClose);
        }

        this.StudentLedgerList.sort((a, b) => a.PaymentOrder - b.PaymentOrder);
        this.dataSource = new MatTableDataSource<ILedger>(this.StudentLedgerList);

      })
  }
  SelectRow(row, event) {

    if (event.checked) {
      this.NewDataCount++;

      var newdata = {};
      if (row.StudentEmployeeLedegerId > 0) {
        var previousLBId = 0;

        previousLBId = this.FeeNames.filter(fee => fee.MasterDataName.toLowerCase().includes('previous balance'))[0].MasterDataId;

        newdata = {
          SlNo: this.NewDataCount,
          PaymentId: 0,
          ClassFeeId: 0,
          ClassFeeName: '',
          PaymentAmt: +row.BalanceAmt,
          PaymentDate: new Date(),
          ParentId: 0,
          OrgId: 0,
          Active: 1
        }
      }
      newdata = {
        SlNo: this.NewDataCount,
        PaymentId: 0,
        ClassFeeId: row.ClassFeeId,
        ClassFeeName: row.ClassFeeName,
        PaymentAmt: +row.BalanceAmt,
        PaymentDate: new Date(),
        PaymentOrder: row.PaymentOrder,
        ParentId: 0,
        OrgId: 0,
        Active: 1
      }
      this.StudentBillList.push(newdata);
    }
    else {
      this.NewDataCount--;
      this.StudentBillList.splice(this.StudentBillList.indexOf(row), 1);
    }

    this.billdataSource = new MatTableDataSource<IPaymentDetail>(this.StudentBillList);

  }
  billpayment() {
    debugger;
    var maxSlNo = Math.max.apply(Math, this.StudentBillList.map(function (o) { return o.PaymentOrder; }));

    var previouspayments = this.StudentLedgerList.filter(f => f.PaymentOrder < maxSlNo && f.Balance > 0);
    if (previouspayments.length > 0) {
      this.alert.error("Previous outstanding must be cleared first", this.optionsNoAutoClose);
    }
    else {
    }

  }
  UpdateOrSave(row) {

    let re = /^[.0-9]*$/
    //console.log('pay', row.Pay)
    let valid = re.test(row.Pay);
    if (!valid) {
      this.alert.error("Invalid amount! Please enter numeric value", this.optionsNoAutoClose);
      return;
    }
    this.studentInfoTodisplay.PayAmount = row.Pay;

    //applied only for admission fee    
    let bl: any;
    if (row.ClassFeeName.toLowerCase().includes("admission")) {

      bl = row.FeeAmount - (+row.PaidAmt + (+this.studentInfoTodisplay.PayAmount));
      //console.log(bl);
      if (bl < 0) {
        this.alert.error("Invalid amount! Please enter pay amount less than or equal to balance amount", this.optionsNoAutoClose);
        return;
      }
    }
    //payment order has to start from one
    if (row.PaymentOrder > 1) {
      let previousBalance = this.ELEMENT_DATA.filter(d => d.PaymentOrder == (row.PaymentOrder - 1))[0].Balance;
      if (previousBalance > 0) {
        this.alert.error("Previous balance must be cleared!", this.optionsNoAutoClose);
        return;
      }
    }

    this.CurrentRow = row;

    //this.duplicate = false;
    let checkFilterString = "Active eq 1 " +
      " and StudentClassId eq " + row.StudentClassId +
      " and ClassFeeId eq " + row.ClassFeeId +
      " and BatchId eq " + row.BatchId

    if (row.StudentFeeId > 0)
      checkFilterString += " and StudentFeeId ne " + row.StudentFeeId;

    let list: List = new List();
    list.fields = ["StudentFeeId"];
    list.PageName = "StudentFeePayments";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0 && !row.ExceptionColumns) {
          //    this.duplicate = true;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          this.StudentFeePaymentData.StudentId = this.studentInfoTodisplay.StudentId;
          this.StudentFeePaymentData.Active = 1;
          this.StudentFeePaymentData.FeeAmount = row.FeeAmount.toFixed(2);
          this.StudentFeePaymentData.BatchId = this.SelectedBatchId;
          this.StudentFeePaymentData.StudentFeeId = row.StudentFeeId;
          this.StudentFeePaymentData.ClassFeeId = row.ClassFeeId;
          this.StudentFeePaymentData.FeeNameId = row.FeeNameId;
          this.StudentFeePaymentData.StudentClassId = row.StudentClassId;
          this.StudentFeePaymentData.OrgId = this.loginUserDetail[0]["orgId"];
          if (row.ClassFeeName.toLowerCase().includes("admission")) {
            this.StudentFeePaymentData.BalanceAmt = bl.toString();
            this.StudentFeePaymentData.PaidAmt = (+row.PaidAmt + (+this.studentInfoTodisplay.PayAmount)).toFixed(2);
          }
          else {
            this.StudentFeePaymentData.PaidAmt = row.BalanceAmt.toString(); //.FeeAmount.toFixed(2);
            this.StudentFeePaymentData.BalanceAmt = "0.00";
          }

          if (this.StudentFeePaymentData.StudentFeeId == 0)
            this.insert(row);
          else
            this.update();
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('StudentFeePayments', this.StudentFeePaymentData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.StudentFeeId = data.StudentFeeId;
          let paymentdetail = {
            PaymentAmt: this.studentInfoTodisplay.PayAmount.toString(),
            PaymentDate: new Date(),
            ParentId: data.StudentFeeId,
            ClassFeeId: +this.StudentFeePaymentData.ClassFeeId,
            OrgId: this.loginUserDetail[0]["orgId"],
            Active: 1
          }
          this.dataservice.postPatch('PaymentDetails', paymentdetail, 0, 'post')
            .subscribe(
              (data: any) => {
                //this.GetStudentFeePayment();
                this.alert.success("Data saved successfully", this.optionAutoClose);
              })
        });

  }
  update() {

    this.dataservice.postPatch('StudentFeePayments', this.StudentFeePaymentData, this.StudentFeePaymentData.StudentFeeId, 'patch')
      .subscribe(
        (data: any) => {
          let paymentdetail = {
            PaymentAmt: this.studentInfoTodisplay.PayAmount.toString(),
            PaymentDate: new Date(),
            ParentId: this.StudentFeePaymentData.StudentFeeId,
            ClassFeeId: +this.StudentFeePaymentData.ClassFeeId
          }
          // this.dataservice.postPatch('PaymentDetails', paymentdetail, this.StudentFeePaymentData.StudentFeeId, 'post')
          //   .subscribe(
          //     (data: any) => {
          //       this.GetStudentFeePayment();
          //       // this.CurrentRow.PaidAmt = this.StudentFeePaymentData.PaidAmt;
          //       // this.CurrentRow.BalanceAmt = this.StudentFeePaymentData.BalanceAmt;
          //       this.alert.success("Data updated successfully", this.optionAutoClose);
          //       //this.router.navigate(['/home/pages']);
          //     })
        });
  }
  GetDiscountFactor(feeName, indx) {
    let feeType = this.studentInfoTodisplay.StudentFeeType;
    let NoOfFreeMonth = 0;
    let numbericPartInFeetype = 0;
    let PayablePercent = 0;
    let splitArray = feeType.toLowerCase().split('%');
    if (feeName.toLowerCase().includes("admission"))
      PayablePercent = 1;
    else if (splitArray.length > 1) {
      numbericPartInFeetype = parseFloat(splitArray[0]);
      PayablePercent = (100 - numbericPartInFeetype) / 100;
    }
    else {

      let indexOfmonthFree = feeType.toLowerCase().indexOf('month free');
      if (indexOfmonthFree > -1) {
        NoOfFreeMonth = +feeType.substr(0, indexOfmonthFree);
        //equal to is included since admission is also in the loop
        if (NoOfFreeMonth > 0 && indx <= NoOfFreeMonth)
          PayablePercent = 0;
        else
          PayablePercent = 1;
      }
      else if (feeType.toLowerCase().includes("adjusted"))
        PayablePercent = 1;
      else if (feeType.toLowerCase() == "free")
        PayablePercent = 0;
    }

    return PayablePercent;
  }

  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  Receipt() {
    this.nav.navigate(['/admin/printreceipt/' + this.studentInfoTodisplay.StudentId]);
  }


  back() {
    this.nav.navigate(['/admin/dashboardstudent']);
  }
  validate(value) {
    value = "";
  }
  enableAction(element, amount) {
    debugger;
    if (amount.length == 0)
      element.Pay = 0.00;
    else
      element.Pay = amount;

    this.studentInfoTodisplay.PayAmount = element.Pay;

  }

}
export interface ILedger {
  SlNo: number,
  StudentEmployeeLedegerId: number;
  StudentClassId: number;
  Month: number;
  MonthName: string;
  AccountGroupId: number;
  AccountNatureId: number;
  TotalDebit: number;
  TotalCredit: number;
  Balance: number;
  BatchId: number;
  PaymentOrder: number;
  Action: boolean;
}
export interface IPaymentDetail {
  PaymentId: number;
  PaymentAmt: number;
  PaymentDate: Date;
  ParentId: number;
  ClassFeeId: number;
  OrgId: number;
  Active: number;
}


