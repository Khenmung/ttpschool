import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
//import { IStudentFeePaymentReceipt } from '../../feereceipt/feereceipt.component';

@Component({
  selector: 'app-today-collection',
  templateUrl: './today-collection.component.html',
  styleUrls: ['./today-collection.component.scss']
})
export class TodayCollectionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  loading = false;
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
  LoginUserDetail = [];
  dataSource: MatTableDataSource<ITodayReceipt>;
  SearchForm: FormGroup;
  ErrorMessage: string = '';
  SelectedBatchId = 0;
  constructor(
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private dataservice: NaomitsuService,
    private formatdate: DatePipe,
    private fb: FormBuilder,
    private nav: Router) { }

  ngOnInit(): void {
    this.SearchForm = this.fb.group({
      FromDate: [new Date(), Validators.required],
      ToDate: [new Date(), Validators.required],
    })
  }
  PageLoad() {
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {

      this.shareddata.CurrentClasses.subscribe(c => (this.Classes = c));
      if (this.Classes.length == 0) {
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });
      }

      this.GetMasterData();
    }
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

          var result = [];

          let ValidFeeNameIds = data.value.filter(f => {
            return f.StudentFeePayment.FeeNameId != null
          })

          ValidFeeNameIds.forEach(element => {

            let addedItem = result.filter(item => item.FeeNameId == element.FeeNameId);

            if (addedItem.length == 0) {
              result.push({
                FeeNameId: element.StudentFeePayment.FeeNameId,
                TotalAmount: element.PaymentAmt
              })
            }
            else {
              addedItem["TotalAmount"] += +element.PaymentAmt;
            }

          });
          this.ELEMENT_DATA = result.map((item, indx) => {
            this.GrandTotalAmount += +item.TotalAmount;
            debugger;
            return {
              SlNo: indx + 1,
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
        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions.school.FEENAME);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();

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