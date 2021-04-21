import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';

@Component({
  selector: 'app-feereceipt',
  templateUrl: './feereceipt.component.html',
  styleUrls: ['./feereceipt.component.scss']
})
export class FeereceiptComponent implements OnInit {
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  studentInfoTodisplay = {
    Currentbatch: '',
    currentbatchId: 0,
    BillNo: 0,
    StudentName: '',
    StudentClassName: '',
    ReceiptDate: 0,
    StudentId: 0,
    StudentClassId: 0,
    ClassId: 0,
    SectionName: '',
    Session: '',
    PayAmount: 0,
    OfflineReceiptNo: 0,
    TotalAmount: 0
  }
  NewReceipt = true;
  Saved = false;
  PaymentIds = [];
  Sections = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Locations = [];
  StudentClassFees: any[] = [];
  FeeTypes = [];
  ELEMENT_DATA: IStudentFeePaymentReceipt[];
  StudentFeePaymentList: IStudentFeePaymentReceipt[];
  Students: string[];
  dataSource: MatTableDataSource<IStudentFeePaymentReceipt>;
  dataReceiptSource: MatTableDataSource<IReceipt>;
  allMasterData = [];
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
  constructor(private dataservice: NaomitsuService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private datepipe: DatePipe) { }

  ngOnInit(): void {


  }
  back() {

  }
  displayedColumns = [
    'SlNo',
    'FeeName',
    'PaymentAmount'
  ];
  ReceiptDisplayedColumns = [
    'StudentReceiptId',
    'OfflineReceiptNo',
    'TotalAmount',
    'ReceiptDate',
    'Action'
  ]
  PageLoad() {
    this.route.paramMap.subscribe(param => {
      this.studentInfoTodisplay.StudentId = +param.get("id");
    })
    this.route.queryParamMap.subscribe(param => {
      this.studentInfoTodisplay.StudentClassId = +param.get("scid");
    })
    if (this.studentInfoTodisplay.StudentId == 0) {
      this.alert.error("Id is missing", this.optionAutoClose);
      return;
    }
    this.GetMasterData();
  }
  whenPrint() {
    let receipt = {
      TotalAmount: this.studentInfoTodisplay.TotalAmount.toString(),
      Less: "0.00",
      OfflineReceiptNo: this.studentInfoTodisplay.OfflineReceiptNo,
      ReceiptDate: new Date(),
      StudentClassId: this.studentInfoTodisplay.StudentClassId,
      StudentId: this.studentInfoTodisplay.StudentId
    }
    this.dataservice.postPatch('StudentFeeReceipts', receipt, 0, 'post')
      .subscribe(
        (data: any) => {
          this.studentInfoTodisplay.BillNo = data.StudentReceiptId
          let toupdatePaymentDetail = {
            ReceiptNo: this.studentInfoTodisplay.BillNo
          }
          this.PaymentIds.forEach(item => {
            this.dataservice.postPatch('PaymentDetails', toupdatePaymentDetail, item, 'patch')
              .subscribe(
                (data: any) => {
                  this.Saved = true;
                })
          });
        })
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

    let list: List = new List();
    list.fields = [
      'StudentFeePayment/StudentFeeId',
      'StudentFeePayment/StudentClassId',
      'StudentFeePayment/StudentId',
      'ClassFee/FeeNameId',
      'StudentFeeReceipt/OfflineReceiptNo',
      'PaymentId',
      'PaymentAmt',
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
          this.studentInfoTodisplay.BillNo = ReceiptNo;
          if (data.value[0].StudentFeeReceipt !== undefined)
            this.studentInfoTodisplay.OfflineReceiptNo = data.value[0].StudentFeeReceipt.OfflineReceiptNo;
          this.studentInfoTodisplay.ReceiptDate = data.value[0].PaymentDate
          res = data.value.filter(st => st.StudentFeePayment.StudentClassId == this.studentInfoTodisplay.StudentClassId
          ).map((item, indx) => {
            this.studentInfoTodisplay.TotalAmount += +item.PaymentAmt;
            return {
              SlNo: indx + 1,
              TotalAmount: 0,
              OfflineReceiptNo: '',
              StudentClassId: item.StudentFeePayment.StudentClassId,
              FeeName: item.ClassFee == undefined ? '' : this.FeeNames.filter(fee => fee.MasterDataId == item.ClassFee.FeeNameId)[0].MasterDataName,
              PaymentAmount: item.PaymentAmt,
              PaymentId: item.PaymentId
            }

          })
          if (res.length == 0) {
            //this.alert.info("no record found!", this.optionAutoClose);
            this.NewReceipt = false;
            let list: List = new List();
            list.fields = [
              'StudentReceiptId',
              'TotalAmount',
              'OfflineReceiptNo',
              'ReceiptDate'];

            list.PageName = "StudentFeeReceipts";
            //list.lookupFields = ["PaymentDetails", "StudentClass"];
            list.filter = ["StudentId eq " + this.studentInfoTodisplay.StudentId];

            this.dataservice.get(list)
              .subscribe((data: any) => {
                this.dataReceiptSource = new MatTableDataSource<IReceipt>(data.value);
              })
          }
          else {
            this.NewReceipt = true;
            this.ELEMENT_DATA = [...res];
            this.PaymentIds = res.map(id => id.PaymentId);
            this.dataSource = new MatTableDataSource<IStudentFeePaymentReceipt>(this.ELEMENT_DATA);
          }
        }
      })
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
        this.FeeNames = this.getDropDownData(globalconstants.FEENAMES);
        this.Classes = this.getDropDownData(globalconstants.CLASSES);
        this.Batches = this.getDropDownData(globalconstants.BATCH);
        //this.Locations = this.getDropDownData(globalconstants.LOCATION);
        //this.FeeTypes = this.getDropDownData(globalconstants.FEETYPE);
        this.Sections = this.getDropDownData(globalconstants.SECTION);
        let currentBatch = globalconstants.getCurrentBatch();
        let currentBatchObj = this.Batches.filter(item => item.MasterDataName == currentBatch);
        if (currentBatchObj.length > 0) {
          this.studentInfoTodisplay.currentbatchId = currentBatchObj[0].MasterDataId
        }
        else
          this.alert.error("Current batch not defined!", this.optionsNoAutoClose);
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
    list.fields = ["StudentClassId", "Section", "StudentId", "Batch", "Student/Name", "ClassId", "FeeTypeId"];
    list.lookupFields = ["Student"];
    list.PageName = "StudentClasses";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.studentInfoTodisplay.StudentClassId = data.value[0].StudentClassId
          this.studentInfoTodisplay.ClassId = data.value[0].ClassId
          //this.studentInfoTodisplay.BillNo = data.value[0].FeeTypeId;
          this.studentInfoTodisplay.StudentName = data.value[0].Student.Name;
          this.studentInfoTodisplay.Currentbatch = this.Batches.filter(b => {
            return b.MasterDataId == this.studentInfoTodisplay.currentbatchId
          })[0].MasterDataName

          this.studentInfoTodisplay.SectionName = this.Sections.filter(cls => {
            return cls.MasterDataId == data.value[0].Section
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
  TotalAmount: number;
  OfflineReceiptNo: string;
  ReceiptDate: Date;
  StudentClassId: number;
  SlNo: number;
  FeeName: string;
  PaymentAmount: any;
}
export interface IReceipt {
  StudentReceiptId: number;
  TotalAmount: number;
  OfflineReceiptNo, number;
  ReceiptDate: Date;
}