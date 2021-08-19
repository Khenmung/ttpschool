import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AlertService } from '../../../../shared/components/alert/alert.service';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
import { SharedataService } from '../../../../shared/sharedata.service';

@Component({
  selector: 'app-feecollectionreport',
  templateUrl: './feecollectionreport.component.html',
  styleUrls: ['./feecollectionreport.component.scss']
})
export class FeecollectionreportComponent implements OnInit {
@ViewChild('PaidPaginator') PaidPaginator:MatPaginator;
@ViewChild('UnPaidPaginator') UnPaidPaginator:MatPaginator;
loading=false;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  TotalPaidStudentCount = 0;
  TotalUnPaidStudentCount = 0;
  allMasterData = [];
  DropdownFeeNames = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Sections = [];
  ELEMENT_DATA = [];
  StudentDetail = [];
  TotalAmount = 0;
  CurrentBatch: string = '';
  //BatchId = 0;
  DisplayColumns = [
    "SlNo",
    "Name",
    "ClassRollNoSection",
    "RollNo",
    "PaymentDate"

  ]
  UnpaidDisplayColumns = [
    "SlNo",
    "Name",
    "ClassRollNoSection",
    "RollNo"

  ]
  SelectedBatchId=0;
  dataSource: MatTableDataSource<ITodayReceipt>;
  UnpaidDataSource: MatTableDataSource<INotPaidStudent>;
  SearchForm: FormGroup;
  ErrorMessage: string = '';
  //alert: any;
  constructor(private dataservice: NaomitsuService,
    private formatdate: DatePipe,
    private fb: FormBuilder,
    private alert: AlertService,
    private shareddata:SharedataService,
    private tokenservice:TokenStorageService) { }

  ngOnInit(): void {
    //this.GetMasterData();
    //this.shareddata.CurrentSelectedBatchId.subscribe(c=>(this.BatchId=c));
    this.SelectedBatchId = +this.tokenservice.getSelectedBatchId();
    this.shareddata.CurrentFeeNames.subscribe(c=>(this.FeeNames=c));
    this.shareddata.CurrentBatch.subscribe(c=>(this.Batches=c));
    this.shareddata.CurrentClasses.subscribe(c=>(this.Classes=c));
    this.shareddata.CurrentSection.subscribe(c=>(this.Sections=c));

    
    this.SearchForm = this.fb.group({
      //BatchId: [this.BatchId, Validators.required],
      FeeNameId: [0, Validators.required],
      PaidOrNotPaid: [0, Validators.required],
    })
  }
  PageLoad(){
    
  }
  get f() {
    return this.SearchForm.controls;
  }

  GetStudentFeePaymentReport() {
    debugger;

    if (this.SearchForm.value.FeeNameId == 0 || this.SearchForm.value.BatchId == 0) {
      this.alert.error('Batch and Fee are required to select!', this.options.autoClose);
      return;
    }

    this.ErrorMessage = '';

    let FeeNameId = this.SearchForm.value.FeeNameId;
    let filterstring = '';

    filterstring = "Active eq 1 and FeeNameId eq " + FeeNameId + ' and Batch eq ' + this.SearchForm.value.BatchId;

    let list: List = new List();
    list.fields = [
      'Student/Name',
      'StudentClass/ClassId',
      'StudentClass/RollNo',
      'StudentClass/SectionId',
      'StudentClass/StudentClassId',
      'ClassFeeId',
      'PaymentDate'

    ];
    list.PageName = "StudentFeePayments";
    list.lookupFields = ["StudentClass", "Student"];
    list.filter = [filterstring];
    //list.orderBy = "PaymentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //this.TotalAmount = 0;
        if (data.value.length > 0) {
          //this.TotalStudentCount = data.value.length;
          this.ELEMENT_DATA = data.value.map((item, indx) => {
            return {
              SlNo: indx + 1,
              Name: item.Student.Name,
              ClassRollNoSection: this.Classes.filter(c => c.MasterDataId == item.StudentClass.ClassId)[0].MasterDataName + ' - ' + this.Sections.filter(s => s.MasterDataId == item.StudentClass.SectionId)[0].MasterDataName,
              RollNo: item.StudentClass.RollNo,
              PaymentDate: item.PaymentDate,
            }
          })
          if (this.SearchForm.value.PaidOrNotPaid == 0) {

            this.getStudentClasses();
          }
          else {

            this.TotalPaidStudentCount = this.ELEMENT_DATA.length;
            this.dataSource = new MatTableDataSource<ITodayReceipt>(this.ELEMENT_DATA);
            this.dataSource.paginator = this.PaidPaginator;
          }
        }
        else {
          this.ErrorMessage = "No record found! or no one has paid this fee.";
          this.ELEMENT_DATA = [];
          this.dataSource = new MatTableDataSource<ITodayReceipt>(this.ELEMENT_DATA);
        }
      })
  }
  getStudentClasses() {
    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'Student/Name',
      'ClassId',
      'RollNo',
      'SectionId'
    ];
    list.PageName = "StudentClasses";
    list.lookupFields = ["Student"];
    list.filter = ["Active eq 1 and Batch eq " + this.SearchForm.value.BatchId];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        let paid;
        this.StudentDetail = [];
        if (data.value.length > 0) {
          data.value.forEach((item, indx) => {
            paid = this.ELEMENT_DATA.filter(paidlist => {
              paidlist.StudentClassId != item.StudentClassId
            })
            if (paid.length == 0) {
              this.StudentDetail.push({
                SlNo: indx + 1,
                Name: item.Student.Name,
                RollNo: item.RollNo,
                ClassRollNoSection: this.Classes.filter(c => c.MasterDataId == item.ClassId)[0].MasterDataName + ' - ' + this.Sections.filter(c => c.MasterDataId == item.SectionId)[0].MasterDataName,
              });
            }
          });
          this.TotalUnPaidStudentCount = this.StudentDetail.length;
          this.UnpaidDataSource = new MatTableDataSource<INotPaidStudent>(this.StudentDetail);
          this.UnpaidDataSource.paginator = this.UnPaidPaginator;
        }
      });
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
        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions.school.FEENAME);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASS);
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
       
        //since only one current batch is accepted
        //this.BatchId = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH)[0].MasterDataId;
        this.shareddata.CurrentBatch.subscribe(c=>(this.Batches=c));
        this.SelectedBatchId = +this.tokenservice.getSelectedBatchId();
        //this.shareddata.CurrentSelectedBatchId.subscribe(c=>(this.BatchId=c));
        //this.SelectedBatchId = +this.tokenService.getSelectedBatchId();

        //this.SearchForm.patchValue({ 'BatchId': this.SelectedBatchId });
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
export interface ITodayReceipt {
  "SlNo": number,
  "Name": string,
  "ClassRollNoSection": string,
  "RollNo": number,
  "PaymentDate": number,
  // "Date":Date
}
export interface INotPaidStudent {
  "SlNo": number,
  "Name": string,
  "RollNo": number;
  "ClassRollNoSection": string
}
