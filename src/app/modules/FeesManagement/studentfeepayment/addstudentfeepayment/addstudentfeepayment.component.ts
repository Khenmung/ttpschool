import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';

@Component({
  selector: 'app-addstudentfeepayment',
  templateUrl: './addstudentfeepayment.component.html',
  styleUrls: ['./addstudentfeepayment.component.scss']
})
export class AddstudentfeepaymentComponent implements OnInit {
  currentbatch: string;
  currentbatchId: number;
  filteredOptions: Observable<string[]>;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  StudentId = 0;
  FeeNames = [];
  Classes = [];
  Batches = [];
  Locations = [];
  StudentClassFees: any[] = [];
  ELEMENT_DATA: IStudentFeePayment[];
  StudentFeePaymentList:IStudentFeePayment[];
  Students: string[];
  dataSource: MatTableDataSource<IStudentFeePayment>;
  allMasterData = [];
  studentClassId = 0;
  ClassId =0;
  searchForm = new FormGroup({
    StudentId: new FormControl(0),
  });
  StudentFeePaymentData= {
    StudentId:0,
    StudentFeeId: 0,
    StudentClassId: 0,
    ClassFeeId: 0,
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
    private nav:Router,
    private datepipe:DatePipe) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(param => {
      this.StudentId = +param.get("id");
    })
    if (this.StudentId == 0) {
      this.alert.error("Id is missing", this.optionsNoAutoClose);
      return;
    }
    this.GetMasterData();


  }

  displayedColumns = [
    'SlNo',
    'ClassFeeName',
    'FeeAmount',
    'PaidAmt',
    'BalanceAmt',
    'PaymentDate',
    'Remarks',
    'Action'
  ];

  updateActive() {

  }
  updateAlbum() {

  }
  getoldvalue() {

  }
  UpdateOrSave(row) {
    //this.duplicate = false;
    let checkFilterString = "Active eq 1 " +
      " and StudentClassId eq " + row.StudentClassId +
      " and ClassFeeId eq " + row.ClassFeeId +
      " and Batch eq " + row.Batch

    if (row.StudentFeeId > 0)
      checkFilterString += " and StudentFeeId ne " + row.StudentFeeId;

    let list: List = new List();
    list.fields = ["StudentFeeId"];
    list.PageName = "StudentFeePayments";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          //    this.duplicate = true;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          this.StudentFeePaymentData.StudentId =this.StudentId;
          this.StudentFeePaymentData.Active = 1;
          this.StudentFeePaymentData.Batch =this.currentbatchId;
          this.StudentFeePaymentData.StudentFeeId = row.StudentFeeId;
          this.StudentFeePaymentData.ClassFeeId = row.ClassFeeId;
          this.StudentFeePaymentData.StudentClassId = row.StudentClassId;
          this.StudentFeePaymentData.PaidAmt = parseFloat(row.PaidAmt).toFixed(2);
          //this.StudentFeePaymentData.PaidAmt = +this.StudentFeePaymentData.PaidAmt.toFixed(2);
          this.StudentFeePaymentData.BalanceAmt = parseFloat(row.BalanceAmt).toFixed(2);
          //this.StudentFeePaymentData.PaymentDate = row.PaymentDate; //,'yyyy-MM-dd HH:mm:ss z');
          this.StudentFeePaymentData.Remarks = row.Remarks;
          if (this.StudentFeePaymentData.StudentFeeId == 0)
            this.insert();
          else
            this.update();
        }
      });
  }

  insert() {

    debugger;
    this.dataservice.postPatch('StudentFeePayments', this.StudentFeePaymentData, 0, 'post')
      .subscribe(
        (data: any) => {

          this.alert.success("Data saved successfully", this.optionAutoClose);
          //this.router.navigate(['/pages']);
        });

  }
  update() {

    this.dataservice.postPatch('StudentFeePayments', this.StudentFeePaymentData, this.StudentFeePaymentData.StudentFeeId, 'patch')
      .subscribe(
        (data: any) => {
          this.alert.success("Data updated successfully", this.optionAutoClose);
          //this.router.navigate(['/pages']);
        });
  }

  GetStudentFeePayment() {

    if (this.StudentId == 0)
      return;

    let filterstr = "Batch eq " + this.currentbatchId +
      " and StudentId eq " + this.StudentId;

    let list: List = new List();
    list.fields = [
      'StudentFeeId',
      'StudentClassId',
      'StudentClass/ClassId',
      'ClassFeeId',
      'PaidAmt',
      'BalanceAmt',
      'PaymentDate',
      'Remarks',
      'Active'];

    list.PageName = "StudentFeePayments";
    list.lookupFields = ["StudentClass"];
    list.filter = [filterstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;

        this.StudentFeePaymentList = [...data.value];

        this.GetClassFee(this.ClassId);

      });
  }
  GetClassFee(pclassId) {

    if (pclassId == undefined || pclassId == 0)
      return;

    let filterstr = "Active eq 1 and Batch eq " + this.currentbatchId + " and ClassId eq " + pclassId;

    let list: List = new List();
    list.fields = ["ClassFeeId", "FeeNameId", "ClassId", "Amount", "Batch", "Active", "LocationId"];
    list.PageName = "ClassFees";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.StudentClassFees = [...data.value];
          this.ELEMENT_DATA = this.StudentClassFees.map((StudentClassFee, indx) => {

            let existing = this.StudentFeePaymentList.filter(fromdb => fromdb.ClassFeeId == StudentClassFee.ClassFeeId)

            if (existing.length > 0) {
              return {
                SlNo: indx + 1,
                StudentFeeId: existing[0].StudentFeeId,
                StudentClassId: existing[0].StudentClassId,
                ClassFeeId: +existing[0].ClassFeeId,
                ClassFeeName: this.FeeNames.filter(fee => fee.MasterDataId == StudentClassFee.FeeNameId)[0].MasterDataName,
                FeeAmount: StudentClassFee.Amount,
                PaidAmt: existing[0].PaidAmt,
                BalanceAmt: existing[0].BalanceAmt,
                PaymentDate: existing[0].PaymentDate,
                Batch: existing[0].Batch,
                Remarks: existing[0].Remarks,
                //Active: existing[0].Active,
                Action: false
              }
            }
            else
              return {
                SlNo: indx + 1,
                StudentFeeId: 0,
                StudentClassId: this.studentClassId,
                ClassFeeId: +StudentClassFee.ClassFeeId,
                ClassFeeName: this.FeeNames.filter(fee => fee.MasterDataId == StudentClassFee.FeeNameId)[0].MasterDataName,
                FeeAmount: StudentClassFee.Amount,
                PaidAmt: 0,
                BalanceAmt: 0,
                PaymentDate: new Date(),
                Batch: this.currentbatchId,
                Remarks: '',
                //Active: 0,
                Action: false
              }

          })

        }
        else {
          this.ELEMENT_DATA = [];
          this.alert.warn("Fees not defined for this class", this.optionsNoAutoClose);
        }
        this.dataSource = new MatTableDataSource<IStudentFeePayment>(this.ELEMENT_DATA);

      })
  }
  GetStudentClass(pstudentId) {

    if (pstudentId == undefined || pstudentId == 0)
      return;

    let filterstr = "Active eq 1 and Batch eq " + this.currentbatchId + " and StudentId eq " + pstudentId;

    let list: List = new List();
    list.fields = ["StudentClassId", "StudentId", "ClassId"];
    list.PageName = "StudentClasses";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.studentClassId = data.value[0].StudentClassId
          this.ClassId = data.value[0].ClassId
          
          this.GetStudentFeePayment();
        }
        else {
          this.alert.error("No class defined for this student!", this.optionsNoAutoClose);

        }
      })
  }
  back(){
    this.nav.navigate(['/admin/dashboardstudent']);
  }
  enableAction(element,amount) {
    debugger;
    element.Action = true;
    element.BalanceAmt = +element.FeeAmount - +amount
    element.PaidAmt = amount;
    console.log('element', element);
    console.log('$event',amount)
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
        this.Locations = this.getDropDownData(globalconstants.LOCATION);
        let currentBatch = globalconstants.getCurrentBatch();
        let currentBatchObj = this.Batches.filter(item => item.MasterDataName == currentBatch);
        if (currentBatchObj.length > 0) {
          this.currentbatchId = currentBatchObj[0].MasterDataId
          this.GetStudentClass(this.StudentId);
        }
        else
          this.alert.error("Current batch not defined!", this.optionsNoAutoClose);

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
export interface IStudentFeePayment {
  SlNo: number;
  StudentFeeId: number;
  StudentClassId: number;
  ClassFeeId: number;
  ClassFeeName: string;
  FeeAmount: number;
  PaidAmt: number;
  BalanceAmt: number;
  PaymentDate: Date;
  Batch: number;
  Remarks: string;
  Action: boolean;
}

