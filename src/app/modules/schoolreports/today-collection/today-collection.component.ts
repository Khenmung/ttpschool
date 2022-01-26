import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
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
  styleUrls: ['./today-collection.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TodayCollectionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  expandedElement: any;
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  loading = false;
  allMasterData = [];
  FeeDefinitions = [];
  FeeCategories = [];
  Classes = [];
  Batches = [];
  Sections = [];
  GroupByPaymentType = [];
  ELEMENT_DATA = [];
  GrandTotalAmount = 0;
  PaymentTypes = [];
  DisplayColumns = [
    "ReceiptDate",
    "Student",
    "ClassName",
    "ReceiptNo",
    "PaymentType",
    "TotalAmount"
  ]
  SelectedApplicationId = 0;
  Permission = 'deny';
  DateWiseCollection = [];
  HeadsWiseCollection = [];
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
    private datepipe: DatePipe

    ) { }

  ngOnInit(): void {
    this.SearchForm = this.fb.group({
      FromDate: [new Date(), Validators.required],
      ToDate: [new Date(), Validators.required],
      searchReportType: ['', Validators.required],
    })

    this.PageLoad();
  }
  PageLoad() {
    debugger;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
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
    this.loading = true;
    filterstring = "Active eq 1 and ReceiptDate ge " + this.formatdate.transform(fromDate, 'yyyy-MM-dd') +
      " and ReceiptDate le " + this.formatdate.transform(toDate, 'yyyy-MM-dd') +
      " and BatchId eq " + this.SelectedBatchId +
      " and OrgId eq " + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = [
      'ReceiptDate',
      'ReceiptNo',
      'TotalAmount',
      'PaymentTypeId'
    ];
    list.PageName = "StudentFeeReceipts";
    list.lookupFields = [
      "AccountingVouchers($filter=Active eq 1;$select=FeeReceiptId,GLAccountId,ClassFeeId,Amount;$expand=ClassFee($select=FeeDefinitionId;$expand=FeeDefinition($select=FeeName,FeeCategoryId))),StudentClass($select=StudentId;$expand=Student($select=FirstName,LastName),Class($select=ClassName))"

    ]
    list.filter = [filterstring];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        this.GrandTotalAmount = data.value.reduce((acc, current) => acc + current.TotalAmount, 0);
        this.DateWiseCollection = data.value.map(d => {
          d.Student = d.StudentClass.Student.FirstName + " " + d.StudentClass.Student.LastName;
          d.ClassName = d.StudentClass.Class.ClassName
          d.PaymentType = this.PaymentTypes.filter(p => p.MasterDataId == d.PaymentTypeId)[0].MasterDataName;
          d.ReceiptDate = this.datepipe.transform(d.ReceiptDate,'dd/MM/yyyy') 
          //d.FeeName = this.FeeDefinitions.filter(f=>f.FeeDefinitionId == d.AccountingVouchers[0].ClassFeeId)[0].FeeName;
          return d;
        })
        var groupbyPaymentType = alasql("Select PaymentType, Sum(TotalAmount) TotalAmount from ? group by PaymentType", [this.DateWiseCollection]);

        data.value.forEach(d => {
          d.AccountingVouchers.forEach(v => {
            var _feeCategoryName = '';
            var _feeCategoryId = v.ClassFee.FeeDefinition.FeeCategoryId;
            var objCategory = this.FeeCategories.filter(f => f.MasterDataId == _feeCategoryId)
            if (objCategory.length > 0)
              _feeCategoryName = objCategory[0].MasterDataName;
            this.HeadsWiseCollection.push({
              ClassFeeId: v.ClassFeeId,
              Amount: v.Amount,
              PaymentType: this.PaymentTypes.filter(p => p.MasterDataId == d.PaymentTypeId)[0].MasterDataName,
              Student: d.StudentClass.Student.FirstName + " " + d.StudentClass.Student.LastName,
              ClassName: d.StudentClass.Class.ClassName,
              FeeCategoryId: _feeCategoryId,
              FeeCategory: _feeCategoryName
            })
          })
          return d.AccountingVouchers;
        })

        this.HeadsWiseCollection = alasql("select FeeCategory,Sum(Amount) Amount from ? group by FeeCategory", [this.HeadsWiseCollection]);
        //console.log('this.HeadsWiseCollection', this.HeadsWiseCollection)

        this.GroupByPaymentType = [...groupbyPaymentType];
        if (this.DateWiseCollection.length == 0)
          this.alert.info("No collection found.", this.options);
        
        const rows = [];
        this.DateWiseCollection.forEach(element => rows.push(element, { detailRow: true, element }));
        console.log("rows",rows)
        this.dataSource = new MatTableDataSource(rows);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      })
  }
  GetMasterData() {
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.shareddata.CurrentFeeDefinitions.subscribe((f: any) => {
          this.FeeDefinitions = [...f];
          if (this.FeeDefinitions.length == 0) {
            this.contentservice.GetFeeDefinitions(this.SelectedBatchId, this.LoginUserDetail[0]["orgId"]).subscribe((d: any) => {
              this.FeeDefinitions = [...d.value];
            })
          }
        })
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.PaymentTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.FEEPAYMENTTYPE);
        this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);

        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        

      });

  }
  getDropDownData(dropdowntype) {
    let IdObj = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    })
    var Id=0;
    if (IdObj.length > 0) {
      Id = IdObj[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      });
    }
    else
    return [];
  }
}
export interface ITodayReceipt {
  "SlNo": number,
  "FeeName": string,
  "TotalAmount": string,
}