import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { IStudent } from '../../ClassSubject/AssignStudentClass/Assignstudentclassdashboard.component';

@Component({
  selector: 'app-feecollectionreport',
  templateUrl: './feecollectionreport.component.html',
  styleUrls: ['./feecollectionreport.component.scss']
})
export class FeecollectionreportComponent implements OnInit {
  @ViewChild('PaidPaginator') PaidPaginator: MatPaginator;
  @ViewChild('UnPaidPaginator') UnPaidPaginator: MatPaginator;
  loading = false;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  LoginUserDetail = [];
  TotalPaidStudentCount = 0;
  TotalUnPaidStudentCount = 0;
  allMasterData = [];
  DropdownFeeNames = [];
  FeeNames = [];
  Classes = [];
  Batches = [];
  Sections = [];
  Months=[];
  ELEMENT_DATA = [];
  StudentDetail = [];
  TotalAmount = 0;
  CurrentBatch: string = '';
  Students = [];
  DisplayColumns = [
    "Name",
    "ClassRollNoSection",
    "RollNo",
    "MonthName",
    

  ]
  UnpaidDisplayColumns = [
    "SlNo",
    "Name",
    "ClassRollNoSection",
    "RollNo"

  ]
  filteredOptions: Observable<IStudent[]>;
  filterOrgIdOnly = '';
  SelectedBatchId = 0;
  dataSource: MatTableDataSource<ITodayReceipt>;
  UnpaidDataSource: MatTableDataSource<INotPaidStudent>;
  SearchForm: FormGroup;
  ErrorMessage: string = '';
  //alert: any;
  constructor(
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
    private fb: FormBuilder,
    private alert: AlertService,
    private shareddata: SharedataService,
    private tokenservice: TokenStorageService,
    private nav: Router
  ) { }

  ngOnInit(): void {
    this.LoginUserDetail = this.tokenservice.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedBatchId = +this.tokenservice.getSelectedBatchId();
      this.filterOrgIdOnly = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.shareddata.CurrentFeeNames.subscribe(c => (this.FeeNames = c));
      this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
      this.shareddata.CurrentSection.subscribe(c => (this.Sections = c));

      this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
        this.Classes = [...data.value];
      });


      this.SearchForm = this.fb.group({
        searchStudentName: [0],
        searchClassId: [0],
        searchSectionId: [0]
      })

      this.filteredOptions = this.SearchForm.get("searchStudentName").valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.Name),
          map(Name => Name ? this._filter(Name) : this.Students.slice())
        );
    }
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  PageLoad() {
    debugger;
    this.Months = this.contentservice.GetSessionFormattedMonths();
    this.SelectedBatchId = +this.tokenservice.getSelectedBatchId();
    this.GetMasterData();
    this.GetStudents();
  }
  get f() {
    return this.SearchForm.controls;
  }

  GetStudentFeePaymentReport() {
    //debugger;

    if (this.SearchForm.get("searchStudentName").value == 0 && this.SearchForm.get("searchClassId").value == 0) {
      this.alert.error('Please select either student or class!', this.options.autoClose);
      return;
    }

    this.ErrorMessage = '';
    let filterstring = '';

    filterstring = "Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'Month',
      'TotalDebit'
    ];
    list.PageName = "AccountingLedgerTrialBalances";
    list.lookupFields = ["StudentClass($select=ClassId,RollNo,SectionId,StudentClassId;$expand=Student($select=FirstName,LastName))"];
    list.filter = [filterstring];
    //list.apply ="groupby((StudentClassId),topcount(1,Month))"
    //list.orderBy = "PaymentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //this.TotalAmount = 0;
        var result=[];
        if (data.value.length > 0) {
          //this.TotalStudentCount = data.value.length;
          result = data.value.map((item, indx) => {
           
            return {
              Name: item.StudentClass.Student.FirstName + " " + item.StudentClass.Student.LastName,
              ClassRollNoSection: this.Classes.filter(c => c.ClassId == item.StudentClass.ClassId)[0].ClassName + ' - ' + this.Sections.filter(s => s.MasterDataId == item.StudentClass.SectionId)[0].MasterDataName,
              RollNo: item.StudentClass.RollNo,
              Month:item.Month
            }
          });
          debugger;
          this.ELEMENT_DATA = alasql("select Name,ClassRollNoSection,RollNo,MAX(Month) month from ? group by Name,ClassRollNoSection,RollNo",[result]);
          this.ELEMENT_DATA.forEach(f=>{
           
            var monthobj = this.Months.filter(m=>m.val===f.month);
            if(monthobj.length>0)
            f.MonthName = monthobj[0].MonthName;
            
          })
          this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a,b)=>a.month - b.month)
          //console.log(this.ELEMENT_DATA)
          //this.ELEMENT_DATA = Math.max.apply(null, result.map(function(o) { return o; }))
          this.TotalPaidStudentCount = this.ELEMENT_DATA.length;
          this.dataSource = new MatTableDataSource<ITodayReceipt>(this.ELEMENT_DATA);
          this.dataSource.paginator = this.PaidPaginator;
        }
      })
  }
  getStudentClasses() {
    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'ClassId',
      'RollNo',
      'SectionId'
    ];
    list.PageName = "StudentClasses";
    list.lookupFields = ["Student($select=FirstName,LastName)"];
    list.filter = ["Active eq 1 and Batch eq " + this.SelectedBatchId];
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
                Name: item.Student.FirstName + " " + item.Student.LastName,
                RollNo: item.RollNo,
                ClassRollNoSection: this.Classes.filter(c => c.ClassId == item.ClassId)[0].ClassName + ' - ' + this.Sections.filter(c => c.MasterDataId == item.SectionId)[0].MasterDataName,
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
    debugger;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 or " + this.filterOrgIdOnly + ')'];

    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions.school.FEENAME);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);

        //since only one current batch is accepted
        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));


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
  GetStudents() {

    //console.log(this.LoginUserDetail);

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
        //  console.log('data.value', data.value);
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

            var _RollNo = student.RollNo;
            var _name = student.Student.FirstName + " " + student.Student.LastName;
            var _fullDescription = _name + " - " + _className + " - " + _Section + " - " + _RollNo;
            return {
              StudentClassId: student.StudentClassId,
              StudentId: student.StudentId,
              Name: _fullDescription
            }
          })
        }
        this.loading = false;
      })
  }
}
export interface ITodayReceipt {
  "SlNo": number,
  "Name": string,
  "ClassRollNoSection": string,
  "RollNo": number,
  "PaymentDate": number,
  "Month":number,
  "MonthName":string
}
export interface INotPaidStudent {
  "SlNo": number,
  "Name": string,
  "RollNo": number;
  "ClassRollNoSection": string
}
