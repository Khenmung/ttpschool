import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ContentService } from 'src/app/shared/content.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
import { SharedataService } from '../../../../shared/sharedata.service';

@Component({
  selector: 'app-feereceipt',
  templateUrl: './feereceipt.component.html',
  styleUrls: ['./feereceipt.component.scss'],
})
export class FeereceiptComponent implements OnInit {
  @Input("BillDetail") BillDetail: any[];
  @Input("StudentClass") studentInfoTodisplay: any;
  @Input("OffLineReceiptNo") OffLineReceiptNo: any;
  @Input("StudentClassFees") StudentClassFees: any;
  @ViewChild(MatSort) sort: MatSort;

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
  LoginUserDetail = [];
  BillStatus = 0;
  CurrentBatchId = 0;
  ReceiptHeading = [];
  NewReceipt = true;
  Saved = false;
  PaymentIds = [];
  Sections = [];
  FeeDefinitions = [];
  Classes = [];
  Batches = [];
  Locations = [];
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
  Permission = '';
  OriginalAmountForCalc = 0;
  TotalAmount = 0;
  Balance = 0;
  constructor(private dataservice: NaomitsuService,
    private tokenservice: TokenStorageService,

    private shareddata: SharedataService,
    private contentservice: ContentService) { }

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

    return this.TotalAmount;
  }
  displayedColumns = [
    'index',
    'FeeName',
    'Amount'
  ];
  ReceiptDisplayedColumns = [
    'ReceiptNo',
    'ReceiptDate',
    'TotalAmount',
    'Active'
  ]
  PageLoad() {
    debugger;
    this.loading = true;
    this.dataSource = new MatTableDataSource<any>(this.BillDetail);
    this.LoginUserDetail = this.tokenservice.getUserDetail();
    var perObj = globalconstants.getPermission(this.tokenservice, globalconstants.Pages.edu.STUDENT.FEEPAYMENT);
    if (perObj.length > 0) {
      this.Permission = perObj[0].permission;
    }
    if (this.Permission != 'deny') {

      this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
        this.Classes = [...data.value];
        var obj = this.Classes.filter(f => f.ClassId == this.studentInfoTodisplay.ClassId)
        if (obj.length > 0)
          this.studentInfoTodisplay.StudentClassName = obj[0].ClassName;
      })
      //this.shareddata.CurrentBatch.subscribe(lo => (this.Batches = lo));
      this.Batches = this.tokenservice.getBatches();
      this.shareddata.CurrentSection.subscribe(pr => (this.Sections = pr));

      this.studentInfoTodisplay.StudentId = this.tokenservice.getStudentId();
      this.studentInfoTodisplay.StudentClassId = this.tokenservice.getStudentClassId();
      this.SelectedBatchId = +this.tokenservice.getSelectedBatchId();
      this.studentInfoTodisplay.OffLineReceiptNo = this.OffLineReceiptNo;
      this.studentInfoTodisplay.currentbatchId = this.SelectedBatchId;

      this.shareddata.CurrentFeeDefinitions.subscribe(b => (this.FeeDefinitions = b));
      debugger;
      this.GetMasterData();
      this.GetBills();
    }
    else {
      this.loading = false;
      this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
    }
  }

  viewDetail(row) {
    //debugger;
    this.clickPaymentDetails = this.StudentFeePaymentList.filter(f => f.FeeReceiptId == row.StudentFeeReceiptId);
    this.studentInfoTodisplay.StudentFeeReceiptId = row.StudentFeeReceiptId;
    this.studentInfoTodisplay.ReceiptNo = row.ReceiptNo;
    this.studentInfoTodisplay.OffLineReceiptNo = row.OffLineReceiptNo;
    this.TotalAmount = row.TotalAmount;
    this.Balance = row.Balance == null ? 0 : row.Balance;
    this.BillStatus = row.Active;
    this.dataSource = new MatTableDataSource<any>(this.clickPaymentDetails);
  }
  CancelReceipt() {
    //debugger;
    this.loading = true;
    let receipt = {
      Active: 0
    }
    this.dataservice.postPatch(this.StudentFeeReceiptListName, receipt, this.studentInfoTodisplay.StudentFeeReceiptId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.TotalAmount = 0;
          this.Balance = 0;
          this.contentservice.openSnackBar("Receipt cancelled successfully.", globalconstants.ActionText, globalconstants.RedBackground);
          this.CancelReceiptMode = false;
          this.BillDetail = [];
          this.dataSource = new MatTableDataSource<any>(this.BillDetail);

        });
  }
  edit() {
    this.CancelReceiptMode = true;

  }
  done() {
    this.CancelReceiptMode = false;

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
      "Active"
    ];

    list.PageName = "StudentFeeReceipts";
    list.lookupFields = ["AccountingVouchers($select=AccountingVoucherId,ShortText,LedgerId,FeeReceiptId,Amount,ClassFeeId)"];
    list.filter = ["StudentClassId eq " + this.studentInfoTodisplay.StudentClassId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeReceipt = [...data.value];
        this.StudentFeePaymentList = [];
        this.FeeReceipt.forEach(f => {
          f.AccountingVouchers.forEach(k => {
            var _shortText = '';
            if (k.ShortText.length > 0) {
              _shortText = " (" + k.ShortText + ")"
            }
            var feeObj = this.StudentClassFees.filter(f => f.ClassFeeId == k.ClassFeeId);
            if (feeObj.length > 0)
              k.FeeName = feeObj[0].FeeName + _shortText;
            else
              k.FeeName = '';

            this.StudentFeePaymentList.push(k)
          })
        })

        this.dataReceiptSource = new MatTableDataSource<any>(this.FeeReceipt);
        this.dataReceiptSource.sort = this.sort;
        var latestReceipt = this.FeeReceipt.sort((a, b) => b.ReceiptNo - a.ReceiptNo);
        if (latestReceipt.length > 0)
          this.viewDetail(latestReceipt[0]);

        this.loading = false;

      })
  }
  GetMasterData() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "MasterDataId",
      "MasterDataName",
      "Logic",
      "ParentId",
      "Description"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (MasterDataName eq 'Receipt Heading' or OrgId eq 1)"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.allMasterData = [...data.value];
        this.ReceiptHeading = this.getDropDownData(globalconstants.MasterDefinitions.school.RECEIPTHEADING);
        this.ReceiptHeading.forEach(f => {
          f.Logic = f.Logic != null ? JSON.parse("{" + f.Logic + "}") : ''
        })
        this.loading = false;
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