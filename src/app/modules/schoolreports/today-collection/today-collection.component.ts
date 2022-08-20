import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { IStudent } from '../../ClassSubject/AssignStudentClass/Assignstudentclassdashboard.component';

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
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  allRowsExpanded: boolean = false;
  expandedElement: any;
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');

  loading = false;
  allMasterData = [];
  FeeDefinitions = [];
  FeeCategories = [];
  Classes = [];
  Batches = [];
  Sections = [];
  Students = [];
  GroupByPaymentType = [];
  ELEMENT_DATA = [];
  GrandTotalAmount = 0;
  CancelledAmount = 0;
  PaymentTypes = [];
  DisplayColumns = [
    "ReceiptNo",
    "ReceiptDate",
    "Student",
    "ClassName",
    "PaymentType",
    "Status",
    "TotalAmount"
  ]
  SelectedApplicationId = 0;
  Permission = 'deny';
  DateWiseCollection = [];
  HeadsWiseCollection = [];
  LoginUserDetail = [];
  dataSource: MatTableDataSource<ITodayReceipt>;
  SearchForm: UntypedFormGroup;
  ErrorMessage: string = '';
  SelectedBatchId = 0;
  filteredOptions: Observable<IStudent[]>;
  constructor(
    private contentservice: ContentService,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private dataservice: NaomitsuService,
    private formatdate: DatePipe,
    private fb: UntypedFormBuilder,
    private nav: Router
  ) { }

  ngOnInit(): void {
    this.SearchForm = this.fb.group({
      searchStudentName: [0],
      FromDate: [new Date(), Validators.required],
      ToDate: [new Date(), Validators.required],
      searchReportType: ['', Validators.required],
    })
    this.filteredOptions = this.SearchForm.get("searchStudentName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      );
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
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  public toggle() {
    this.allRowsExpanded = !this.allRowsExpanded;
    this.expandedElement = null;
  }
  GetStudentFeePaymentDetails() {
    debugger;
    this.ErrorMessage = '';
    let fromDate = this.SearchForm.get("FromDate").value;
    let toDate = this.SearchForm.get("ToDate").value;
    let filterstring = '';
    this.loading = true;
    //filterstring = " eq 1" 

    filterstring += "ReceiptDate ge " + this.formatdate.transform(fromDate, 'yyyy-MM-dd') +
      " and ReceiptDate le " + this.formatdate.transform(toDate, 'yyyy-MM-dd');

    filterstring += " and BatchId eq " + this.SelectedBatchId +
      " and OrgId eq " + this.LoginUserDetail[0]["orgId"];

    if (this.SearchForm.get("searchStudentName").value.StudentClassId > 0)
      filterstring += " and StudentClassId eq " + this.SearchForm.get("searchStudentName").value.StudentClassId;

    let list: List = new List();
    list.fields = [
      'ReceiptDate',
      'ReceiptNo',
      'TotalAmount',
      'PaymentTypeId',
      'Active'
    ];
    list.PageName = "StudentFeeReceipts";
    list.lookupFields = [
      "AccountingVouchers($filter=ClassFeeId gt 0 and FeeReceiptId gt 0;$select=FeeReceiptId,LedgerId,ClassFeeId,Amount;$expand=ClassFee($select=FeeDefinitionId;$expand=FeeDefinition($select=FeeName,FeeCategoryId))),StudentClass($select=StudentId;$expand=Student($select=FirstName,LastName),Class($select=ClassName))"

    ]
    list.filter = [filterstring];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //console.log('paymentd ata', data.value);
        this.GrandTotalAmount = data.value.filter(f => f.Active == 1)
          .reduce((acc, current) => acc + current.TotalAmount, 0);
        this.CancelledAmount = data.value.filter(f => f.Active == 0)
          .reduce((acc, current) => acc + current.TotalAmount, 0);
        this.DateWiseCollection = data.value.map(d => {
          var _lastname = d.StudentClass.Student.LastName == null? '' : " " + d.StudentClass.Student.LastName;
          d.Student = d.StudentClass.Student.FirstName + _lastname;
          d.ClassName = d.StudentClass.Class.ClassName
          d.PaymentType = this.PaymentTypes.filter(p => p.MasterDataId == d.PaymentTypeId)[0].MasterDataName;
          d.Status = d.Active == 0 ? 'Cancelled' : 'Active';
          //d.ReceiptDate = this.datepipe.transform(d.ReceiptDate,'dd/MM/yyyy') 
          //d.FeeName = this.FeeDefinitions.filter(f=>f.FeeDefinitionId == d.AccountingVouchers[0].ClassFeeId)[0].FeeName;
          return d;
        })

        var groupbyPaymentType = alasql("Select PaymentType, Sum(TotalAmount) TotalAmount from ? group by PaymentType", [this.DateWiseCollection]);

        data.value.forEach(d => {
          d.AccountingVouchers.forEach(v => {
            var _feeCategoryName = '';
            if (v.ClassFee != null) {
              var _feeCategoryId = v.ClassFee.FeeDefinition.FeeCategoryId;
              var objCategory = this.FeeCategories.filter(f => f.MasterDataId == _feeCategoryId)
              if (objCategory.length > 0)
                _feeCategoryName = objCategory[0].MasterDataName;
                var _lastname = d.StudentClass.Student.LastName == null? '' : " " + d.StudentClass.Student.LastName;
              this.HeadsWiseCollection.push({
                ClassFeeId: v.ClassFeeId,
                Amount: v.Amount,
                PaymentType: this.PaymentTypes.filter(p => p.MasterDataId == d.PaymentTypeId)[0].MasterDataName,
                Student: d.StudentClass.Student.FirstName + _lastname,
                ClassName: d.StudentClass.Class.ClassName,
                FeeCategoryId: _feeCategoryId,
                FeeCategory: _feeCategoryName,
              })
            }
          })
          return d.AccountingVouchers;
        })

        this.HeadsWiseCollection = alasql("select FeeCategory,Sum(Amount) Amount from ? group by FeeCategory", [this.HeadsWiseCollection]);
        //console.log('this.HeadsWiseCollection', this.HeadsWiseCollection)

        this.GroupByPaymentType = [...groupbyPaymentType];
        if (this.DateWiseCollection.length == 0)
          this.contentservice.openSnackBar("No collection found.", globalconstants.ActionText, globalconstants.RedBackground);

        const rows = [];
        this.DateWiseCollection.forEach(element => rows.push(element, { detailRow: true, element }));
        //console.log("rows", rows)
        this.dataSource = new MatTableDataSource(rows);
        //this.dataSource.paginator = this.paginator;
        //this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      })
  }
  GetMasterData() {
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.shareddata.CurrentFeeDefinitions.subscribe((f: any) => {
          this.FeeDefinitions = [...f];
          if (this.FeeDefinitions.length == 0) {
            this.contentservice.GetFeeDefinitions(this.LoginUserDetail[0]["orgId"], 1).subscribe((d: any) => {
              this.FeeDefinitions = [...d.value];
            })
          }
        })
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.PaymentTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.FEEPAYMENTTYPE);
        this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);

        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Batches = this.tokenStorage.getBatches()
        this.GetStudents();

      });

  }
  GetStudents() {

    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'StudentId',
      'ClassId',
      'RollNo',
      'SectionId'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student($select=FirstName,LastName)"]
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Students = data.value.map(student => {
            var _classNameobj = this.Classes.filter(c => c.ClassId == student.ClassId);
            var _className = '';
            if (_classNameobj.length > 0)
              _className = _classNameobj[0].ClassName;

            var _Section = '';
            var _sectionobj = this.Sections.filter(f => f.MasterDataId == student.SectionId);
            if (_sectionobj.length > 0)
              _Section = _sectionobj[0].MasterDataName;
            var _lastname = student.Student.LastName == null ? '' : " " + student.Student.LastName;
            var _RollNo = student.RollNo;
            var _name = student.Student.FirstName + _lastname;
            var _fullDescription = _name + " - " + _className + " - " + _Section + " - " + _RollNo;
            return {
              StudentClassId: student.StudentClassId,
              StudentId: student.StudentId,
              Name: _fullDescription
            }
          })
        }
        this.loading = false; this.PageLoading = false;
      })
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);
    // let IdObj = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    // })
    // var Id = 0;
    // if (IdObj.length > 0) {
    //   Id = IdObj[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   });
    // }
    // else
    //   return [];
  }
}
export interface ITodayReceipt {
  "SlNo": number,
  "FeeName": string,
  "TotalAmount": string,
}