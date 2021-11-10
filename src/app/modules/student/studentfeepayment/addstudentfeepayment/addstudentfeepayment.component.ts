import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { FeereceiptComponent } from '../feereceipt/feereceipt.component';
import { ContentService } from 'src/app/shared/content.service';

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
  @ViewChild(FeereceiptComponent) receipt: FeereceiptComponent;
  AccountingLedgerTrialBalanceListName = 'AccountingLedgerTrialBalances';
  AccountingVoucherListName = 'AccountingVouchers';
  FeeReceiptListName = 'StudentFeeReceipts';
  selectedIndex = 0;
  loading = false;
  Balance = 0;
  NewDataCount = 0;
  TotalAmount = 0;
  exceptionColumns: boolean;
  //isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  OffLineReceiptNo = '';
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
  NoOfBillItems = 0;
  studentInfoTodisplay = {
    StudentFeeReceiptId:0,
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
    StudentClassId: 0,
    ReceiptNo: 0,
    ReceiptDate: new Date()
  }
  FeePayment = {
    "StudentFeeReceipt": {},
    "LedgerAccount": [],
    "AccountingVoucher": []
  }
  OriginalAmountForCalc = 0;
  VariableObjList: any[] = [];
  Months = [];
  StudentName = '';
  loginUserDetail = [];
  Sections = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Locations = [];
  AccountNature = [];
  AccountGroup = [];
  StudentClassFees: any[] = [];
  FeeTypes = [];
  LedgerListName = 'AccountingLedgerTrialBalances';
  ELEMENT_DATA: ILedger[] = [];
  ExistingStudentLedgerList = [];
  StudentLedgerList: ILedger[];
  Students: string[];
  dataSource: MatTableDataSource<ILedger>;
  billdataSource: MatTableDataSource<any>;
  allMasterData = [];
  searchForm = new FormGroup({
    StudentId: new FormControl(0),
  });
  MonthlyDueDetail = [];
  StudentReceiptData = {
    StudentFeeReceiptId: 0,
    StudentClassId: 0,
    TotalAmount: 0,
    Balance: 0,
    ReceiptNo: 0,
    OffLineReceiptNo: '',
    ReceiptDate: new Date(),
    Discount: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 1,
    Ledgerdata: [],
    AccountingVouchers: []
  }
  AccountingVoucherData = {
    Month: 0,
    AccountingVoucherId: 0,
    DocDate: new Date(),
    PostingDate: new Date(),
    Reference: '',
    GLAccountId: 0,
    FeeReceiptId: 0,
    DebitCreditId: 0,
    Amount: 0,
    ClassFeeId: 0,
    ShortText: '',
    OrgId: 0,
    SubOrgId: 0,
    Active: 1
  }
  StudentLedgerData = {
    StudentEmployeeLedegerId: 0,
    StudentClassId: 0,
    Month: 0,
    AccountGroupId: 0,
    AccountNatureId: 0,
    TotalDebit: 0,
    TotalCredit: 0,
    Balance: 0,
    //MonthName: '',
    BatchId: 0,
    OrgId: 0,
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
    'FeeName',
    'Amount'
  ]
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
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
    this.shareddata.CurrentFeeNames.subscribe(fy => (this.FeeNames = fy));
    if (this.FeeNames.length == 0) {
      this.nav.navigate(["/edu"]);
    }
    else {
      debugger;
      this.MonthlyDueDetail = [];
      this.billdataSource = new MatTableDataSource<any>(this.MonthlyDueDetail);
      this.Months = this.contentservice.GetSessionFormattedMonths();
      this.loginUserDetail = this.tokenstorage.getUserDetail();
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();

      //this.shareddata.CurrentStudentId.subscribe(fy => (this.studentInfoTodisplay.StudentId = fy));
      this.studentInfoTodisplay.StudentId = this.tokenstorage.getStudentId()
      //this.shareddata.CurrentStudentClassId.subscribe(fy => (this.studentInfoTodisplay.StudentClassId = fy));
      this.studentInfoTodisplay.StudentClassId = this.tokenstorage.getStudentClassId();
      this.shareddata.CurrentStudentName.subscribe(fy => (this.StudentName = fy));


      this.shareddata.CurrentBatch.subscribe(fy => (this.Batches = fy));
      this.shareddata.CurrentLocation.subscribe(fy => (this.Locations = fy));
      this.shareddata.CurrentFeeType.subscribe(fy => (this.FeeTypes = fy));
      this.shareddata.CurrentSection.subscribe(fy => (this.Sections = fy));
      this.contentservice.GetClasses(this.loginUserDetail[0]["orgId"]).subscribe((data: any) => {
        this.Classes = [...data.value];
        this.GetMasterData();
      });
      this.GetStudentClass();
    }
  }
  public calculateTotal() {
    this.TotalAmount = this.MonthlyDueDetail.reduce((accum, curr) => accum + curr.Amount, 0);
    this.OriginalAmountForCalc = this.MonthlyDueDetail.reduce((accum, curr) => accum + curr.BaseAmountForCalc, 0);
    this.Balance = this.OriginalAmountForCalc - this.TotalAmount;
    return this.TotalAmount;
  }

  GetMasterData() {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions.school.FEENAME);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.shareddata.CurrentFeeType.subscribe(f => this.FeeTypes = f);
        this.AccountNature = this.getDropDownData(globalconstants.MasterDefinitions.accounting.ACCOUNTNATURE);
        this.AccountGroup = this.getDropDownData(globalconstants.MasterDefinitions.accounting.ACCOUNTGROUP);

        //this.GetClassFee(this.studentInfoTodisplay.ClassId);
        // this.GetStudentClass();
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
    debugger;
    if (this.studentInfoTodisplay.StudentClassId == undefined || this.studentInfoTodisplay.StudentClassId == 0)
      this.nav.navigate(["/edu"]);
    else {

      let filterstr = "Active eq 1 and StudentClassId eq " + this.studentInfoTodisplay.StudentClassId;

      let list: List = new List();
      list.fields = [
        "StudentClassId",
        "SectionId",
        "StudentId",
        "BatchId",
        "ClassId",
        "RollNo",
        "FeeTypeId"
      ];
      list.lookupFields = [
        "Student($select=FirstName,LastName)",
        "FeeType($select=FeeTypeName,Formula)"
      ];
      list.PageName = "StudentClasses";
      list.filter = [filterstr];

      this.dataservice.get(list)
        .subscribe((data: any) => {
          //debugger;
          if (data.value.length > 0) {
            //this.studentInfoTodisplay.studentClassId = data.value[0].StudentClassId
            this.studentInfoTodisplay.ClassId = data.value[0].ClassId
            this.studentInfoTodisplay.FeeTypeId = data.value[0].FeeTypeId;
            this.studentInfoTodisplay.FeeType = data.value[0].FeeType.FeeTypeName;
            this.studentInfoTodisplay.Formula = data.value[0].FeeType.Formula;
            this.studentInfoTodisplay.StudentName = data.value[0].Student.FirstName + " " + data.value[0].Student.LastName;

            this.studentInfoTodisplay.SectionName = this.Sections.filter(cls => {
              return cls.MasterDataId == data.value[0].SectionId
            })[0].MasterDataName;

            var clsObj = this.Classes.filter(cls => {
              return cls.MasterDataId == this.studentInfoTodisplay.ClassId
            })
            if (clsObj.length > 0)
              this.studentInfoTodisplay.StudentClassName = clsObj[0].ClassName;


            var feeObj = this.FeeTypes.filter(f => {
              return f.FeeTypeId == this.studentInfoTodisplay.FeeTypeId
            })
            if (feeObj.length > 0)
              this.studentInfoTodisplay.StudentFeeType = feeObj[0].FeeTypeName;

            this.studentInfoTodisplay.Formula = this.ApplyVariables(this.studentInfoTodisplay.Formula);
            this.VariableObjList.push(this.studentInfoTodisplay);
            this.GetStudentFeePayment();
          }
          else {
            this.alert.error("No class defined for this student!", this.optionsNoAutoClose);

          }
        })
    }
  }
  GetStudentFeePayment() {
    //debugger;
    if (this.studentInfoTodisplay.StudentId == 0) {
      this.nav.navigate(["/edu"]);
    }
    else {

      let list: List = new List();
      list.fields = [
        "StudentEmployeeLedegerId",
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
          //debugger;

          this.ExistingStudentLedgerList = [...data.value];

          this.GetClassFee(this.studentInfoTodisplay.ClassId);

        });
    }
  }

  GetClassFee(pclassId) {
    //debugger;
    if (pclassId == undefined || pclassId == 0 || this.SelectedBatchId == 0) {
      this.alert.error('Invalid Id', this.optionsNoAutoClose);
      return;
    }

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
            var _monthObj = this.Months.filter(m => m.val == f.Month)
            if (_monthObj.length > 0)
              f.MonthName = _monthObj[0].MonthName;
            else
              f.MonthName = '';
            return f;
          });
          let itemcount = 0;
          this.StudentLedgerList = [];
          this.StudentClassFees.forEach((studentClassFee, indx) => {
            let existing = this.ExistingStudentLedgerList.filter(fromdb => fromdb.Month == studentClassFee.Month)
            if (existing.length > 0) {
              var alreadyAdded = this.StudentLedgerList.filter(f => f.Month == studentClassFee.Month)
              if (alreadyAdded.length == 0)
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
                    PaymentOrder: studentClassFee.PaymentOrder,
                    Balance: exitem.Balance,
                    MonthName: studentClassFee.MonthName,
                    BatchId: exitem.BatchId,
                    Action: false
                  })
                })
            }
            else {
              //debugger;
              let AmountAfterFormulaApplied = 0;
              this.VariableObjList.push(studentClassFee);
              //console.log('before',this.VariableObjList)
              var formula = this.ApplyVariables(this.studentInfoTodisplay.Formula);
              this.VariableObjList.splice(this.VariableObjList.indexOf(studentClassFee), 1);
              //console.log('after',this.VariableObjList)
              //console.log('formula', formula)
              AmountAfterFormulaApplied = evaluate(formula);

              var monthadded = this.StudentLedgerList.filter(f => f.Month == studentClassFee.Month);
              if (monthadded.length > 0) {
                monthadded[0].TotalCredit += +AmountAfterFormulaApplied;
                monthadded[0].Balance = monthadded[0].TotalCredit;
              }
              else
                this.StudentLedgerList.push({
                  SlNo: itemcount++,
                  StudentEmployeeLedegerId: 0,
                  StudentClassId: this.studentInfoTodisplay.StudentClassId,
                  Month: studentClassFee.Month,
                  AccountGroupId: 0,
                  AccountNatureId: 0,
                  TotalDebit: 0,
                  TotalCredit: +AmountAfterFormulaApplied,
                  PaymentOrder: studentClassFee.PaymentOrder,
                  Balance: +AmountAfterFormulaApplied,
                  MonthName: studentClassFee.MonthName,
                  BatchId: studentClassFee.BatchId,
                  Action: false
                });
            }
          })
        }
        else {
          this.StudentLedgerList = [];
          this.alert.warn("Fees not defined for this class", this.optionsNoAutoClose);
        }

        this.StudentLedgerList.sort((a, b) => a.PaymentOrder - b.PaymentOrder);
        console.log("this.StudentLedgerList",this.StudentLedgerList)
        this.dataSource = new MatTableDataSource<ILedger>(this.StudentLedgerList);

      })
  }
  ApplyVariables(formula) {
    var filledVar = formula;
    this.VariableObjList.forEach(m => {
      Object.keys(m).forEach(f => {
        if (filledVar.includes(f)) {
          if (isNaN(m[f]))
            filledVar = filledVar.replaceAll(f, "'" + m[f] + "'");
          else
            filledVar = filledVar.replaceAll(f, m[f]);
        }
      });
    })
    return filledVar;
  }
  SelectRow(row, event) {
    debugger;
    if (event.checked) {
      var previousBalancePaymentOrderObj = this.StudentLedgerList.filter(f => f.PaymentOrder < row.PaymentOrder && +f.Balance > 0);
      var paymentOrderSelected = [];
      //checking if previous balance exist
      if (previousBalancePaymentOrderObj.length > 0) {
        paymentOrderSelected = this.MonthlyDueDetail.filter(f => f.PaymentOrder == previousBalancePaymentOrderObj[0].PaymentOrder)
        if (paymentOrderSelected.length == 0)//means not selected yet
        {
          row.Action = false;
          this.alert.info("Previous balance must be cleared first.", this.optionsNoAutoClose);
          return;
        }
      }
      row.Action = true;
      var SelectedMonthFees = this.StudentClassFees.filter(f => f.Month == row.Month);
      //var newdata = [];
      if (row.StudentEmployeeLedegerId > 0) {
        var previousLBId = 0;
        previousLBId = this.FeeNames.filter(fee => fee.MasterDataName.toLowerCase().includes('previous balance'))[0].MasterDataId;
        var balanceClassFeeId = this.StudentClassFees.filter(f => f.FeeNameId == previousLBId)[0].ClassFeeId;
        this.NewDataCount++;
        this.MonthlyDueDetail.push({
          SlNo: this.NewDataCount,
          AccountingVoucherId: 0,
          PostingDate: new Date(),
          Reference: '',
          GLAccountId: row.StudentEmployeeLedegerId,
          DebitCreditId: 0,
          FeeName: SelectedMonthFees[0].FeeName,
          BaseAmountForCalc: +row.Balance,
          Amount: +row.Balance,
          ClassFeeId: SelectedMonthFees[0].ClassFeeId,//balanceClassFeeId,
          ShortText: '',
          Month: row.Month,
          PaymentOrder: row.PaymentOrder,
          OrgId: this.loginUserDetail[0]["orgId"],
          SubOrgId: 0,
          Active: 1,
          Action: true
        });
      }
      else {
        var AmountAfterFormulaApplied = 0;
        SelectedMonthFees.forEach(f => {
          this.VariableObjList.push(f);
          var formula = this.ApplyVariables(this.studentInfoTodisplay.Formula);
          this.VariableObjList.splice(this.VariableObjList.indexOf(f), 1);
          AmountAfterFormulaApplied = evaluate(formula);
          this.NewDataCount++;
          this.MonthlyDueDetail.push({
            SlNo: this.NewDataCount,
            AccountingVoucherId: 0,
            PostingDate: new Date(),
            Reference: '',
            GLAccountId: row.StudentEmployeeLedegerId,
            DebitCreditId: 0,
            FeeName: f.FeeName,
            BaseAmountForCalc: +AmountAfterFormulaApplied,
            Amount: +AmountAfterFormulaApplied,
            Month: row.Month,
            ClassFeeId: f.ClassFeeId,
            ShortText: '',
            PaymentOrder: row.PaymentOrder,
            OrgId: this.loginUserDetail[0]["orgId"],
            SubOrgId: 0,
            Active: 1,
            Action: true
          })
        })
      }
    }
    else {
      //debugger;
      this.NewDataCount--;
      var toDelete = this.MonthlyDueDetail.filter(f => f.Month == row.Month);
      toDelete.forEach(d => {
        var indx = this.MonthlyDueDetail.indexOf(d);
        this.MonthlyDueDetail.splice(indx, 1);
      })
      row.Action = false;
    }

    this.billdataSource = new MatTableDataSource<IPaymentDetail>(this.MonthlyDueDetail);

  }
  billpayment() {
    //debugger;
    var error = [];
    var maxPaymentOrder = Math.max.apply(Math, this.MonthlyDueDetail.map(function (o) { return o.PaymentOrder; }));

    var previousBalancePaymentOrderObj = [];

    previousBalancePaymentOrderObj = this.StudentLedgerList.filter(f => f.PaymentOrder < maxPaymentOrder && +f.Balance > 0);
    var paymentOrderSelected = [];
    if (previousBalancePaymentOrderObj.length > 0) {
      previousBalancePaymentOrderObj.forEach(p => {
        paymentOrderSelected = this.MonthlyDueDetail.filter(f => f.PaymentOrder == p.PaymentOrder)
        if (paymentOrderSelected.length == 0)//means not selected yet
          error.push(1);
      })
    }
    if (error.length > 0) {
      this.alert.info("Previous balance must be cleared first.", this.optionsNoAutoClose);
      return;
    }
    else {
      var howmanymonthSelected = alasql("select Month,COUNT(Month) as [Count] from ? GROUP BY Month", [this.MonthlyDueDetail]);
      //var monthgreaterthanOne = howmanymonthSelected.filter(f=>f.Count>1);

      if (howmanymonthSelected.length > 1 && this.Balance > 0) {
        this.alert.info("Previous balance must be cleared first before the next fee payment.", this.optionsNoAutoClose);
        return;
      }
      else {
        this.loading = true;
        // var SelectedMonths = this.StudentLedgerList.filter(f => f.Action)
        // this.NoOfMonthsInBill = SelectedMonths.length;
        // SelectedMonths.forEach(row => {
        //this.NoOfMonthsInBill--;
        this.UpdateOrSave();
        //})
      }
    }

  }
  UpdateOrSave() {
    debugger;
    if (this.StudentLedgerData.StudentEmployeeLedegerId == 0)
      this.insert();
    else
      this.update();
  }

  insert() {

    //debugger;
    //to get org specific receipt no.
    var list = new List();
    list.fields = ["ReceiptNo"];
    list.PageName = this.FeeReceiptListName;

    this.studentInfoTodisplay.ReceiptNo = this.StudentReceiptData.ReceiptNo;
    this.StudentReceiptData.StudentFeeReceiptId = 0;
    this.StudentReceiptData.TotalAmount = +this.TotalAmount;
    this.StudentReceiptData.BatchId = this.SelectedBatchId;
    this.StudentReceiptData.OrgId = this.loginUserDetail[0]["orgId"];
    this.StudentReceiptData.StudentClassId = this.studentInfoTodisplay.StudentClassId;
    this.StudentReceiptData.Balance = this.Balance;
    this.StudentReceiptData.Active = 1;
    this.StudentReceiptData.OffLineReceiptNo = this.OffLineReceiptNo;
    this.StudentReceiptData.Discount = 0;

    this.FeePayment.StudentFeeReceipt = this.StudentReceiptData;

    var SelectedMonths = this.StudentLedgerList.filter(f => f.Action)
    this.FeePayment.LedgerAccount["AccountingVoucher"] = [];
    SelectedMonths.forEach(selectedMonthrow => {
      var monthPayAmount = this.MonthlyDueDetail.filter(f => f.Month == selectedMonthrow.Month)
      var monthAmount = monthPayAmount.reduce((acc, item) => {
        return acc + item.Amount;
      }, 0)

      this.StudentLedgerData.StudentEmployeeLedegerId = selectedMonthrow.StudentEmployeeLedegerId;
      this.StudentLedgerData.Active = 1;
      this.StudentLedgerData.AccountGroupId = 188;// row.AccountGroupId;
      this.StudentLedgerData.BatchId = this.SelectedBatchId;
      this.StudentLedgerData.AccountNatureId = 189;// row.AccountNatureId;
      this.StudentLedgerData.Balance = this.Balance;
      this.StudentLedgerData.Month = selectedMonthrow.Month;
      this.StudentLedgerData.StudentClassId = selectedMonthrow.StudentClassId;
      this.StudentLedgerData.OrgId = this.loginUserDetail[0]["orgId"];
      this.StudentLedgerData.TotalDebit = monthAmount;
      this.StudentLedgerData.TotalCredit = selectedMonthrow.TotalCredit;

      this.FeePayment.LedgerAccount.push(this.StudentLedgerData);

      var monthPaydetail = this.MonthlyDueDetail.filter(f => f.Month == selectedMonthrow.Month)

      monthPaydetail.forEach((paydetail) => {

        this.AccountingVoucherData.AccountingVoucherId = 0;
        this.AccountingVoucherData.Month = paydetail.Month;
        this.AccountingVoucherData.ClassFeeId = paydetail.ClassFeeId;
        this.AccountingVoucherData.Amount = paydetail.Amount;
        this.AccountingVoucherData.DebitCreditId = 0;
        this.AccountingVoucherData.FeeReceiptId = 0;
        this.AccountingVoucherData.GLAccountId = selectedMonthrow.StudentEmployeeLedegerId;
        paydetail.GLAccountId = selectedMonthrow.StudentEmployeeLedegerId;
        this.AccountingVoucherData.ShortText = 'student fee payment';
        this.AccountingVoucherData.Active = 1;
        this.AccountingVoucherData.OrgId = this.loginUserDetail[0]["orgId"];
        this.AccountingVoucherData["CreatedDate"] = new Date();
        this.AccountingVoucherData["CreatedBy"] = this.loginUserDetail[0]["userId"];
        this.FeePayment.AccountingVoucher.push(this.AccountingVoucherData);

      })
    })
    //console.log("this.FeePayment", this.FeePayment);
    this.dataservice.postPatch(this.FeeReceiptListName, this.FeePayment, 0, 'post')
      .subscribe((data: any) => {
        this.StudentReceiptData.StudentFeeReceiptId =data.StudentFeeReceiptId;
        this.alert.success("Payment done successfully!", this.optionAutoClose);
      })
  }
  update() {

    this.dataservice.postPatch(this.AccountingLedgerTrialBalanceListName, this.StudentLedgerData, this.StudentLedgerData.StudentEmployeeLedegerId, 'patch')
      .subscribe(
        (data: any) => {
          // let paymentdetail = {
          //   PaymentAmt: this.studentInfoTodisplay.PayAmount.toString(),
          //   PaymentDate: new Date(),
          //   ParentId: this.StudentFeePaymentData.StudentFeeId,
          //   ClassFeeId: +this.StudentFeePaymentData.ClassFeeId
          // }

        });
  }

  pad(num: number, size: number): string {
    let s = num + "";
    var year = (new Date().getFullYear() + '').substr(2, 2)
    while (s.length < size - 2) s = "0" + s;
    return year + s;
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
    //debugger;
    if (amount.length == 0)
      element.Pay = 0.00;
    else
      element.Pay = amount;

    this.studentInfoTodisplay.PayAmount = element.Pay;

  }
  tabChanged(tabChangeEvent: number) {
    this.selectedIndex = tabChangeEvent;
    this.navigateTab(this.selectedIndex);
    //   console.log('tab selected: ' + tabChangeEvent);
  }
  public nextStep() {
    this.selectedIndex += 1;
    this.navigateTab(this.selectedIndex);
  }

  public previousStep() {
    this.selectedIndex -= 1;
    this.navigateTab(this.selectedIndex);
  }
  navigateTab(indx) {
    switch (indx) {
      case 0:
        this.PageLoad();
        break;
      case 1:
        this.receipt.PageLoad();
        break;
      default:
        this.PageLoad();
        break;
    }
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


