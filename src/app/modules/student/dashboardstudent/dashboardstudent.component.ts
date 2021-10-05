import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TableUtil } from '../../TableUtil';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import * as XLSX from 'xlsx';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';

@Component({
  selector: 'app-dashboardstudent',
  templateUrl: './dashboardstudent.component.html',
  styleUrls: ['./dashboardstudent.component.scss']
})
export class DashboardstudentComponent implements OnInit {
  @ViewChild("table") tableRef: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  loading = false;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  ApplicationId = 0;
  filterOrgIdNBatchId = '';
  filterOrgIdOnly = '';
  filterBatchIdNOrgId = '';
  ELEMENT_DATA: IStudent[];
  dataSource: MatTableDataSource<IStudent>;
  displayedColumns = ['StudentId', 'Name', 'ClassName', 'FatherName', 'MotherName',
    'Active', 'ReasonForLeaving', 'Action'];
  allMasterData = [];
  Students = [];
  Genders = [];
  Classes = [];
  Batches = [];
  Bloodgroup = [];
  Category = [];
  Religion = [];
  States = []
  PrimaryContact = [];
  Location = [];
  LanguageSubjUpper = [];
  LanguageSubjLower = [];
  FeeType = [];
  FeeNames = [];
  Sections = [];
  UploadTypes = [];
  ReasonForLeaving = [];
  //StandardFilter ='';
  SelectedBatchId = 0;
  SelectedBatchStudentIDRollNo = [];
  StudentClassId = 0;
  studentSearchForm: FormGroup;
  filteredStudents: Observable<IStudent[]>;
  filteredFathers: Observable<IStudent[]>;
  filteredMothers: Observable<IStudent[]>;
  LoginUserDetail = [];
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService,
    private fb: FormBuilder,
    private shareddata: SharedataService,
    private token: TokenStorageService) { }

  ngOnInit(): void {
    debugger;
    this.loading = true;
    //this.urlId = +this.ar.snapshot.paramMap.get('id');
    this.LoginUserDetail = this.token.getUserDetail();
    this.shareddata.CurrentApplicationId.subscribe(a => this.ApplicationId = a);

    this.filterOrgIdOnly = globalconstants.getStandardFilter(this.LoginUserDetail);
    this.filterBatchIdNOrgId = globalconstants.getStandardFilterWithBatchId(this.token);
    //this.shareddata.ChangeSelectedBatchId
    //this.StandardFilter =globalconstants.getStandardFilter(this.LoginUserDetail);
    this.studentSearchForm = this.fb.group({
      //BatchId: [0, Validators.required],
      //StudentId: [0],
      searchStudentName: [''],
      FatherName: [''],
      MotherName: ['']
    })

    this.filteredStudents = this.studentSearchForm.get("searchStudentName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      );
    this.filteredFathers = this.studentSearchForm.get("FatherName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.FatherName),
        map(FatherName => FatherName ? this._filterF(FatherName) : this.Students.slice())
      );
    this.filteredMothers = this.studentSearchForm.get("MotherName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.MotherName),
        map(MotherName => MotherName ? this._filterM(MotherName) : this.Students.slice())
      );
    this.shareddata.CurrentClasses.subscribe(c => (this.Classes = c));
    if (this.Classes.length == 0) {
      this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
        this.Classes = [...data.value];
      });
    }

    this.GetMasterData();
    this.GetFeeTypes();
    this.GetStudents();
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  private _filterF(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.FatherName.toLowerCase().includes(filterValue));

  }
  private _filterM(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.MotherName.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  displayFnF(stud: IStudent): string {
    return stud && stud.FatherName ? stud.FatherName : '';
  }
  displayFnM(stud: IStudent): string {
    return stud && stud.MotherName ? stud.MotherName : '';
  }
  GetMasterData() {
    debugger;
    this.loading = true;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 or " + this.filterOrgIdOnly + ')'];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
        //console.log('this.SelectedBatchId',this.SelectedBatchId);
        this.SelectedBatchId = +this.token.getSelectedBatchId();
        this.filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.token);

        this.shareddata.ChangeMasterData(data.value);
        this.allMasterData = [...data.value];

        this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
        this.shareddata.ChangeReasonForLeaving(this.ReasonForLeaving);

        // this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASS);
        // this.shareddata.ChangeClasses(this.Classes);

        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH);
        //this.shareddata.ChangeBatch(this.Batches);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        //this.shareddata.CurrentSelectedBatchId.subscribe(c=>(this.SelectedBatchId=c));

        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.school.CATEGORY);
        this.shareddata.ChangeCategory(this.Category);

        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.school.RELIGION);
        this.shareddata.ChangeReligion(this.Religion);

        this.States = this.getDropDownData(globalconstants.MasterDefinitions.school.STATE);
        this.shareddata.ChangeStates(this.States);

        this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
        this.shareddata.ChangePrimaryContact(this.PrimaryContact);

        this.Location = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        this.shareddata.ChangeLocation(this.Location);

        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
        this.shareddata.ChangeGenders(this.Genders);

        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.school.BLOODGROUP);
        this.shareddata.ChangeBloodgroup(this.Bloodgroup);

        this.LanguageSubjUpper = this.getDropDownData(globalconstants.MasterDefinitions.school.LANGUAGESUBJECTUPPERCLS);
        this.shareddata.ChangeLanguageSubjectUpper(this.LanguageSubjUpper);

        this.LanguageSubjLower = this.getDropDownData(globalconstants.MasterDefinitions.school.LANGUAGESUBJECTLOWERCLS);
        this.shareddata.ChangeLanguageSubjectLower(this.LanguageSubjLower);

        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions.school.FEENAME);
        this.shareddata.ChangeFeeNames(this.FeeNames);

        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.shareddata.ChangeSection(this.Sections);

        this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.UPLOADTYPE);
        this.shareddata.ChangeUploadType(this.UploadTypes);

        this.loading = false;
        this.getSelectedBatchStudentIDRollNo();


      });

  }
  getDropDownData(dropdowntype) {
    let Ids = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    });
    if (Ids.length > 0) {
      var Id = Ids[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      });
    }
    else
      return [];
  }
  fee(id) {
    this.route.navigate(['/school/' + this.ApplicationId + '/addstudentfeepayment/' + id]);
  }
  class(id) {
    this.route.navigate(['/school/' + this.ApplicationId + '/addstudentcls/' + id]);
  }
  view(element) {
    debugger;
    this.generateDetail(element);
    //  this.route.navigate(['/admin/addstudent/' + id], { queryParams: { scid: this.StudentClassId, bid: this.BatchId } });
    this.route.navigate(['/school/' + this.ApplicationId + '/addstudent/' + element.StudentId]);
  }
  feepayment(element) {
    this.generateDetail(element);
    this.route.navigate(['/school/' + this.ApplicationId + '/feepayment']);
  }
  generateDetail(element) {
    let StudentName = element.StudentId + ' ' + element.Name + ' ' + element.FatherName + ' ' + element.MotherName + ',';

    let studentclass = this.SelectedBatchStudentIDRollNo.filter(sid => sid.StudentId == element.StudentId);
    if (studentclass.length > 0) {
      var _clsName = '';
      var objcls = this.Classes.filter(f => f.ClassId == studentclass[0].ClassId);
      if (objcls.length > 0)
        _clsName = objcls[0].ClassName

      var _sectionName = this.Sections.filter(f => f.MasterDataId == studentclass[0].SectionId)[0].MasterDataName;
      this.StudentClassId = studentclass[0].StudentClassId
      StudentName += "\n " + _clsName + "-" + _sectionName;
    }

    this.shareddata.ChangeStudentName(StudentName);

    this.shareddata.ChangeStudentClassId(this.StudentClassId);
    this.shareddata.ChangeStudentId(element.StudentId);

  }
  new() {
    //var url = this.route.url;
    this.route.navigate(['/school/' + this.ApplicationId + '/addstudent']);
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.tableRef.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'basicinfo.xlsx');
  }
  exportArray() {
    const datatoExport: Partial<IStudentDownload>[] = this.ELEMENT_DATA.map(x => ({
      StudentId: x.StudentId,
      Name: x.Name,
      FatherName: x.FatherName,
      Class: '',
      RollNo: '',
      Section: '',
      AdmissionDate: null
    }));
    TableUtil.exportArrayToExcel(datatoExport, "ExampleArray");
  }
  getSelectedBatchStudentIDRollNo() {
    let list: List = new List();
    list.fields = ["StudentId", "RollNo", "SectionId", "StudentClassId", "ClassId"];
    list.PageName = "StudentClasses";
    list.filter = [this.filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.SelectedBatchStudentIDRollNo = [...data.value];

        }
      })
  }
  GetFeeTypes() {
    this.loading = true;
    var filter = globalconstants.getStandardFilterWithBatchId(this.token);
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = [filter];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeType = [...data.value];
        this.shareddata.ChangeFeeType(this.FeeType);
        this.loading = false;
      })
  }
  GetStudent() {
    debugger;

    let checkFilterString = '';//"OrgId eq " + this.LoginUserDetail[0]["orgId"] + ' and Batch eq ' + 
    var studentName = this.studentSearchForm.get("searchStudentName").value.Name;
    if (studentName != undefined && studentName.trim().length > 0)
      checkFilterString += " and  StudentId eq " + this.studentSearchForm.get("searchStudentName").value.StudentId;
    if (this.studentSearchForm.get("FatherName").value.FatherName != undefined)
      checkFilterString += " and FatherName eq '" + this.studentSearchForm.get("FatherName").value.FatherName + "'";
    if (this.studentSearchForm.get("MotherName").value.MotherName != undefined)
      checkFilterString += " and MotherName eq '" + this.studentSearchForm.get("MotherName").value.MotherName + "'"

    let list: List = new List();
    list.fields = ["StudentId", "StudentClasses/StudentClassId",
      "StudentClasses/BatchId",
      "StudentClasses/ClassId",
      "StudentClasses/RollNo",
      "FirstName", "LastName", "FatherName",
      "MotherName", "FatherContactNo",
      "MotherContactNo", "Active",
      "ReasonForLeavingId"];
    list.lookupFields = ["StudentClasses"];
    list.PageName = "Students";
    list.filter = [this.filterOrgIdOnly + checkFilterString];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        if (data.value.length > 0) {
          var formattedData = data.value.filter(sc => {
            let reason = this.ReasonForLeaving.filter(r => r.MasterDataId == sc.ReasonForLeavingId)
            sc.StudentClasses = sc.StudentClasses.filter(c => c.BatchId == this.SelectedBatchId)
            sc.ReasonForLeaving = reason.length > 0 ? reason[0].MasterDataName : '';
            return sc;
          });
          this.ELEMENT_DATA = formattedData.map(item => {
            item.Name = item.FirstName + " " + item.LastName;
            if (item.StudentClasses.length == 0)
              item.ClassName = '';
            else {
              var clsobj = this.Classes.filter(cls => {
                return cls.MasterDataId == item.StudentClasses[0].ClassId
              })
              if (clsobj.length > 0)
                item.ClassName = clsobj[0].ClassName;
              else
                item.ClassName = '';
            }
            item.Action = "";

            return item;
          })
        }
        else {
          this.ELEMENT_DATA = [];
          this.alert.info("No student found!", this.options);
        }
        this.dataSource = new MatTableDataSource<IStudent>(this.ELEMENT_DATA);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });

  }
  GetStudents() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'StudentId',
      'ClassId',
      'RollNo',
      'SectionId',
      'Student/FirstName',
      'Student/LastName',
      'Student/FatherName',
      'Student/MotherName',
      'Student/ContactNo',
      'Student/FatherContactNo',
      'Student/MotherContactNo',
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student"]
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Students = data.value.map(student => {
            var _classNameobj = this.Classes.filter(c => c.ClassId == student.ClassId);
            var _className = '';
            if (_classNameobj.length > 0)
              _className = _classNameobj[0].ClassName;
            var _SectionObj = this.Sections.filter(f => f.MasterDataId == student.SectionId)
            var _section = '';
            if (_SectionObj.length > 0)
              _section = _SectionObj[0].MasterDataName;
            var _RollNo = student.RollNo;
            var _name = student.Student.FirstName + " " + student.Student.LastName;
            var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo + "-" + student.Student.ContactNo;
            return {
              StudentClassId: student.StudentClassId,
              StudentId: student.StudentId,
              Name: _fullDescription,
              FatherName: student.Student.FatherName + "-" + student.Student.FatherContactNo,
              MotherName: student.Student.MotherName + "-" + student.Student.MotherContactNo,
            }
          })
        }
        this.loading = false;
      })
  }
}
export interface IStudent {
  StudentId: number;
  Name: string;
  FatherName: string;
  MotherName: string;
  FatherContactNo: string;
  MotherContactNo: string;
  Active: boolean;
  Action: boolean;
}
export interface IStudentDownload {
  StudentId: number;
  Name: string;
  FatherName: string;
  AdmissionDate: Date;
  Class: string;
  RollNo: string;
  Section: string;
}


