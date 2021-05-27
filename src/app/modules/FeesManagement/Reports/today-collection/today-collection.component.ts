import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
//import { IStudentFeePaymentReceipt } from '../../feereceipt/feereceipt.component';

@Component({
  selector: 'app-today-collection',
  templateUrl: './today-collection.component.html',
  styleUrls: ['./today-collection.component.scss']
})
export class TodayCollectionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  allMasterData = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Sections = [];
  ELEMENT_DATA = [];
  GrandTotalAmount = 0;
  DisplayColumns = [
    "SlNo",
    "FeeName",
    "TotalAmount"
  ]
  dataSource: MatTableDataSource<ITodayReceipt>;
  SearchForm: FormGroup;
  ErrorMessage: string = '';
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
    this.ErrorMessage = '';
    let fromDate = this.SearchForm.get("FromDate").value;
    let toDate = this.SearchForm.get("ToDate").value;
    let filterstring = '';
    filterstring = "ReceiptNo ne null and Active eq 1 and PaymentDate ge datetime'" + this.formatdate.transform(fromDate, 'yyyy-MM-dd') + "' and PaymentDate le datetime'" + this.formatdate.transform(toDate.setDate(toDate.getDate() + 1), 'yyyy-MM-dd') + "'";

    let list: List = new List();
    list.fields = [
      'StudentFeePayment/StudentFeeId',
      'StudentFeePayment/FeeNameId',
      'PaymentAmt',
    ];
    list.PageName = "PaymentDetails";
    list.lookupFields = ["StudentFeePayment"];
    list.filter = [filterstring];
    
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        this.GrandTotalAmount = 0;
        if (data.value.length > 0) {

          var result=[];

          let ValidFeeNameIds = data.value.filter(f => {
            return f.StudentFeePayment.FeeNameId != null
          })
          
          ValidFeeNameIds.forEach(element => {

           let addedItem =result.filter(item=> item.FeeNameId == element.FeeNameId);
         
            if(addedItem.length==0)
            {
              result.push({
                FeeNameId:element.StudentFeePayment.FeeNameId,
                TotalAmount: element.PaymentAmt
              })
            }
            else
            {
              addedItem["TotalAmount"] += +element.PaymentAmt; 
            }

          });
          this.ELEMENT_DATA = result.map((item, indx) => {
            this.GrandTotalAmount += +item.TotalAmount;
            debugger;
            return {
              SlNo: indx+1,
              FeeName: this.FeeNames.filter(f => f.MasterDataId == +item.FeeNameId)[0].MasterDataName,
              TotalAmount: item.TotalAmount
            }
          })
          //console.log('my result1', this.ELEMENT_DATA);
        }
        else {
          this.ErrorMessage = "No record found!";
          this.ELEMENT_DATA = [];
        }

        this.dataSource = new MatTableDataSource<ITodayReceipt>(this.ELEMENT_DATA);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

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
  "FeeName": string,
  "TotalAmount": string,
}