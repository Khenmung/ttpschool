import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
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
  studentInfoTodisplay = {
    Currentbatch: '',
    currentbatchId:0,  
    StudentFeeType: '',
    StudentName: '',
    StudentClassName: '',
    FeeTypeId: 0,
    StudentId: 0,
    studentClassId: 0,
    ClassId: 0,
    SectionName: '',
    Session:'',
    PayAmount: 0
  }
  Sections = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Locations = [];
  StudentClassFees: any[] = [];
  FeeTypes = [];
  ELEMENT_DATA: IStudentFeePayment[];
  StudentFeePaymentList: IStudentFeePayment[];
  Students: string[];
  dataSource: MatTableDataSource<IStudentFeePayment>;
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
    this.route.paramMap.subscribe(param => {
      this.studentInfoTodisplay.StudentId = +param.get("id");
    })
    if (this.studentInfoTodisplay.StudentId == 0) {
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
    'Pay',
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
          this.StudentFeePaymentData.StudentId = this.studentInfoTodisplay.StudentId;
          this.StudentFeePaymentData.Active = 1;
          this.StudentFeePaymentData.FeeAmount = row.FeeAmount.toFixed(2);
          this.StudentFeePaymentData.Batch = this.studentInfoTodisplay.currentbatchId;
          this.StudentFeePaymentData.StudentFeeId = row.StudentFeeId;
          this.StudentFeePaymentData.ClassFeeId = row.ClassFeeId;
          this.StudentFeePaymentData.StudentClassId = row.StudentClassId;
          this.StudentFeePaymentData.PaidAmt = (+row.PaidAmt + (+this.studentInfoTodisplay.PayAmount)).toFixed(2);
          let bl = this.StudentFeePaymentData.FeeAmount - (+row.PaidAmt + (+this.studentInfoTodisplay.PayAmount));
          this.StudentFeePaymentData.BalanceAmt = bl.toString();
          this.StudentFeePaymentData.Remarks = row.Remarks;
          //console.log('data', this.StudentFeePaymentData);

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
          let paymentdetail = {
            PaymentAmt: this.studentInfoTodisplay.PayAmount,
            PaymentDate: new Date(),
            ParentId: data.StudentFeeId
          }
          this.dataservice.postPatch('PaymentDetails', data.StudentFeeId, 0, 'post')
            .subscribe(
              (data: any) => {

                this.alert.success("Data saved successfully", this.optionAutoClose);
                //this.router.navigate(['/pages']);
              })
        });

  }
  update() {

    this.dataservice.postPatch('StudentFeePayments', this.StudentFeePaymentData, this.StudentFeePaymentData.StudentFeeId, 'patch')
      .subscribe(
        (data: any) => {
          let paymentdetail = {
            PaymentAmt: this.studentInfoTodisplay.PayAmount,
            PaymentDate: new Date(),
            ParentId: this.StudentFeePaymentData.StudentFeeId
          }
          this.dataservice.postPatch('PaymentDetails', data.StudentFeeId, 0, 'post')
            .subscribe(
              (data: any) => {
                this.alert.success("Data updated successfully", this.optionAutoClose);
                //this.router.navigate(['/pages']);
              })
        });
  }

  GetStudentFeePayment() {

    if (this.studentInfoTodisplay.StudentId == 0)
      return;

    let filterstr = "Batch eq " + this.studentInfoTodisplay.currentbatchId +
      " and StudentId eq " + this.studentInfoTodisplay.StudentId;

    let list: List = new List();
    list.fields = [
      'StudentFeeId',
      'StudentClassId',
      'StudentClass/ClassId',
      'ClassFeeId',
      'FeeAmount',
      'PaidAmt',
      'BalanceAmt',
      'Batch',
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

        this.GetClassFee(this.studentInfoTodisplay.ClassId);

      });
  }
  GetClassFee(pclassId) {

    if (pclassId == undefined || pclassId == 0)
      return;

    let filterstr = "Active eq 1 and Batch eq " + this.studentInfoTodisplay.currentbatchId + " and ClassId eq " + pclassId;

    let list: List = new List();
    list.fields = ["ClassFeeId", "FeeNameId", "ClassId", "Amount", "Batch", "Active", "LocationId", "PaymentOrder"];
    list.PageName = "ClassFees";
    list.orderBy = "PaymentOrder";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.StudentClassFees = [...data.value];
          //this.FeePayable = true;
          this.ELEMENT_DATA = this.StudentClassFees.map((StudentClassFee, indx) => {

            let existing = this.StudentFeePaymentList.filter(fromdb => fromdb.ClassFeeId == StudentClassFee.ClassFeeId)

            if (existing.length > 0) {
              let paidAmount = parseFloat(existing[0].PaidAmt);
              let bl = paidAmount == 0 ? parseFloat(StudentClassFee.Amount) : existing[0].BalanceAmt;
              //console.log('bl', bl);
              return {
                SlNo: indx + 1,
                StudentFeeId: existing[0].StudentFeeId,
                StudentClassId: existing[0].StudentClassId,
                ClassFeeId: +existing[0].ClassFeeId,
                ClassFeeName: this.FeeNames.filter(fee => fee.MasterDataId == StudentClassFee.FeeNameId)[0].MasterDataName,
                FeeAmount: parseFloat(StudentClassFee.Amount),
                FeeType: this.studentInfoTodisplay.StudentFeeType,
                PaidAmt: parseFloat(existing[0].PaidAmt),
                Pay: 0,
                BalanceAmt: existing[0].BalanceAmt == 0 ? "0.00" : parseFloat(existing[0].BalanceAmt),
                PaymentDate: existing[0].PaymentDate,
                Batch: existing[0].Batch,
                PaymentOrder: StudentClassFee.PaymentOrder,
                Remarks: '&nbsp;',//existing[0].Remarks.length==0?" ":existing[0].Remarks,
                //Active: existing[0].Active,
                Action: this.FeePayable
              }

            }
            else
              return {
                SlNo: indx + 1,
                StudentFeeId: 0,
                StudentClassId: this.studentInfoTodisplay.studentClassId,
                ClassFeeId: +StudentClassFee.ClassFeeId,
                ClassFeeName: this.FeeNames.filter(fee => fee.MasterDataId == StudentClassFee.FeeNameId)[0].MasterDataName,
                FeeAmount: parseFloat(StudentClassFee.Amount),
                FeeType: this.studentInfoTodisplay.StudentFeeType,
                PaidAmt: "0.00",
                Pay: 0,
                BalanceAmt: StudentClassFee.Amount.toFixed(2),
                PaymentDate: new Date(),
                Batch: this.studentInfoTodisplay.currentbatchId,
                PaymentOrder: StudentClassFee.PaymentOrder,
                Remarks: ' ',
                //Active: 0,
                Action: this.FeePayable
              }
          })

        }
        else {
          this.ELEMENT_DATA = [];
          this.alert.warn("Fees not defined for this class", this.optionsNoAutoClose);
        }
        this.FeePayable = true;
        this.ELEMENT_DATA.forEach((item, index) => {
          if (item.BalanceAmt > 0 && this.FeePayable == true) {
            item.Action = true;
            this.FeePayable = false;
          }
          else {
            item.Action = false;
            //this.FeePayable =false;
          }
        })
        this.dataSource = new MatTableDataSource<IStudentFeePayment>(this.ELEMENT_DATA);

      })
  }
  GetStudent(pstudentId) {

    if (pstudentId == undefined || pstudentId == 0)
      return;

    let filterstr = "Active eq 1 and Batch eq " + this.studentInfoTodisplay.currentbatchId + " and StudentId eq " + pstudentId;

    let list: List = new List();
    list.fields = ["StudentClassId", "StudentId", "ClassId", "FeeTypeId"];
    list.PageName = "StudentClasses";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
        }
      })
  }


  GetStudentClass(pstudentId) {

    if (pstudentId == undefined || pstudentId == 0)
      return;

    let filterstr = "Active eq 1 and Batch eq " + this.studentInfoTodisplay.currentbatchId + " and StudentId eq " + pstudentId;

    let list: List = new List();
    list.fields = ["StudentClassId", "Section", "StudentId","Batch", "Student/Name", "ClassId", "FeeTypeId"];
    list.lookupFields = ["Student"];
    list.PageName = "StudentClasses";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.studentInfoTodisplay.studentClassId = data.value[0].StudentClassId
          this.studentInfoTodisplay.ClassId = data.value[0].ClassId
          this.studentInfoTodisplay.FeeTypeId = data.value[0].FeeTypeId;
          this.studentInfoTodisplay.StudentName = data.value[0].Student.Name;
          this.studentInfoTodisplay.Currentbatch = this.Batches.filter(b=>{
            return b.MasterDataId==this.studentInfoTodisplay.currentbatchId})[0].MasterDataName

          this.studentInfoTodisplay.SectionName = this.Sections.filter(cls => {
            return cls.MasterDataId == data.value[0].Section
          })[0].MasterDataName;
          this.studentInfoTodisplay.StudentClassName = this.Classes.filter(cls => {
            return cls.MasterDataId == this.studentInfoTodisplay.ClassId
          })[0].MasterDataName;
          this.studentInfoTodisplay.StudentFeeType = this.FeeTypes.filter(f => {
            return f.MasterDataId == this.studentInfoTodisplay.FeeTypeId
          })[0].MasterDataName;

          this.GetStudentFeePayment();
        }
        else {
          this.alert.error("No class defined for this student!", this.optionsNoAutoClose);

        }
      })
  }
  back() {
    this.nav.navigate(['/admin/dashboardstudent']);
  }
  enableAction(element, amount) {
    debugger;
    this.studentInfoTodisplay.PayAmount = amount;
    //element.Action = true;
    //let amt = +amount;
    //element.BalanceAmt = +element.FeeAmount -(+element.PaidAmt + (+amt));
    //element.PaidAmt = element.PaidAmt + amt;
    //console.log('element', element);
    //console.log('$event', amount)
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
        this.FeeTypes = this.getDropDownData(globalconstants.FEETYPE);
        this.Sections = this.getDropDownData(globalconstants.SECTION);
        let currentBatch = globalconstants.getCurrentBatch();
        let currentBatchObj = this.Batches.filter(item => item.MasterDataName == currentBatch);
        if (currentBatchObj.length > 0) {
          this.studentInfoTodisplay.currentbatchId = currentBatchObj[0].MasterDataId
          this.GetStudentClass(this.studentInfoTodisplay.StudentId);
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
  FeeAmount: any;
  PaidAmt: any;
  Pay: any;
  BalanceAmt: any;
  PaymentDate: Date;
  Batch: number;
  Remarks: string;
  Action: boolean;
}

