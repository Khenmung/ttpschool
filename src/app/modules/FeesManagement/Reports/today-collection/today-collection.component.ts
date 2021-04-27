import { DatePipe } from '@angular/common';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { IStudentFeePaymentReceipt } from '../../feereceipt/feereceipt.component';

@Component({
  selector: 'app-today-collection',
  templateUrl: './today-collection.component.html',
  styleUrls: ['./today-collection.component.scss']
})
export class TodayCollectionComponent implements OnInit {
@ViewChild(MatPaginator) paginator:MatPaginator;
@ViewChild(MatSort) sort:MatSort;
allMasterData = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Sections = [];
  ELEMENT_DATA = [];
  TotalAmount = 0;
  DisplayColumns = [
    "SlNo",
    "ReceiptNo",
    "Name",
    "ClassNameSection",
    "RollNo",
    "TotalAmount",
  ]
  dataSource: MatTableDataSource<ITodayReceipt>;
  SearchForm: FormGroup;
  ErrorMessage: string='';
  constructor(private dataservice: NaomitsuService,
    private formatdate: DatePipe,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.SearchForm = this.fb.group({
      FromDate: [new Date(), Validators.required],
      ToDate: [new Date(), Validators.required],
    })
    this.GetMasterData();

  }
  GetStudentFeePaymentDetails() {
    debugger;
    this.ErrorMessage ='';
    let fromDate = this.SearchForm.get("FromDate").value;
    let toDate = this.SearchForm.get("ToDate").value;
    let filterstring = '';
    filterstring = "Active eq 1 and ReceiptDate ge datetime'" + this.formatdate.transform(fromDate, 'yyyy-MM-dd') + "' and ReceiptDate le datetime'" + this.formatdate.transform(toDate.setDate(toDate.getDate() + 1), 'yyyy-MM-dd') + "'";

    let list: List = new List();
    list.fields = [
      'Student/Name',
      'StudentClass/ClassId',
      'StudentClass/RollNo',
      'StudentClass/Section',
      'OfflineReceiptNo',
      'TotalAmount',
      'ReceiptDate',
      'StudentReceiptId'
    ];
    list.PageName = "StudentFeeReceipts";
    list.lookupFields = ["Student", "StudentClass"];
    list.filter = [filterstring];
    //list.orderBy = "PaymentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.TotalAmount = 0;
        if (data.value.length > 0) {
          this.ELEMENT_DATA = data.value.map((item, indx) => {
            this.TotalAmount += +item.TotalAmount;
            return {
              SlNo: indx + 1,
              Name: item.Student.Name,
              ClassNameSection: this.Classes.filter(c => c.MasterDataId == item.StudentClass.ClassId)[0].MasterDataName
               + ' - ' + this.Sections.filter(s => s.MasterDataId == item.StudentClass.Section)[0].MasterDataName,
               RollNo: item.StudentClass.RollNo,              
              TotalAmount: item.TotalAmount,
              ReceiptNo: item.StudentReceiptId,
              Date: item.ReceiptDate
            }
          })
        }
        else {
          this.ErrorMessage = "No record found!";
          this.ELEMENT_DATA = [];
        }

        this.dataSource = new MatTableDataSource<ITodayReceipt>(this.ELEMENT_DATA);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort =this.sort;

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
        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions.FEENAMES);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.CLASSES);
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.BATCH);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.SECTION);
        //let currentBatch = globalconstants.getCurrentBatch();
        //let currentBatchObj = this.Batches.filter(item => item.MasterDataName == currentBatch);
        // if (currentBatchObj.length > 0) {
        //   this.studentInfoTodisplay.currentbatchId = currentBatchObj[0].MasterDataId
        // }
        // else
        //   this.alert.error("Current batch not defined!", this.optionsNoAutoClose);
        //this.GetStudentFeePaymentDetails();
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
  "ClassNameSection": string,
  "RollNo":number;
  "TotalAmount": number,
  "ReceiptNo": number,
  // "Date":Date
}