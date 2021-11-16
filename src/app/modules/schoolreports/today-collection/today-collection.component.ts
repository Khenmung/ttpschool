import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
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
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  loading = false;
  allMasterData = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Sections = [];
  ELEMENT_DATA = [];
  GrandTotalAmount = 0;
  DisplayColumns = [
    "Student",
    "ClassName",
    "ReceiptDate",
    "ReceiptNo",
    "TotalAmount"
  ]
  Permission = 'deny';
  DateWiseCollection = [];
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
    private nav: Router,
    private alert: AlertService,
    ) { }

  ngOnInit(): void {
    this.SearchForm = this.fb.group({
      FromDate: [new Date(), Validators.required],
      ToDate: [new Date(), Validators.required],
    })
    this.PageLoad();
  }
  PageLoad() {
    debugger;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.DATEWISECOLLECTION);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });
        this.GetMasterData();
      }
    }
  }
  GetStudentFeePaymentDetails() {
    debugger;
    this.ErrorMessage = '';
    let fromDate = this.SearchForm.get("FromDate").value;
    let toDate = this.SearchForm.get("ToDate").value;
    let filterstring = '';
    this.loading=true;
    filterstring = "Active eq 1 and ReceiptDate ge " + this.formatdate.transform(fromDate, 'yyyy-MM-dd') +
      " and ReceiptDate le " + this.formatdate.transform(toDate, 'yyyy-MM-dd') +
      " and BatchId eq " + this.SelectedBatchId +
      " and OrgId eq " + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'ReceiptDate',
      'ReceiptNo',
      'TotalAmount'
    ];
    list.PageName = "StudentFeeReceipts";
    list.lookupFields = ["StudentClass($select=StudentId;$expand=Student($select=FirstName,LastName),Class($select=ClassName))"]
    list.filter = [filterstring];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.GrandTotalAmount = data.value.reduce((acc, current) => acc + current.TotalAmount, 0);
        this.DateWiseCollection = data.value.map(d => {
          d.Student = d.StudentClass.Student.FirstName + " " + d.StudentClass.Student.LastName;
          d.ClassName = d.StudentClass.Class.ClassName
          return d;
        })
        if(this.DateWiseCollection.length==0)
        {
      
          this.alert.info("No collection found.",this.options);

        }
        this.dataSource = new MatTableDataSource(this.DateWiseCollection)
        this.loading=false;
      })
  }
  GetMasterData() {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 or OrgId eq " + this.LoginUserDetail[0]["orgId"] + ")"];
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