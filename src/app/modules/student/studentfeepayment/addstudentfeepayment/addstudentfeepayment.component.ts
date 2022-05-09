import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
import { SharedataService } from '../../../../shared/sharedata.service';
import alasql from 'alasql';
import { evaluate } from 'mathjs';
import { FeereceiptComponent } from '../feereceipt/feereceipt.component';
import { ContentService } from 'src/app/shared/content.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  StudentFeeLedgerName = 'Student Fee';
  Permission = 'deny';
  selectedIndex = 0;
  loading = false;
  Balance = 0;
  NewDataCount = 0;
  TotalAmount = 0;
  exceptionColumns: boolean;
  //isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  PaymentTypes = [];
  FeeCategories = [];
  OffLineReceiptNo = '';
  PaymentTypeId = 0;
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
    StudentFeeReceiptId: 0,
    BatchId: 0,
    RollNo: 0,
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
  SelectedApplicationId = 0;
  OriginalAmountForCalc = 0;
  VariableObjList: any[] = [];
  Months = [];
  StudentName = '';
  LoginUserDetail = [];
  Sections = [];
  FeeDefinitions = [];
  Classes = [];
  Batches = [];
  Locations = [];
  AccountNature = [];
  GeneralLedgers = [];
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
    PaymentTypeId: 0,
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
    LedgerId: 0,
    GeneralLedgerAccountId: 0,
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
    LedgerId: 0,
    StudentClassId: 0,
    Month: 0,
    //TotalDebit: 0,
    TotalCredit: 0,
    Balance: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 1
  };

  displayedColumns = [
    'SlNo1',
    'MonthName',
    'TotalDebit',
    'TotalCredit',
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

    private snackbar: MatSnackBar,
    private nav: Router,
    private datepipe: DatePipe,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
    this.PageLoad();
  }
  PageLoad() {
    debugger;
    this.shareddata.CurrentFeeDefinitions.subscribe(fy => (this.FeeDefinitions = fy));
    if (this.FeeDefinitions.length == 0) {
      this.nav.navigate(["/edu"]);
    }
    else {

      debugger;
      this.loading = true;
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.STUDENT.FEEPAYMENT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.MonthlyDueDetail = [];
        this.billdataSource = new MatTableDataSource<any>(this.MonthlyDueDetail);
        this.Months = this.contentservice.GetSessionFormattedMonths();
        this.LoginUserDetail = this.tokenstorage.getUserDetail();
        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();

        this.studentInfoTodisplay.StudentId = this.tokenstorage.getStudentId()
        this.studentInfoTodisplay.StudentClassId = this.tokenstorage.getStudentClassId();
        this.shareddata.CurrentStudentName.subscribe(fy => (this.StudentName = fy));

        this.Batches = this.tokenstorage.getBatches()
        this.shareddata.CurrentLocation.subscribe(fy => (this.Locations = fy));
        this.shareddata.CurrentFeeType.subscribe(fy => (this.FeeTypes = fy));
        this.shareddata.CurrentSection.subscribe(fy => (this.Sections = fy));
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
          this.GetMasterData();
        });
        this.GetStudentClass();
        this.getGeneralLedgers();
      }
    }
  }
  public calculateTotal() {
    this.TotalAmount = this.MonthlyDueDetail.reduce((accum, curr) => accum + curr.Amount, 0);
    this.OriginalAmountForCalc = this.MonthlyDueDetail.reduce((accum, curr) => accum + curr.BaseAmountForCalc, 0);
    this.Balance = this.OriginalAmountForCalc - this.TotalAmount;
    if (this.Balance < 0)
      this.Balance = 0;
    return this.TotalAmount;
  }
  getGeneralLedgers() {
    let list: List = new List();
    list.fields = [
      "GeneralLedgerId",
      "GeneralLedgerName",
      "AccountNatureId",
      "AccountGroupId"];
    list.PageName = "GeneralLedgers";
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.GeneralLedgers = [...data.value];
      })
  }
  GetMasterData() {
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.shareddata.CurrentFeeDefinitions.subscribe((f: any) => {
          this.FeeDefinitions = [...f];
          if (this.FeeDefinitions.length == 0) {
            this.contentservice.GetFeeDefinitions(this.LoginUserDetail[0]["orgId"], 1).subscribe((d: any) => {
              this.FeeDefinitions = [...d.value];
            })
          }
        })
        this.Batches = this.tokenstorage.getBatches()
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.shareddata.CurrentFeeType.subscribe(f => this.FeeTypes = f);
        this.AccountNature = this.getDropDownData(globalconstants.MasterDefinitions.accounting.ACCOUNTNATURE);
        this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
        this.PaymentTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.FEEPAYMENTTYPE);
        this.PaymentTypeId = this.PaymentTypes.filter(p => p.MasterDataName.toLowerCase() == "cash")[0].MasterDataId;
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
    if (this.studentInfoTodisplay.StudentClassId == undefined || this.studentInfoTodisplay.StudentClassId == 0) {
      this.contentservice.openSnackBar("Please define class for this student.", globalconstants.ActionText, globalconstants.RedBackground);
      this.nav.navigate(["/edu"]);
    }
    else {

      let filterstr = "Active eq 1 and StudentClassId eq " + this.studentInfoTodisplay.StudentClassId;
      this.loading = true;
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
          debugger;
          if (data.value.length > 0) {
            if (data.value[0].FeeType == undefined) {
              this.contentservice.openSnackBar("Fee Type not yet defined.", globalconstants.ActionText, globalconstants.RedBackground);
              //this.snackbar.open("Fee type not yet defined.",'Dimiss',{duration:10000});
              this.loading = false;
            }
            else {
              //this.studentInfoTodisplay.studentClassId = data.value[0].StudentClassId
              this.studentInfoTodisplay.ClassId = data.value[0].ClassId
              this.studentInfoTodisplay.FeeTypeId = data.value[0].FeeTypeId;
              this.studentInfoTodisplay.FeeType = data.value[0].FeeType.FeeTypeName;
              this.studentInfoTodisplay.Formula = data.value[0].FeeType.Formula;
              this.studentInfoTodisplay.RollNo = data.value[0].RollNo;
              this.studentInfoTodisplay.StudentName = data.value[0].Student.FirstName + " " + data.value[0].Student.LastName;

              var _sectionName = '';

              var obj = this.Sections.filter(cls => cls.MasterDataId == data.value[0].SectionId)
              if (obj.length > 0)
                _sectionName = obj[0].MasterDataName;
              this.studentInfoTodisplay.SectionName = _sectionName;

              var clsObj = this.Classes.filter(cls => cls.MasterDataId == this.studentInfoTodisplay.ClassId)
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
          }
          else {
            this.contentservice.openSnackBar("No class defined for this student!", globalconstants.ActionText, globalconstants.RedBackground);

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
        "LedgerId",
        "StudentClassId",
        "Month",
        "GeneralLedgerId",
        "TotalDebit",
        "TotalCredit",
        "Balance",
        "OrgId",
        "BatchId",
        "Active"]
      list.PageName = this.LedgerListName;
      //list.lookupFields = ["StudentClass", "PaymentDetails"];
      list.filter = ['Active eq 1 and StudentClassId eq ' + this.studentInfoTodisplay.StudentClassId];
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
      //this.alert.error('Invalid Id', this.optionsNoAutoClose);
      this.contentservice.openSnackBar("Invalid Id", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let filterstr = "Active eq 1 and BatchId eq " + this.SelectedBatchId + " and ClassId eq " + pclassId;

    let list: List = new List();
    list.fields = [
      "ClassFeeId",
      "FeeDefinitionId",
      "ClassId",
      "Amount",
      "BatchId",
      "Month",
      "Active",
      "LocationId",
      //"PaymentOrder"
    ];
    list.PageName = "ClassFees";
    list.lookupFields = ["FeeDefinition($select=FeeCategoryId,FeeName,AmountEditable)"];
    list.orderBy = "Month";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.StudentClassFees = data.value.map(studclsfee => {
            //f.FeeName = this.FeeDefinitions.filter(n => n.FeeDefinitionId == f.FeeDefinitionId)[0].FeeName;
            var catObj = this.FeeCategories.filter(cat => cat.MasterDataId == studclsfee.FeeDefinition.FeeCategoryId);
            var subcatObj = this.allMasterData.filter(cat => cat.MasterDataId == studclsfee.FeeDefinition.FeeSubCategoryId);
            var catName = '';
            if (catObj.length > 0)
              catName = catObj[0].MasterDataName
            var subcatName = '';
            if (subcatObj.length > 0)
              subcatName = subcatObj[0].MasterDataName
            studclsfee.FeeCategoryId = studclsfee.FeeDefinition.FeeCategoryId;
            studclsfee.FeeCategory = catName;
            studclsfee.FeeSubCategory = subcatName;
            studclsfee.FeeName = studclsfee.FeeDefinition.FeeName;
            studclsfee.AmountEditable = studclsfee.FeeDefinition.AmountEditable;
            var _monthObj = this.Months.filter(m => m.val == studclsfee.Month)
            if (_monthObj.length > 0)
              studclsfee.MonthName = _monthObj[0].MonthName;
            else
              studclsfee.MonthName = '';
            return studclsfee;
          }).sort((a, b) => a.FeeCategoryId - b.FeeCategoryId);

          let itemcount = 1;
          this.StudentLedgerList = [];
          this.StudentClassFees.forEach((studentClassFee) => {
            let existing = this.ExistingStudentLedgerList.filter(fromdb => fromdb.Month == studentClassFee.Month)
            if (existing.length > 0) {
              var alreadyAdded = this.StudentLedgerList.filter(f => f.Month == studentClassFee.Month)
              if (alreadyAdded.length == 0)
                existing.forEach(exitem => {
                  //itemcount += 1;
                  this.StudentLedgerList.push({
                    SlNo1: itemcount++,
                    LedgerId: exitem.LedgerId,
                    StudentClassId: exitem.StudentClassId,
                    Month: exitem.Month,
                    TotalDebit: exitem.TotalDebit,
                    TotalCredit: +exitem.TotalCredit,
                    GeneralLedgerId: exitem.GeneralLedgerId,
                    Balance: exitem.Balance,
                    MonthName: studentClassFee.MonthName,
                    FeeCategory: studentClassFee.FeeCategory,
                    FeeSubCategory: studentClassFee.FeeSubCategory,
                    BatchId: exitem.BatchId,
                    Action: false
                  })
                })
            }
            // else {
            //   //debugger;
            //   let AmountAfterFormulaApplied = 0;
            //   this.VariableObjList.push(studentClassFee);
            //   var formula = this.ApplyVariables(this.studentInfoTodisplay.Formula);
            //   //after applying, remove again since it is for each student
            //   this.VariableObjList.splice(this.VariableObjList.indexOf(studentClassFee), 1);
            //   AmountAfterFormulaApplied = evaluate(formula);

            //   var monthadded = this.StudentLedgerList.filter(f => f.Month == studentClassFee.Month);
            //   if (monthadded.length > 0) {
            //     monthadded[0].TotalDebit += +AmountAfterFormulaApplied;
            //     monthadded[0].Balance = monthadded[0].TotalDebit;
            //   }
            //   else {
            //     this.StudentLedgerList.push({
            //       SlNo1: itemcount++,
            //       LedgerId: 0,
            //       StudentClassId: this.studentInfoTodisplay.StudentClassId,
            //       Month: studentClassFee.Month,
            //       GeneralLedgerId: 0,
            //       TotalDebit: +AmountAfterFormulaApplied,
            //       TotalCredit: 0,
            //       Balance: +AmountAfterFormulaApplied,
            //       MonthName: studentClassFee.MonthName,
            //       FeeCategory: studentClassFee.FeeCategory,
            //       FeeSubCategory: studentClassFee.FeeSubCategory,
            //       BatchId: studentClassFee.BatchId,
            //       Action: false
            //     });
            //   }
            // }
          })
        }
        else {
          this.StudentLedgerList = [];
          this.contentservice.openSnackBar("Fees not defined for this class", globalconstants.ActionText, globalconstants.RedBackground);
        }

        this.StudentLedgerList.sort((a, b) => a.Month - b.Month);
        //console.log("this.StudentLedgerList", this.StudentLedgerList)
        this.dataSource = new MatTableDataSource<ILedger>(this.StudentLedgerList);
        this.loading = false;
      })
  }
  ApplyVariables(formula) {
    var filledVar = formula;
    this.VariableObjList.forEach(m => {
      Object.keys(m).forEach(f => {
        if (filledVar.includes(f)) {
          if (isNaN(m[f]))
            filledVar = filledVar.replaceAll("[" + f + "]", "'" + m[f] + "'");
          else
            filledVar = filledVar.replaceAll("[" + f + "]", m[f]);
        }
      });
    })
    return filledVar;
  }
  // AddNewItem(){
  //   var newitem={

  //   }
  //   this.MonthlyDueDetail.push(newitem);
  // }
  SelectRow(row, event) {
    debugger;
    if (event.checked) {
      var previousBalanceMonthObj = this.StudentLedgerList.filter(f => f.Month < row.Month && +f.Balance > 0);
      var MonthSelected = [];

      //checking if previous balance exist
      if (previousBalanceMonthObj.length > 0) {
        MonthSelected = this.MonthlyDueDetail.filter(f => f.Month == previousBalanceMonthObj[0].Month)
        if (MonthSelected.length == 0)//means not selected yet
        {
          row.Action = false;
          this.contentservice.openSnackBar("Previous balance must be cleared first.", globalconstants.ActionText, globalconstants.RedBackground);
          return;
        }
      }
      row.Action = true;
      var SelectedMonthFees = this.StudentClassFees.filter(f => f.Month == row.Month);

      //  debugger;
      var AmountAfterFormulaApplied = 0;
      SelectedMonthFees.forEach((f, indx) => {
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
          LedgerId: row.LedgerId,
          DebitCreditId: 0,
          FeeName: f.FeeName,
          BaseAmountForCalc: +AmountAfterFormulaApplied,
          Amount: +AmountAfterFormulaApplied,
          Month: row.Month,
          ClassFeeId: f.ClassFeeId,
          AmountEditable: f.AmountEditable,
          ShortText: '',
          OrgId: this.LoginUserDetail[0]["orgId"],
          SubOrgId: 0,
          Active: 1,
          Action: true
        })
      })
      //}
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
    ////console.log("this.MonthlyDueDetail", this.MonthlyDueDetail);
    this.billdataSource = new MatTableDataSource<IPaymentDetail>(this.MonthlyDueDetail);

  }
  billpayment() {
    //debugger;
    var error = [];
    var maxMonth = Math.max.apply(Math, this.MonthlyDueDetail.map(function (o) { return o.Month; }));
    this.StudentLedgerData.LedgerId = 0;
    var previousBalanceMonthObj = [];

    previousBalanceMonthObj = this.StudentLedgerList.filter(f => f.Month < maxMonth && +f.Balance > 0);
    var MonthSelected = [];
    if (previousBalanceMonthObj.length > 0) {
      previousBalanceMonthObj.forEach(p => {
        MonthSelected = this.MonthlyDueDetail.filter(f => f.Month == p.Month)
        if (MonthSelected.length == 0)//means not selected yet
          error.push(1);
      })
    }
    if (error.length > 0) {
      this.contentservice.openSnackBar("Previous balance must be cleared first.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      var howmanymonthSelected = alasql("select Month,COUNT(Month) as [Count] from ? GROUP BY Month", [this.MonthlyDueDetail]);
      //var monthgreaterthanOne = howmanymonthSelected.filter(f=>f.Count>1);

      if (howmanymonthSelected.length > 1 && this.Balance > 0) {
        this.contentservice.openSnackBar("Previous balance must be cleared first before the next fee payment.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
      else {
        this.loading = true;
        this.UpdateOrSave();
      }
    }

  }
  UpdateOrSave() {
    debugger;

    if (this.StudentLedgerData.LedgerId == 0)
      this.insert();
    else
      this.update();

  }

  insert() {

    var list = new List();
    list.fields = ["ReceiptNo"];
    list.PageName = this.FeeReceiptListName;

    this.studentInfoTodisplay.ReceiptNo = this.StudentReceiptData.ReceiptNo;
    this.StudentReceiptData.StudentFeeReceiptId = 0;
    this.StudentReceiptData.TotalAmount = +this.TotalAmount;
    this.StudentReceiptData.PaymentTypeId = +this.PaymentTypeId;
    this.StudentReceiptData.BatchId = this.SelectedBatchId;
    this.StudentReceiptData.OrgId = this.LoginUserDetail[0]["orgId"];
    this.StudentReceiptData.StudentClassId = this.studentInfoTodisplay.StudentClassId;
    this.StudentReceiptData.Balance = this.Balance;
    this.StudentReceiptData.Active = 1;
    this.StudentReceiptData.OffLineReceiptNo = this.OffLineReceiptNo;
    this.StudentReceiptData.Discount = 0;

    this.FeePayment.StudentFeeReceipt = this.StudentReceiptData;

    var SelectedMonths = this.StudentLedgerList.filter(f => f.Action)
    //this.FeePayment.LedgerAccount["AccountingVoucher"] = [];
    this.FeePayment.AccountingVoucher = [];
    this.FeePayment.LedgerAccount = [];
    SelectedMonths.forEach(selectedMonthrowFromLedger => {
      var monthPayAmount = this.MonthlyDueDetail.filter(f => f.Month == selectedMonthrowFromLedger.Month)
      var monthAmountFromClassFee = monthPayAmount.reduce((acc, item) => {
        return acc + item.Amount;
      }, 0)

      this.StudentLedgerData.LedgerId = selectedMonthrowFromLedger.LedgerId;
      this.StudentLedgerData.Active = 1;
      //this.StudentLedgerData.GeneralLedgerId = 0;//StudentFeeLedgerNameId;// row.AccountGroupId;
      this.StudentLedgerData.BatchId = this.SelectedBatchId;

      this.StudentLedgerData.Balance = this.Balance;
      this.StudentLedgerData.Month = selectedMonthrowFromLedger.Month;
      this.StudentLedgerData.StudentClassId = selectedMonthrowFromLedger.StudentClassId;
      this.StudentLedgerData.OrgId = this.LoginUserDetail[0]["orgId"];
      //this.StudentLedgerData.TotalDebit = selectedMonthrowFromLedger.TotalDebit == 0 ?monthAmountFromClassFee:selectedMonthrowFromLedger.TotalDebit;
      this.StudentLedgerData.TotalCredit = monthAmountFromClassFee;

      this.FeePayment.LedgerAccount.push(JSON.parse(JSON.stringify(this.StudentLedgerData)));

      var monthPaydetail = this.MonthlyDueDetail.filter(f => f.Month == selectedMonthrowFromLedger.Month)

      monthPaydetail.forEach((paydetail) => {
        paydetail.LedgerId = selectedMonthrowFromLedger.LedgerId;
        this.FeePayment.AccountingVoucher.push(
          {
            "AccountingVoucherId": 0,
            "Month": paydetail.Month,
            "ClassFeeId": paydetail.ClassFeeId,
            "Amount": paydetail.Amount,
            "DebitCreditId": 0,
            "FeeReceiptId": 0,
            "LedgerId": selectedMonthrowFromLedger.LedgerId,
            "ShortText": paydetail.ShortText,
            "Active": 1,
            "OrgId": this.LoginUserDetail[0]["orgId"],
            "CreatedDate": this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
            "DocDate": this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
            "PostingDate": this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
            "CreatedBy": this.LoginUserDetail[0]["userId"],
          });
      });
    })
    //console.log("this.FeePayment", this.FeePayment);
    this.dataservice.postPatch(this.FeeReceiptListName, this.FeePayment, 0, 'post')
      .subscribe((data: any) => {
        this.StudentReceiptData.StudentFeeReceiptId = data.StudentFeeReceiptId;
        this.loading = false;
        this.MonthlyDueDetail = [];
        this.billdataSource = new MatTableDataSource([]);

        this.contentservice.openSnackBar("Payment done successfully!", globalconstants.ActionText, globalconstants.BlueBackground);
        this.tabChanged(1);
      })
  }
  update() {

    this.dataservice.postPatch(this.AccountingLedgerTrialBalanceListName, this.StudentLedgerData, this.StudentLedgerData.LedgerId, 'patch')
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
    this.nav.navigate(['/edu/printreceipt/' + this.studentInfoTodisplay.StudentId]);
  }


  back() {
    this.nav.navigate(['/edu']);
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
    //   //console.log('tab selected: ' + tabChangeEvent);
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
  SlNo1: number,
  LedgerId: number;
  StudentClassId: number;
  Month: number;
  MonthName: string;
  FeeCategory: string;
  FeeSubCategory: string;
  GeneralLedgerId: number;
  TotalDebit: number;
  TotalCredit: number;
  Balance: number;
  BatchId: number;
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


