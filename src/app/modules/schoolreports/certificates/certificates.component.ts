import { DatePipe, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { IStudent } from 'src/app/modules/ClassSubject/AssignStudentClass/Assignstudentclassdashboard.component';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';


@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent implements OnInit {
  loading = false;
  LoginUserDetail = [];
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };

  rowCount = 0;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  StandardFilterWithBatchId = '';
  SelectedBatchId = 0;
  SubjectMarkComponents = [];
  MarkComponents = [];
  StudentGrades = [];
  StudentForVariables = [];
  Students = [];
  Genders = [];
  Classes = [];
  ClassGroups = [];
  Subjects = [];
  Sections = [];
  ExamStatuses = [];
  ExamNames = [];
  Exams = [];
  Batches = [];
  City = [];
  State = [];
  Country = [];
  BloodGroup = [];
  Category = [];
  Religion = [];
  ReasonForLeaving = [];
  CertificateElements = [];
  CertificateTypes = [];
  StudentSubjects = [];
  CommonStyles = [];
  CommonHeader = [];
  CommonFooter = [];
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  filteredOptions: Observable<IStudent[]>;
  ExamId = 0;
  ExamStudentSubjectResultData = {
    ExamStudentSubjectResultId: 0,
    ExamId: 0,
    StudentClassSubjectId: 0,
    ClassSubjectMarkComponentId: 0,
    Marks: 0,
    ExamStatus: 0,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    'Description',
  ];
  searchForm: FormGroup;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //this.loadTheme();
    debugger;
    this.searchForm = this.fb.group({
      searchStudentName: [0],
      searchCertificateTypeId: [0]
    });
    this.filteredOptions = this.searchForm.get("searchStudentName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      );
    //this.shareddata.CurrentSelectedBatchId.subscribe(s => this.SelectedBatchId = s);
  }
  loadTheme(strStyle: string) {
    const headEl = this.document.getElementsByTagName("head")[0];
    const styleEl = this.document.createElement('style');
    styleEl.innerText = strStyle;
    headEl.appendChild(styleEl);
    console.log('dd', styleEl)
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {

      this.shareddata.CurrentClasses.subscribe(c => (this.Classes = c));
      if (this.Classes.length == 0) {
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });
      }
      this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
      this.GetMasterData();

    }
  }

  GetStudentSubjects() {

    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    filterStr += ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();
    list.fields = [
      'StudentClassSubjectId',
      'ClassSubjectId',
      'StudentClassId',
      'Active',
      'ClassSubject/SubjectId',
      'ClassSubject/ClassId',
      'StudentClass/StudentId',
      'StudentClass/RollNo',
      'StudentClass/SectionId'
    ];

    list.PageName = "StudentClassSubjects";
    list.lookupFields = ["ClassSubject", "StudentClass"]
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        var _class = '';
        var _subject = '';
        var _section = '';
        this.StudentSubjects = data.value.map(s => {
          _class = '';
          _subject = '';

          let _stdClass = this.Classes.filter(c => c.ClassId == s.ClassSubject.ClassId);
          if (_stdClass.length > 0)
            _class = _stdClass[0].ClassName;

          let _stdSubject = this.Subjects.filter(c => c.MasterDataId == s.ClassSubject.SubjectId);
          if (_stdSubject.length > 0)
            _subject = _stdSubject[0].MasterDataName;

          let _stdSection = this.Sections.filter(c => c.MasterDataId == s.StudentClass.SectionId);
          if (_stdSection.length > 0)
            _section = _stdSection[0].MasterDataName;
          return {
            StudentClassSubjectId: s.StudentClassSubjectId,
            ClassSubjectId: s.ClassSubjectId,
            StudentClassId: s.StudentClassId,
            Student: s.StudentClass.RollNo,
            SubjectId: s.ClassSubject.SubjectId,
            Subject: _subject,
            ClassId: s.ClassSubject.ClassId,
            StudentId: s.StudentClass.StudentId,
            SectionId: s.StudentClass.SectionId
          }

        })
        this.loading = false;
      });
  }
  GetStudents(pStudentClassId) {
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1';
    let list: List = new List();

    if (pStudentClassId == 0) {
      list.fields = [
        "StudentClassId",
        "ClassId",
        "StudentId",
        "Student/FirstName",
        "Student/LastName"
      ];
    }
    else {

      filterstr += " and StudentClassId eq " + pStudentClassId;
      list.fields = [
        "StudentClassId",
        "ClassId",
        "SectionId",
        "RollNo",
        "AdmissionDate",
        "StudentId",
        "Student/FirstName",
        "Student/LastName",
        "Student/FatherName",
        "Student/MotherName",
        "Student/Gender",
        "Student/PermanentAddress",
        "Student/PresentAddress",
        "Student/WhatsAppNumber",
        "Student/City",
        "Student/Pincode",
        "Student/State",
        "Student/Country",
        "Student/DOB",
        "Student/Bloodgroup",
        "Student/Category",
        "Student/BankAccountNo",
        "Student/IFSCCode",
        "Student/MICRNo",
        "Student/AadharNo",
        "Student/Religion",
        "Student/ContactNo",
        "Student/AlternateContact",
        "Student/EmailAddress",
        "Student/LastSchoolPercentage",
        "Student/TransferFromSchool",
        "Student/TransferFromSchoolBoard",
        "Student/Remarks",
        "Student/FatherOccupation",
        "Student/FatherContactNo",
        "Student/MotherContactNo",
        "Student/MotherOccupation",
        "Student/NameOfContactPerson",
        "Student/RelationWithContactPerson",
        "Student/ContactPersonContactNo",
        "Student/LocationId",
        "Student/ReasonForLeavingId"
      ];
    }
    list.PageName = "StudentClasses";
    list.lookupFields = ["Student"];
    list.filter = [filterstr + orgIdSearchstr];

    this.dataservice.get(list).subscribe((data: any) => {
      if (pStudentClassId == 0) {
        this.Students = data.value.map(d => {
          var _lastName = d.Student.LastName == null ? '' : d.Student.LastName;
          d.Name = d.Student.FirstName + " " + _lastName;
          return {
            StudentId: d.StudentId,
            Name: d.Name,
            StudentClassId: d.StudentClassId
          }
        });
        this.loading = false;
      }
      else {
        //console.log('data.value',data.value)
        debugger;
        data.value.forEach(d => {
          var _studentClass = d.ClassId == null ? '' : this.Classes.filter(c => c.ClassId == d.ClassId)[0].ClassName;
          var _section = d.SectionId == null ? '' : this.Sections.filter(c => c.MasterDataId == d.SectionId)[0].MasterDataName;
          var _gender = d.Student.Gender == null ? '' : this.Genders.filter(c => c.MasterDataId == d.Student.Gender)[0].MasterDataName;
          var _city = d.Student.City == null ? '' : this.City.filter(c => c.MasterDataId == d.Student.City)[0].MasterDataName;
          var _state = d.Student.State == null ? '' : this.State.filter(c => c.MasterDataId == d.Student.State)[0].MasterDataName;
          var _country = d.Student.Country == null ? '' : this.Country.filter(c => c.MasterDataId == d.Student.Country)[0].MasterDataName;
          var _bloodgroup = d.Student.Bloodgroup == null ? '' : this.BloodGroup.filter(c => c.MasterDataId == d.Student.Bloodgroup)[0].MasterDataName;
          var _category = d.Student.Category == null ? '' : this.Category.filter(c => c.MasterDataId == d.Student.Category)[0].MasterDataName;
          var _religion = d.Student.Religion == null ? '' : this.Religion.filter(c => c.MasterDataId == d.Student.Religion)[0].MasterDataName;
          var _reason = d.Student.ReasonForLeavingId == null ? '' : this.ReasonForLeaving.filter(c => c.MasterDataId == d.Student.ReasonForLeavingId)[0].MasterDataName;

          this.StudentForVariables.push(
            { name: "Today", val: this.datepipe.transform(new Date(), 'dd/MM/yyyy') },
            { name: "StudentClass", val: _studentClass },
            { name: "Section", val: _section },
            { name: "RollNo", val: d.RollNo },
            { name: "AdmissionDate", val: d.AdmissionDate },
            { name: "StudentName", val: d.Student.FirstName + " " + (d.Student.LastName == null ? '' : d.Student.LastName) },
            { name: "FatherName", val: d.Student.FatherName },
            { name: "MotherName", val: d.Student.MotherName },
            { name: "Gender", val: _gender },
            { name: "PermanentAddress", val: d.Student.PermanentAddress },
            { name: "PresentAddress", val: d.Student.PresentAddress },
            { name: "WhatsAppNumber", val: d.Student.WhatsAppNumber },
            { name: "City", val: _city },
            { name: "State", val: _state },
            { name: "Country", val: _country },
            { name: "PinCode", val: d.Student.Pincode },
            { name: "DOB", val: this.datepipe.transform(d.Student.DOB, 'dd/MM/yyyy') },
            { name: "BloodGroup", val: _bloodgroup },
            { name: "Category", val: _category },
            { name: "BankAccountNo", val: d.Student.BankAccountNo },
            { name: "IFSCCode", val: d.Student.IFSCCode },
            { name: "MICRNo", val: d.Student.MICRNo },
            { name: "AadharNo", val: d.Student.AadharNo },
            { name: "Religion", val: _religion },
            { name: "ContactNo", val: d.Student.ContactNo },
            { name: "AlternateContact", val: d.Student.AlternateContact },
            { name: "EmailAddress", val: d.Student.EmailAddress },
            { name: "LastSchoolPercentage", val: d.Student.LastSchoolPercentage },
            { name: "TransferFromSchool", val: d.Student.TransferFromSchool },
            { name: "TransferFromSchoolBoard", val: d.Student.TransferFromSchoolBoard },
            { name: "FatherOccupation", val: d.Student.FatherOccupation },
            { name: "FatherContactNo", val: d.Student.FatherContactNo },
            { name: "MotherContactNo", val: d.Student.MotherContactNo },
            { name: "MotherOccupation", val: d.Student.MotherOccupation },
            { name: "NameOfContactPerson", val: d.Student.NameOfContactPerson },
            { name: "RelationWithContactPerson", val: d.Student.RelationWithContactPerson },
            { name: "ContactPersonContactNo", val: d.Student.ContactPersonContactNo },
            { name: "Location", val: d.Student.LocationId },
            { name: "ReasonForLeaving", val: _reason }
          )
        })
        //console.log('this.StudentForVariables',this.StudentForVariables);
        this.GenerateCertificate();

      }

    });

  }
  GenerateCertificate() {
    var _certificateBody = this.allMasterData.filter(a => a.ParentId == this.searchForm.get("searchCertificateTypeId").value)
    if (_certificateBody.length == 0) {
      this.loading = false;
      this.alert.error("Certificate not defined!", this.optionAutoClose);
      return;
    }
    _certificateBody.forEach(c => {
      this.StudentForVariables.forEach(s => {
        if (c.Description.includes('[' + s.name.trim() + ']'))
          c.Description = c.Description.replaceAll('[' + s.name.trim() + ']', s.val);
      });
    })
    _certificateBody.sort((a, b) => a.Sequence - b.Sequence);
    this.CertificateElements = [
      ...this.CommonHeader,
      ..._certificateBody,
      ...this.CommonFooter
    ];

    var styleStr = '';
    this.CertificateElements.forEach(f => {
      f.Logic = f.Logic == null ? '' : f.Logic;
      styleStr += f.Logic
    })
    this.CommonStyles.forEach(s => {
      styleStr += s.Description;
    });
    this.loadTheme(styleStr);
    //console.log("ss",this.CertificateElements)
    this.dataSource = new MatTableDataSource<any>(this.CertificateElements);
    this.loading = false;
  }
  GetExamStudentSubjectResults() {

    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.ExamStudentSubjectResult = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchExamId").value == 0) {
      this.alert.info("Please select exam", this.optionAutoClose);
      return;
    }
    if (this.searchForm.get("searchClassId").value == 0) {
      this.alert.info("Please select class", this.optionAutoClose);
      return;
    }

    this.loading = true;
    filterstr = 'ExamId eq ' + this.searchForm.get("searchExamId").value;

    let list: List = new List();
    list.fields = [
      "ExamStudentSubjectResultId",
      "ExamId",
      "StudentClassSubjectId",
      "ClassSubjectMarkComponentId",
      "Marks",
      "ExamStatus",
      "Active"
    ];
    list.PageName = "ExamStudentSubjectResults";
    list.filter = [filterstr + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.displayedColumns = [
      'Student',
    ];
    this.dataservice.get(list)
      .subscribe((examComponentResult: any) => {
        debugger;
        this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);

        this.loading = false;
      })

  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "Description", "ParentId", "Logic", "Sequence"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.City = this.getDropDownData(globalconstants.MasterDefinitions.school.CITY);
        this.State = this.getDropDownData(globalconstants.MasterDefinitions.school.STATE);
        this.Country = this.getDropDownData(globalconstants.MasterDefinitions.school.COUNTRY);
        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.school.RELIGION);
        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.school.CATEGORY);
        this.BloodGroup = this.getDropDownData(globalconstants.MasterDefinitions.school.BLOODGROUP);
        this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);

        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);

        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
        this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP);
        this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
        this.CertificateTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.CERTIFICATETYPE);
        this.CommonStyles = this.getDropDownData(globalconstants.MasterDefinitions.school.COMMONSTYLE);

        this.CommonHeader = this.getDropDownData(globalconstants.MasterDefinitions.school.COMMONHEADER);
        this.CommonFooter = this.getDropDownData(globalconstants.MasterDefinitions.school.COMMONFOOTER);
        this.CommonHeader.sort((a, b) => a.Sequence - b.Sequence)
        this.CommonFooter.sort((a, b) => a.Sequence - b.Sequence)
        //console.log('cer type',this.CertificateTypes)
        this.shareddata.ChangeBatch(this.Batches);
        this.GetStudents(0);
        //this.GetExams();
        //this.GetStudentSubjects();
      });
  }
  clear() {

  }
  GetCertificates() {
    debugger;
    if (this.searchForm.get("searchCertificateTypeId").value == 0) {
      this.alert.info("Please select certificate type!", this.optionsNoAutoClose);
      return;
    }
    var _studentClassId = this.searchForm.get("searchStudentName").value.StudentClassId;
    if (_studentClassId == undefined) {
      this.alert.info("Please select student!", this.optionsNoAutoClose);
      return;
    }

    this.loading = true;
    this.GetStudents(_studentClassId)

  }
  GetExams() {

    var orgIdSearchstr = 'and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();

    list.fields = ["ExamId", "ExamNameId"];
    list.PageName = "Exams";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Exams = data.value.map(e => {
          return {
            ExamId: e.ExamId,
            ExamName: this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId)[0].MasterDataName
          }
        })
      })
  }

  getDropDownData(dropdowntype) {
    let Id = 0;
    let Ids = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    })
    if (Ids.length > 0) {
      Id = Ids[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      })
    }
    else
      return [];

  }

}
export interface IExamStudentSubjectResult {
  ExamStudentSubjectResultId: number;
  ExamId: number;
  StudentClassSubjectId: number;
  Student: string;
  ClassSubjectMarkComponentId: number;
  SubjectMarkComponent: string;
  FullMark: number;
  PassMark: number;
  Marks: number;
  ExamStatus: number;
  Active: number;
  Action: boolean;
}

