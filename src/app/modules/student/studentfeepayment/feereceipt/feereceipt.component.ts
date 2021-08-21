import { EventEmitter, Output } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import alasql from 'alasql';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AlertService } from '../../../../shared/components/alert/alert.service';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
import { SharedataService } from '../../../../shared/sharedata.service';

@Component({
  selector: 'app-feereceipt',
  templateUrl: './feereceipt.component.html',
  styleUrls: ['./feereceipt.component.scss'],
  //encapsulation: ViewEncapsulation.None
})
export class FeereceiptComponent implements OnInit {
  @Input("BillDetail") BillDetail: any[];
  @Input("StudentClass") studentInfoTodisplay: any;
  @Input("OffLineReceiptNo") OffLineReceiptNo: any;
  @Input("StudentClassFees") StudentClassFees: any;

  loading = false;
  CancelReceiptMode = false;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  BillStatus = 0;
  CurrentBatchId = 0;
  ReceiptHeading = [];
  NewReceipt = true;
  Saved = false;
  PaymentIds = [];
  Sections = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Locations = [];
  //StudentClassFees: any[] = [];
  //FeeTypes = [];
  clickPaymentDetails = [];
  ELEMENT_DATA: IStudentFeePaymentReceipt[];
  StudentFeeReceiptListName = 'StudentFeeReceipts';
  FeeReceipt = [];
  StudentFeePaymentList: any[];
  Students: string[];
  dataSource: MatTableDataSource<any>;
  dataReceiptSource: MatTableDataSource<IReceipt>;
  allMasterData = [];
  SelectedBatchId = 0;
  searchForm = new FormGroup({
    StudentId: new FormControl(0),
  });
  StudentFeePaymentData = {
    StudentId: 0,
    StudentFeeId: 0,
    StudentClassId: 0,
    ClassFeeId: 0,
    FeeAmount: 0,
    PaidAmt: "0.00",
    BalanceAmt: "0.00",
    PaymentDate: new Date(),
    Batch: 0,
    Remarks: '',
    Active: 1
  };
  OriginalAmountForCalc = 0;
  TotalAmount = 0;
  Balance = 0;
  constructor(private dataservice: NaomitsuService,
    private tokenservice: TokenStorageService,
    private alert: AlertService,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
  }

  back() {

  }
  calculateBalance() {
    return this.Balance;
  }
  public calculateTotal() {

    if (this.BillDetail.length > 0) {
      this.TotalAmount = this.BillDetail.reduce((accum, curr) => accum + curr.Amount, 0);
      this.OriginalAmountForCalc = this.BillDetail.reduce((accum, curr) => accum + curr.BaseAmountForCalc, 0);
      this.Balance = this.OriginalAmountForCalc - this.TotalAmount;
    }
    // else if (this.clickPaymentDetails != null) {
    //   //var filteredPaymentDetail = this.clickPaymentDetails.filter(f=>f.month == )  
    //   this.TotalAmount = this.clickPaymentDetails.reduce((accum, curr) => accum + (+curr.Amount), 0);
    //   this.OriginalAmountForCalc = this.clickPaymentDetails.reduce((accum, curr) => accum + curr.BaseAmountForCalc, 0);
    //   this.Balance = this.OriginalAmountForCalc - this.TotalAmount;
    // }

    return this.TotalAmount;
  }
  displayedColumns = [
    'index',
    'FeeName',
    'Amount'
  ];
  ReceiptDisplayedColumns = [
    'ReceiptDate',
    'TotalAmount',
    'ReceiptNo',
    'Active'
  ]
  PageLoad() {
    this.loading = true;
    this.dataSource = new MatTableDataSource<any>(this.BillDetail);
    this.shareddata.CurrentClasses.subscribe(cls => (this.Classes = cls));
    this.shareddata.CurrentBatch.subscribe(lo => (this.Batches = lo));
    this.shareddata.CurrentSection.subscribe(pr => (this.Sections = pr));
    this.shareddata.CurrentStudentId.subscribe(id => (this.studentInfoTodisplay.StudentId = id));
    this.shareddata.CurrentStudentClassId.subscribe(scid => (this.studentInfoTodisplay.StudentClassId = scid));
    this.SelectedBatchId = +this.tokenservice.getSelectedBatchId();
    this.studentInfoTodisplay.OffLineReceiptNo = this.OffLineReceiptNo;
    this.studentInfoTodisplay.currentbatchId = this.SelectedBatchId;
    this.shareddata.CurrentFeeNames.subscribe(b => (this.FeeNames = b));
    console.log('fff', this.studentInfoTodisplay)
    debugger;
    this.GetMasterData();
    setTimeout(() => {

      this.GetBills();

    }, 1000);

  }

  viewDetail(row) {
    debugger;
    this.clickPaymentDetails = this.StudentFeePaymentList.filter(f => f.FeeReceiptId == row.StudentFeeReceiptId);
    this.studentInfoTodisplay.ReceiptNo = row.ReceiptNo;
    this.studentInfoTodisplay.OffLineReceiptNo = row.OffLineReceiptNo;
    this.TotalAmount = row.TotalAmount;
    this.Balance = row.Balance == null ? 0 : row.Balance;
    this.BillStatus = row.Active;
    this.dataSource = new MatTableDataSource<any>(this.clickPaymentDetails);
  }
  CancelReceipt() {
    debugger;
    this.loading = true;
    let receipt = {
      Active: 0
    }
    this.dataservice.postPatch(this.StudentFeeReceiptListName, receipt, this.studentInfoTodisplay.ReceiptNo, 'patch')
      .subscribe(
        (data: any) => {
          var IdCount = 0;
          var uniqueGLAccountId = alasql("select DISTINCT GLAccountId from ?", [this.BillDetail]);
          var toupdateLedger;
          IdCount = uniqueGLAccountId.length;
          uniqueGLAccountId.forEach(f => {
            toupdateLedger = {
              Active: 0,
              //StudentEmployeeLedegerId: f.GLAccountId
            }
            IdCount--;
            this.dataservice.postPatch('AccountingLedgerTrialBalances', toupdateLedger, f.GLAccountId, 'patch')
              .subscribe(
                (data: any) => {
                  if (IdCount == 0) {
                    this.loading = false;
                    this.TotalAmount = 0;
                    this.Balance = 0;
                    this.alert.success("Receipt cancelled successfully.", this.optionAutoClose);
                    this.CancelReceiptMode = false;
                    this.BillDetail = [];
                    this.dataSource = new MatTableDataSource<any>(this.BillDetail);
                    //this.tabChanged.emit(0);
                  }
                })
          })
        });
  }
  edit() {
    this.CancelReceiptMode = true;

  }
  done() {
    this.CancelReceiptMode = false;

  }
  GetStudentFeePaymentDetails(ReceiptNo) {
    debugger;
    if (this.studentInfoTodisplay.StudentId == 0)
      return;
    let filterstring = '';
    if (ReceiptNo == 0)
      filterstring = 'ReceiptNo eq null';
    else
      filterstring = 'ReceiptNo eq ' + ReceiptNo;
    filterstring += ' and Active eq 1';

    let list: List = new List();
    list.fields = [
      'StudentFeePayment/StudentFeeId',
      'StudentFeePayment/StudentClassId',
      'StudentFeePayment/StudentId',
      'StudentFeePayment/PaidAmt',
      'StudentFeePayment/BalanceAmt',
      'ClassFee/FeeNameId',
      'StudentFeeReceipt/OfflineReceiptNo',
      'StudentFeeReceipt/TotalAmount',
      'PaymentId',
      'ParentId',
      'ClassFeeId',
      'PaymentAmt',
      'ReceiptNo',
      'PaymentDate'];
    list.PageName = "PaymentDetails";
    list.lookupFields = ["StudentFeePayment", "ClassFee", "StudentFeeReceipt"];
    list.filter = [filterstring];
    list.orderBy = "PaymentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        let res: any[];
        if (data.value.length > 0) {
          this.studentInfoTodisplay.ReceiptNo = ReceiptNo;
          if (data.value[0].StudentFeeReceipt !== undefined)
            this.studentInfoTodisplay.OfflineReceiptNo = data.value[0].StudentFeeReceipt.OfflineReceiptNo;
          this.studentInfoTodisplay.ReceiptDate = data.value[0].PaymentDate
          this.studentInfoTodisplay.PaidAmt = data.value[0].StudentFeePayment.PaidAmt;
          this.studentInfoTodisplay.BalanceAmt = data.value[0].StudentFeePayment.BalanceAmt;
          this.studentInfoTodisplay.ClassFeeId = data.value[0].ClassFeeId;
          this.studentInfoTodisplay.ReceiptNo = data.value[0].ReceiptNo;
          this.studentInfoTodisplay.PaymentDate = data.value[0].PaymentDate;
          this.studentInfoTodisplay.TotalAmount = 0;
          res = data.value.filter(st => st.StudentFeePayment.StudentClassId == this.studentInfoTodisplay.StudentClassId)
            .map((item, indx) => {
              this.studentInfoTodisplay.TotalAmount += +item.PaymentAmt;
              return {
                SlNo: indx + 1,
                TotalAmount: 0,
                OfflineReceiptNo: '',
                StudentClassId: item.StudentFeePayment.StudentClassId,
                FeeName: item.ClassFee == undefined ? '' : this.FeeNames.filter(fee => fee.MasterDataId == item.ClassFee.FeeNameId)[0].MasterDataName,
                PaymentAmount: item.PaymentAmt,
                PaymentId: item.PaymentId,
                ParentId: item.ParentId,
                ReceiptNo: item.ReceiptNo,
                PaymentDate: item.PaymentDate,
                ClassFeeId: item.ClassFeeId,
                Action: ''
              }
            })
          if (res.length > 0) {
            this.NewReceipt = true;
            this.ELEMENT_DATA = [...res];
            //console.log('this.ELEMENT_DATA',this.ELEMENT_DATA)
            this.PaymentIds = res.map(id => id.PaymentId);
            this.dataSource = new MatTableDataSource<IStudentFeePaymentReceipt>(this.ELEMENT_DATA);
          }
          else {
            this.NewReceipt = false;
            //   this.GetBills();
          }
        }
        else {
          this.NewReceipt = false;
          //   this.GetBills();
        }
      })
  }
  GetBills() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "StudentFeeReceiptId",
      "StudentClassId",
      "TotalAmount",
      "Balance",
      "ReceiptNo",
      "OffLineReceiptNo",
      "ReceiptDate",
      "Discount",
      "Active",
      "AccountingVouchers/AccountingVoucherId",
      "AccountingVouchers/GLAccountId",
      "AccountingVouchers/FeeReceiptId",
      "AccountingVouchers/Amount",
      "AccountingVouchers/ClassFeeId"

    ];

    list.PageName = "StudentFeeReceipts";
    list.lookupFields = ["AccountingVouchers"];
    list.filter = ["StudentClassId eq " + this.studentInfoTodisplay.StudentClassId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeReceipt = [...data.value];
        this.StudentFeePaymentList = [];
        this.FeeReceipt.forEach(f => {
          f.AccountingVouchers.forEach(k => {
            k.FeeName = this.StudentClassFees.filter(f => f.ClassFeeId == k.ClassFeeId)[0].FeeName
            this.StudentFeePaymentList.push(k)
          })
        })
        console.log('payentdetail', this.StudentFeePaymentList)
        //console.log("Feereceipt", this.FeeReceipt);

        this.dataReceiptSource = new MatTableDataSource<any>(this.FeeReceipt);
        this.loading = false;
      })
  }
  GetMasterData() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "Logic", "ParentId", "Description"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 and (MasterDataName eq 'Receipt Heading' or OrgId eq 1)"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.allMasterData = [...data.value];
        this.ReceiptHeading = this.getDropDownData(globalconstants.MasterDefinitions.school.RECEIPTHEADING);
        this.ReceiptHeading.forEach(f => {
          f.Logic = f.Logic!=null?JSON.parse("{"+f.Logic + "}"):''
        })
        this.loading = false;
        //this.GetStudentClass();
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
  GetClassFee() {

    let filterstr = "Active eq 1 and StudentClassId eq " + this.studentInfoTodisplay.ClassId;

    let list: List = new List();
    list.fields = ["StudentClassId", "SectionId",
      "StudentId",
      "BatchId",
      "RollNo",
      "Student/FirstName",
      "Student/LastName",
      "ClassId",
      "FeeTypeId"];

    list.lookupFields = ["Student"];
    list.PageName = "StudentClasses";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.studentInfoTodisplay.StudentClassId = data.value[0].StudentClassId;
          this.studentInfoTodisplay.ClassId = data.value[0].ClassId;
          this.studentInfoTodisplay.RollNo = data.value[0].RollNo;
          //this.studentInfoTodisplay.ReceiptNo = data.value[0].FeeTypeId;
          this.studentInfoTodisplay.StudentName = data.value[0].Student.FirstName + " " + data.value[0].Student.LastName;
          this.studentInfoTodisplay.Currentbatch = this.Batches.filter(b => {
            return b.BatchId == this.SelectedBatchId
          })[0].BatchName

          this.studentInfoTodisplay.SectionName = this.Sections.filter(cls => {
            return cls.MasterDataId == data.value[0].SectionId
          })[0].MasterDataName;
          this.studentInfoTodisplay.StudentClassName = this.Classes.filter(cls => {
            return cls.MasterDataId == this.studentInfoTodisplay.ClassId
          })[0].MasterDataName;

          this.GetStudentFeePaymentDetails(0);
        }
        else {
          this.alert.error("No class defined for this student!", this.optionsNoAutoClose);

        }
      })
  }
}
export interface IStudentFeePaymentReceipt {
  StudentReceiptId: number;
  Amount: number;
  OfflineReceiptNo: string;
  ReceiptDate: Date;
  StudentClassId: number;
  SlNo: number;
  FeeName: string;
}
export interface IReceipt {
  StudentReceiptId: number;
  TotalAmount: number;
  OffLineReceiptNo: string;
  ReceiptDate: Date;
  Active: number;
  Action: string;
}