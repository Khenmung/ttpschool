import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';

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
  studentInfoTodisplay = {
    Currentbatch: '',
    currentbatchId: 0,
    StudentFeeType: '',
    StudentName: '',
    StudentClassName: '',
    FeeTypeId: 0,
    StudentId: 0,
    ClassId: 0,
    SectionName: '',
    Session: '',
    PayAmount: 0,
    StudentClassId:0
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
  }
  PageLoad(){
    
    this.route.paramMap.subscribe(param => {
      this.studentInfoTodisplay.StudentId = +param.get("id");
    })
    
    this.route.queryParamMap.subscribe(p=>{      
      this.studentInfoTodisplay.StudentClassId = +p.get('scid');
    })
    if (this.studentInfoTodisplay.StudentId == 0) {
      this.alert.error("Id is missing", this.optionAutoClose);
      return;
    }
    this.GetMasterData();

  }
  displayedColumns = [
    'SlNo',
    'Paid',
    'ClassFeeName',
    'FeeAmount',
    'PaidAmt',
    'BalanceAmt',
    'Pay',
    'PaymentDate',
    'Action'
  ];

  updateActive() {

  }
  updateAlbum() {

  }
  getoldvalue() {

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
      let previousBalance = this.ELEMENT_DATA.filter(d => d.PaymentOrder == (row.PaymentOrder - 1))[0].BalanceAmt;
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
      " and Batch eq " + row.Batch

    if (row.StudentFeeId > 0)
      checkFilterString += " and StudentFeeId ne " + row.StudentFeeId;

    let list: List = new List();
    list.fields = ["StudentFeeId"];
    list.PageName = "StudentFeePayments";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
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
          if (row.ClassFeeName.toLowerCase().includes("admission")) {
            this.StudentFeePaymentData.BalanceAmt = bl.toString();
            this.StudentFeePaymentData.PaidAmt = (+row.PaidAmt + (+this.studentInfoTodisplay.PayAmount)).toFixed(2);
          }
          else {
            this.StudentFeePaymentData.PaidAmt = row.BalanceAmt.toFixed(2); //.FeeAmount.toFixed(2);
            this.StudentFeePaymentData.BalanceAmt = "0.00";
          }

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
            PaymentAmt: this.studentInfoTodisplay.PayAmount.toFixed(2),
            PaymentDate: new Date(),
            ParentId: data.StudentFeeId,
            ClassFeeId: +this.StudentFeePaymentData.ClassFeeId
          }
          this.dataservice.postPatch('PaymentDetails', paymentdetail, 0, 'post')
            .subscribe(
              (data: any) => {
                this.GetStudentFeePayment();
                this.alert.success("Data saved successfully", this.optionAutoClose);
              })
        });

  }
  update() {

    this.dataservice.postPatch('StudentFeePayments', this.StudentFeePaymentData, this.StudentFeePaymentData.StudentFeeId, 'patch')
      .subscribe(
        (data: any) => {
          let paymentdetail = {
            PaymentAmt: this.studentInfoTodisplay.PayAmount.toFixed(2),
            PaymentDate: new Date(),
            ParentId: this.StudentFeePaymentData.StudentFeeId,
            ClassFeeId: +this.StudentFeePaymentData.ClassFeeId
          }
          //   this.dataservice.postPatch('PaymentDetails', paymentdetail, 0, 'post')
          //     .subscribe(
          //       (data: any) => {
          //         this.GetStudentFeePayment();
          //         // this.CurrentRow.PaidAmt = this.StudentFeePaymentData.PaidAmt;
          //         // this.CurrentRow.BalanceAmt = this.StudentFeePaymentData.BalanceAmt;
          //         this.alert.success("Data updated successfully", this.optionAutoClose);
          //         //this.router.navigate(['/pages']);
          //       })
        });
  }

  GetStudentFeePayment() {
debugger;
    if (this.studentInfoTodisplay.StudentId == 0)
      return;
   
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
      'PaymentDetails/PaymentId',
      'PaymentDetails/PaymentAmt',
      'PaymentDetails/PaymentDate',
      'Active'];

    list.PageName = "StudentFeePayments";
    list.lookupFields = ["StudentClass", "PaymentDetails"];
    list.filter = ['StudentClassId eq ' + this.studentInfoTodisplay.StudentClassId];
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

          let FeeName = '';
          this.ELEMENT_DATA = this.StudentClassFees.map((StudentClassFee, indx) => {
            //console.log('after multi',(DiscountFactor * parseFloat(StudentClassFee.Amount)).toFixed(2))
            FeeName = this.FeeNames.filter(fee => fee.MasterDataId == StudentClassFee.FeeNameId)[0].MasterDataName;

            let PayablePercent = this.GetDiscountFactor(FeeName, indx);
            let payableAmount = PayablePercent * parseFloat(StudentClassFee.Amount);

            let existing = this.StudentFeePaymentList.filter(fromdb => fromdb.ClassFeeId == StudentClassFee.ClassFeeId)
            if (existing.length > 0) {
              payableAmount = existing[0].BalanceAmt;//+payableAmount - parseFloat(existing[0].PaidAmt)

              let paidAmount = parseFloat(existing[0].PaidAmt);
              let bl = paidAmount == 0 ? parseFloat(StudentClassFee.Amount) : existing[0].BalanceAmt;

              return {
                SlNo: indx + 1,
                StudentFeeId: existing[0].StudentFeeId,
                StudentClassId: existing[0].StudentClassId,
                ClassFeeId: +existing[0].ClassFeeId,
                ClassFeeName: FeeName,
                FeeAmount: parseFloat(StudentClassFee.Amount),
                FeeType: this.studentInfoTodisplay.StudentFeeType,
                PaidAmt: parseFloat(existing[0].PaidAmt),
                Pay: payableAmount,
                BalanceAmt: existing[0].BalanceAmt,
                PaymentDate: existing[0].PaymentDate,
                Batch: existing[0].Batch,
                PaymentOrder: StudentClassFee.PaymentOrder,
                Paid: existing[0].BalanceAmt == 0 ? true : false,
                Action: this.FeePayable,
                PaymentDetails: existing[0].PaymentDetails
              }

            }
            else
              return {
                SlNo: indx + 1,
                StudentFeeId: 0,
                StudentClassId: this.studentInfoTodisplay.StudentClassId,
                ClassFeeId: +StudentClassFee.ClassFeeId,
                ClassFeeName: this.FeeNames.filter(fee => fee.MasterDataId == StudentClassFee.FeeNameId)[0].MasterDataName,
                FeeAmount: parseFloat(StudentClassFee.Amount),
                FeeType: this.studentInfoTodisplay.StudentFeeType,
                PaidAmt: "0.00",
                Pay: payableAmount,
                BalanceAmt: payableAmount,
                PaymentDate: new Date(),
                Batch: this.studentInfoTodisplay.currentbatchId,
                PaymentOrder: StudentClassFee.PaymentOrder,
                Paid: false,
                Action: this.FeePayable,
                PaymentDetails: []
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
            this.FeePayable = true;
          }
          else {
            item.Action = false;
            //this.FeePayable =false;
          }
        })
        const rows = [];
        this.ELEMENT_DATA.forEach(element => rows.push(element, { detailRow: true, element }));
        //console.log(rows);
        this.dataSource = new MatTableDataSource<IStudentFeePayment>(rows);

      })
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
          //this.studentInfoTodisplay.studentClassId = data.value[0].StudentClassId
          this.studentInfoTodisplay.ClassId = data.value[0].ClassId
          this.studentInfoTodisplay.FeeTypeId = data.value[0].FeeTypeId;
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
          this.GetStudentClass();
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
  PaymentOrder: number;
  Batch: number;
  Paid: boolean;
  Action: boolean;
  PaymentDetails: any[];
}
