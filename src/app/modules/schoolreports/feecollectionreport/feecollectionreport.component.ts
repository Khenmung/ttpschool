import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { IStudent } from '../../admission/AssignStudentClass/Assignstudentclassdashboard.component';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-feecollectionreport',
  templateUrl: './feecollectionreport.component.html',
  styleUrls: ['./feecollectionreport.component.scss']
})
export class FeecollectionreportComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  loading = false;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SelectedApplicationId = 0;
  Permission = 'deny';
  LoginUserDetail = [];
  TotalPaidStudentCount = 0;
  TotalUnPaidStudentCount = 0;
  allMasterData = [];
  DropdownFeeDefinitions = [];
  FeeDefinitions = [];
  Classes = [];
  Batches = [];
  Sections = [];
  Months = [];
  ELEMENT_DATA = [];
  StudentDetail = [];
  TotalAmount = 0;
  CurrentBatch: string = '';
  Students = [];
  DisplayColumns = [
    "Name",
    "ClassRollNoSection",
    "RollNo",
    //"MonthName",


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
  SearchForm: UntypedFormGroup;
  ErrorMessage: string = '';
  //alert: any;
  constructor(private servicework: SwUpdate,
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder,

    private shareddata: SharedataService,
    private tokenservice: TokenStorageService,
    private nav: Router
  ) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    this.LoginUserDetail = this.tokenservice.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenservice, globalconstants.Pages.edu.REPORT.FEEPAYMENTSTATUS);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      //      //console.log('this.Permission', this.Permission)
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenservice.getSelectedAPPId();
        this.SelectedBatchId = +this.tokenservice.getSelectedBatchId();
        this.filterOrgIdOnly = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.shareddata.CurrentFeeDefinitions.subscribe(c => (this.FeeDefinitions = c));
        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Batches = this.tokenservice.getBatches();
        this.shareddata.CurrentSection.subscribe(c => (this.Sections = c));

        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });


        this.SearchForm = this.fb.group({
          searchStudentName: [0],
          searchClassId: [0],
          // searchSectionId: [0],
          searchMonth: [0],
          PaidNotPaid: ['']
        })

        this.filteredOptions = this.SearchForm.get("searchStudentName").valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value.Name),
            map(Name => Name ? this._filter(Name) : this.Students.slice())
          );
      }
      this.PageLoad();
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
    debugger;
    this.ErrorMessage = '';
    let filterstring = "Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    var selectedMonth = this.SearchForm.get("searchMonth").value;
    var _selectedClassId = this.SearchForm.get("searchClassId").value;
    var paidNotPaid = this.SearchForm.get("PaidNotPaid").value;
    //var studentclassId = this.SearchForm.get("searchStudentName").value.StudentClassId;
    var nestedFilter = '';

    if (selectedMonth == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select month.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (paidNotPaid == '') {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select paid or not paid option.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    nestedFilter = "$filter=Balance eq 0 and Month eq " + selectedMonth + ";";

    if (_selectedClassId > 0) {
      filterstring += ' and ClassId eq ' + _selectedClassId;
    }

    let list: List = new List();
    list.fields = [
      'ClassId,RollNo,SectionId,StudentClassId'
    ];
    list.PageName = "StudentClasses";//AccountingLedgerTrialBalances";
    //StudentClassId','Month','TotalDebit','Balance'

    list.lookupFields = ["Student($select=FirstName,LastName),AccountingLedgerTrialBalances(" + nestedFilter + "$select=StudentClassId,Month,TotalDebit,Balance)"];
    list.filter = [filterstring];
    this.ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource<ITodayReceipt>(this.ELEMENT_DATA);
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        var result = [];
        if (data.value.length > 0) {
          //this.TotalStudentCount = data.value.length;
          var _className = '';
          var _sectionName = '';

          data.value.forEach((item, indx) => {
            _className = '';
            _sectionName = '';
            var clsobj = this.Classes.filter(c => c.ClassId == item.ClassId)
            if (clsobj.length > 0) {
              _className = clsobj[0].ClassName
              var sectionObj = this.Sections.filter(s => s.MasterDataId == item.SectionId)
              if (sectionObj.length > 0)
                _sectionName = sectionObj[0].MasterDataName
              var _lastname = item.Student.LastName == null ? '' : " " + item.Student.LastName;
              result.push({
                Name: item.Student.FirstName + _lastname,
                ClassRollNoSection: _className + ' - ' + _sectionName,
                RollNo: item.RollNo,
                Section: _sectionName,
                Month: item.AccountingLedgerTrialBalances.length > 0 ? item.AccountingLedgerTrialBalances[0].Month : 0,
                Sequence: clsobj[0].Sequence
              })
            }
          });
          debugger;
          //result =result.sort((a,b)=>a.Sequence - b.Sequence);
          this.ELEMENT_DATA = alasql("select Name,ClassRollNoSection,RollNo,Sequence,Section,MAX(Month) month from ? group by Name,Sequence,ClassRollNoSection,Section,RollNo", [result]);
          if (paidNotPaid == 'NotPaid')
            this.ELEMENT_DATA = this.ELEMENT_DATA.filter(f => f.month == 0); //.sort((a, b) => a.month - b.month)
          else
            this.ELEMENT_DATA = this.ELEMENT_DATA.filter(f => f.month > 0); //.sort((a, b) => a.month - b.month)
          this.loading = false; this.PageLoading = false;
          this.TotalPaidStudentCount = this.ELEMENT_DATA.length;
          if (this.ELEMENT_DATA.length == 0) {
            this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
          }

          this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a, b) => a.Sequence - b.Sequence || a.Section.localeCompare(b.Section) || a.RollNo - b.RollNo);

          this.dataSource = new MatTableDataSource<ITodayReceipt>(this.ELEMENT_DATA);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
          this.loading = false; this.PageLoading = false;
          this.dataSource = new MatTableDataSource<ITodayReceipt>(this.ELEMENT_DATA);
          this.dataSource.paginator = this.paginator;
        }
        this.loading = false;
        this.PageLoading = false;

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
              var _lastname = item.Student.LastName == null ? '' : " " + item.Student.LastName;
              this.StudentDetail.push({
                SlNo: indx + 1,
                Name: item.Student.FirstName + _lastname,
                RollNo: item.RollNo,
                ClassRollNoSection: this.Classes.filter(c => c.ClassId == item.ClassId)[0].ClassName + ' - ' + this.Sections.filter(c => c.MasterDataId == item.SectionId)[0].MasterDataName,
              });
            }
          });
          this.TotalUnPaidStudentCount = this.StudentDetail.length;
          this.UnpaidDataSource = new MatTableDataSource<INotPaidStudent>(this.StudentDetail);
        }
      });
  }

  GetMasterData() {
    this.allMasterData = this.tokenservice.getMasterData();
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);

  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenservice, this.allMasterData);
    // let Id = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    // })[0].MasterDataId;
    // return this.allMasterData.filter((item, index) => {
    //   return item.ParentId == Id
    // });
  }
  GetStudents() {

    ////console.log(this.LoginUserDetail);

    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'StudentId',
      'ClassId',
      'RollNo',
      'SectionId'
    ];

    list.PageName = "StudentClasses";
    //list.lookupFields = ["Student($select=FirstName,LastName)"]
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          var _students: any = this.tokenservice.getStudents();
          var _filteredStudents = _students.filter(s => data.value.findIndex(fi => fi.StudentId == s.StudentId) > -1)
          this.Students = data.value.map(studentcls => {
            var matchstudent = _filteredStudents.filter(stud => stud.StudentId == studentcls.StudentId)
            var _classNameobj = this.Classes.filter(c => c.ClassId == studentcls.ClassId);
            var _className = '';
            if (_classNameobj.length > 0)
              _className = _classNameobj[0].ClassName;

            var _Section = '';
            var _sectionobj = this.Sections.filter(f => f.MasterDataId == studentcls.SectionId);
            if (_sectionobj.length > 0)
              _Section = _sectionobj[0].MasterDataName;

            var _RollNo = studentcls.RollNo;

            var _lastname = matchstudent[0].LastName == null ? '' : " " + matchstudent[0].LastName;
            var _name = matchstudent[0].FirstName + _lastname;
            var _fullDescription = _name + " - " + _className + " - " + _Section + " - " + _RollNo;
            return {
              StudentClassId: studentcls.StudentClassId,
              StudentId: studentcls.StudentId,
              Name: _fullDescription
            }
          })
        }
        this.loading = false; this.PageLoading = false;
      })
  }
}
export interface ITodayReceipt {
  "SlNo": number,
  "Name": string,
  "ClassRollNoSection": string,
  "RollNo": number,
  "PaymentDate": number,
  "Month": number,
  "MonthName": string
}
export interface INotPaidStudent {
  "SlNo": number,
  "Name": string,
  "RollNo": number;
  "ClassRollNoSection": string
}
