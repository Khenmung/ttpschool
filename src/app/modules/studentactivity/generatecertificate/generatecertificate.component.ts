import { DatePipe, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { evaluate } from 'mathjs';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/internal/operators/startWith';
import { map } from 'rxjs/operators';
import { IStudent } from 'src/app/modules/ClassSubject/AssignStudentClass/Assignstudentclassdashboard.component';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';


@Component({
  selector: 'app-generatecertificate',
  templateUrl: './generatecertificate.component.html',
  styleUrls: ['./generatecertificate.component.scss']
})
export class GenerateCertificateComponent implements OnInit {
  PageLoading = true;
  loading = false;
  LoginUserDetail = [];
  Permission = '';
  rowCount = 0;
  ExamStudentSubjectResult: IExamStudentSubjectResult[] = [];
  StandardFilterWithBatchId = '';
  SelectedBatchId = 0;
  SubjectMarkComponents = [];
  MarkComponents = [];
  StudentGrades = [];
  StudentForVariables = [];
  FeePaidLastMonth = 0;
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
  Houses = [];
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
  Organization = [];
  StudentAttendanceList = [];
  StudentClasses = [];
  dataSource: MatTableDataSource<any>;
  allMasterData = [];
  //studentSearchForm: FormGroup;
  filteredStudents: Observable<IStudent[]>;
  //filteredOptions: Observable<IStudent[]>;
  AttendanceStatusSum = [];
  ExamId = 0;
  StudentClassId = 0;
  SelectedApplicationId = 0;
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
  searchForm: UntypedFormGroup;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    //this.loadTheme();
    //debugger;
    this.searchForm = this.fb.group({
      searchStudentName: [''],
      searchCertificateTypeId: [0]
    });
    this.filteredStudents = this.searchForm.get("searchStudentName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      );
    this.PageLoad();
  }
  loadTheme(strStyle: string) {
    const headEl = this.document.getElementsByTagName("head")[0];
    const styleEl = this.document.createElement('style');
    styleEl.innerText = strStyle;
    headEl.appendChild(styleEl);
    ////console.log('dd', styleEl)
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
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.StudentClassId = +this.tokenstorage.getStudentClassId();
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.STUDENT.GENERATECERTIFICATE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      // if (this.StudentClassId == 0) {
      //   this.loading = false; this.PageLoading=false;
      //   this.contentservice.openSnackBar("Please define class for this student.", globalconstants.ActionText, globalconstants.RedBackground);
      //   //this.nav.navigate(['/edu']);
      // }
      // else 
      if (this.Permission != 'deny') {
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.GetMasterData();

        //this.GetStudentAttendance();
        //this.getPaymentStatus();

      }
      else {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
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
      'Active'
    ];

    list.PageName = "StudentClassSubjects";
    list.lookupFields = ["ClassSubject($select=SubjectId,ClassId)",
      "StudentClass($select=StudentId,RollNo,SectionId)"]
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
        this.loading = false; this.PageLoading = false;
      });
  }
  GetStudentAndGenerateCerts() {
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1';
    let list: List = new List();

    if (this.StudentClassId == 0) {
      list.fields = [
        "StudentClassId",
        "ClassId",
        "StudentId"
      ];
    }
    else {

      filterstr += " and StudentClassId eq " + this.StudentClassId;
      list.fields = [
        "StudentClassId",
        "ClassId",
        "SectionId",
        "RollNo",
        "AdmissionDate",
        "StudentId",
        "BatchId",
        "HouseId"
      ];
    }
    list.PageName = "StudentClasses";
    if (this.StudentClassId == 0) {
      list.lookupFields = ["Student($select=FirstName,LastName)"];
    }
    else
      list.lookupFields = [
        "Student($select=FirstName,LastName," +
        "FatherName,MotherName,Gender,PermanentAddress," +
        "PresentAddress," +
        "WhatsAppNumber," +
        "DOB," +
        "Bloodgroup," +
        "Category," +
        "BankAccountNo," +
        "IFSCCode," +
        "MICRNo," +
        "AdhaarNo," +
        "Religion," +
        "ContactNo," +
        "AlternateContact," +
        "EmailAddress," +
        "LastSchoolPercentage," +
        "TransferFromSchool," +
        "TransferFromSchoolBoard," +
        "RemarkId," +
        "FatherOccupation," +
        "FatherContactNo," +
        "MotherContactNo," +
        "MotherOccupation," +
        "NameOfContactPerson," +
        "RelationWithContactPerson," +
        "ContactPersonContactNo," +
        "ReasonForLeavingId)"];
    list.filter = [filterstr + orgIdSearchstr];

    this.dataservice.get(list).subscribe((data: any) => {
      if (this.StudentClassId == 0) {
        this.Students = data.value.map(d => {
          var _lastName = d.Student.LastName == null ? '' : d.Student.LastName;
          d.Name = d.Student.FirstName + " " + _lastName;
          return {
            StudentId: d.StudentId,
            Name: d.Name,
            StudentClassId: d.StudentClassId
          }
        });
        this.loading = false; this.PageLoading = false;
      }
      else {
        ////console.log('data.value',data.value)
        debugger;
        this.StudentForVariables = [];
        data.value.forEach(d => {

          var _studentClass = '';
          var classObj = this.Classes.filter(c => c.ClassId == d.ClassId);
          if (classObj.length > 0)
            _studentClass = classObj[0].ClassName
          var _section = d.SectionId == null ? '' : this.Sections.filter(c => c.MasterDataId == d.SectionId)[0].MasterDataName;
          var _gender = d.Student.Gender == null ? '' : this.Genders.filter(c => c.MasterDataId == d.Student.Gender)[0].MasterDataName;
          var _bloodgroup = d.Student.Bloodgroup == null ? '' : this.BloodGroup.filter(c => c.MasterDataId == d.Student.Bloodgroup)[0].MasterDataName;
          var _category = d.Student.Category == null ? '' : this.Category.filter(c => c.MasterDataId == d.Student.Category)[0].MasterDataName;
          var _religion = d.Student.Religion == null ? '' : this.Religion.filter(c => c.MasterDataId == d.Student.Religion)[0].MasterDataName;
          var _reasonobj = d.Student.ReasonForLeavingId == null ? '' : this.ReasonForLeaving.filter(c => c.MasterDataId == d.Student.ReasonForLeavingId)
          var _reason = '';
          if (_reasonobj.length > 0)
            _reason = _reasonobj[0].MasterDataName;
          var _batch = this.Batches.filter(c => c.BatchId == d.BatchId)[0].BatchName;
          var _house = '';
          var objhouse = this.Houses.filter(c => c.MasterDataId == d.HouseId);
          if (objhouse.length > 0)
            _house = objhouse[0].MasterDataName;
            var _lastname = d.Student.LastName == null || d.Student.LastName == '' ? '' : " " + d.Student.LastName;
          this.StudentForVariables.push(
            { name: "ToDay", val: this.datepipe.transform(new Date(), 'dd/MM/yyyy') },
            { name: "StudentClass", val: _studentClass },
            { name: "Section", val: _section },
            { name: "RollNo", val: d.RollNo },
            { name: "AdmissionDate", val: d.AdmissionDate },
            { name: "StudentName", val: d.Student.FirstName + _lastname },
            { name: "FatherName", val: d.Student.FatherName },
            { name: "MotherName", val: d.Student.MotherName },
            { name: "Gender", val: _gender },
            { name: "PermanentAddress", val: d.Student.PermanentAddress },
            { name: "PresentAddress", val: d.Student.PresentAddress },
            { name: "WhatsAppNumber", val: d.Student.WhatsAppNumber },
            { name: "PinCode", val: d.Student.Pincode },
            { name: "DOB", val: this.datepipe.transform(d.Student.DOB, 'dd/MM/yyyy') },
            { name: "BloodGroup", val: _bloodgroup },
            { name: "Category", val: _category },
            { name: "BankAccountNo", val: d.Student.BankAccountNo },
            { name: "IFSCCode", val: d.Student.IFSCCode },
            { name: "MICRNo", val: d.Student.MICRNo },
            { name: "AdhaarNo", val: d.Student.AdhaarNo },
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
            { name: "ReasonForLeaving", val: _reason },
            { name: "Batch", val: _batch },
            { name: "House", val: _house }
          )
        })
        this.StudentForVariables.push(
          { name: "FeePaidTill", val: this.FeePaidLastMonth },
          { name: "Attendance", val: this.AttendanceStatusSum }
        )
        ////console.log('this.StudentForVariables',this.StudentForVariables);
        this.GenerateCertificate();

      }

    });

  }
  GenerateCertificate() {
    debugger;
    var _certificateBody = this.allMasterData.filter(a => a.ParentId == this.searchForm.get("searchCertificateTypeId").value)
    if (_certificateBody.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Certificate not defined!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    var certificateavailable = true;
    var _certificateFormula = this.allMasterData.filter(a => a.MasterDataId == this.searchForm.get("searchCertificateTypeId").value)
    if (_certificateFormula.length > 0) {
      for (var i = 0; i < _certificateFormula.length; i++) {
        if (_certificateFormula[i].Logic.length > 0) {
          this.StudentForVariables.forEach(s => {
            if (_certificateFormula[i].Logic.includes('[' + s.name.trim() + ']'))
              _certificateFormula[i].Logic = _certificateFormula[i].Logic.replaceAll('[' + s.name.trim() + ']', s.val);
          });
          if (!evaluate(_certificateFormula[i].Logic)) {
            certificateavailable = false;
            break;
          }
        }
      }
      if (!certificateavailable) {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(_certificateFormula[0].MasterDataName + " not available for this student.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }

    ////console.log("_certificateBody",_certificateBody);
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
    console.log("CertificateElements", this.CertificateElements)
    this.dataSource = new MatTableDataSource<any>(this.CertificateElements);
    this.loading = false; this.PageLoading = false;
  }
  GetExamStudentSubjectResults() {

    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    this.ExamStudentSubjectResult = [];
    var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;
    var filterstr = 'Active eq 1 ';
    if (this.searchForm.get("searchExamId").value == 0) {
      this.contentservice.openSnackBar("Please select exam.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.searchForm.get("searchClassId").value == 0) {
      this.contentservice.openSnackBar("Please select class", globalconstants.ActionText, globalconstants.RedBackground);
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
    this.displayedColumns = [
      'Student',
    ];
    this.dataservice.get(list)
      .subscribe((examComponentResult: any) => {
        this.dataSource = new MatTableDataSource<IExamStudentSubjectResult>(this.ExamStudentSubjectResult);
        this.loading = false; this.PageLoading = false;
      })

  }
  GetMasterData() {
    debugger;
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
        this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
        this.BloodGroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
        this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.ExamStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMSTATUS);
        this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
        this.ExamNames = this.getDropDownData(globalconstants.MasterDefinitions.school.EXAMNAME);
        //this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP);
        this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
        this.CertificateTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.CERTIFICATETYPE);
        this.CommonStyles = this.getDropDownData(globalconstants.MasterDefinitions.school.COMMONSTYLE);

        this.CommonHeader = this.getDropDownData(globalconstants.MasterDefinitions.school.COMMONHEADER);
        this.CommonFooter = this.getDropDownData(globalconstants.MasterDefinitions.school.COMMONFOOTER);
        this.CommonHeader.sort((a, b) => a.Sequence - b.Sequence)
        this.CommonFooter.sort((a, b) => a.Sequence - b.Sequence)
        //this.shareddata.ChangeBatch(this.Batches);
        this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
        .subscribe((data:any)=>{
          this.ClassGroups =[...data.value];
        });
        this.Batches = this.tokenstorage.getBatches()
        this.GetStudentClasses();
        this.GetOrganization();
      });
  }
  clear() {

  }
  GetStudentClasses() {
    //debugger;
    var filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

    let list: List = new List();
    list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId"];
    list.PageName = "StudentClasses";
    list.filter = [filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClasses = [...data.value];
        this.GetStudents();
      })
  }
  GetStudents() {
    this.loading = true;
    var extrafilter = ''
    let list: List = new List();
    list.fields = [
      'StudentId',
      'FirstName',
      'LastName',
      'FatherName',
      'MotherName',
      'ContactNo',
      'FatherContactNo',
      'MotherContactNo'
    ];
    list.PageName = "Students";

    var standardfilter = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    list.filter = [standardfilter];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //this.Students = [...data.value];
        //  //console.log('data.value', data.value);
        this.Students = [];
        if (data.value.length > 0) {

          var _students = [...data.value];

          _students.map(student => {
            var _RollNo = '';
            var _name = '';
            var _className = '';
            var _section = '';
            var _studentClassId = 0;
            var studentclassobj = this.StudentClasses.filter(f => f.StudentId == student.StudentId);
            if (studentclassobj.length > 0) {
              _studentClassId = studentclassobj[0].StudentClassId;
              var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);

              if (_classNameobj.length > 0)
                _className = _classNameobj[0].ClassName;
              var _SectionObj = this.Sections.filter(f => f.MasterDataId == studentclassobj[0].SectionId)

              if (_SectionObj.length > 0)
                _section = _SectionObj[0].MasterDataName;
              _RollNo = studentclassobj[0].RollNo == null ? '' : studentclassobj[0].RollNo;

              student.ContactNo = student.ContactNo == null ? '' : student.ContactNo;
              var _lastname = student.LastName == null || student.LastName == '' ? '' : " " + student.LastName;
              _name = student.FirstName + _lastname;
              var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo + "-" + student.ContactNo;
              this.Students.push({
                StudentClassId: _studentClassId,
                StudentId: student.StudentId,
                Name: _fullDescription,
                FatherName: student.FatherName,
                MotherName: student.MotherName
              });
            }
          })
        }
        this.loading = false;
        this.PageLoading = false;
      })
  }
  GetCertificates() {
    debugger;
    var _studentClassId = this.searchForm.get("searchStudentName").value.StudentClassId;
    if (_studentClassId > 0) {
      this.StudentClassId = _studentClassId;
    }
    else {
      this.contentservice.openSnackBar("Please select student!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.searchForm.get("searchCertificateTypeId").value == 0) {
      this.contentservice.openSnackBar("Please select certificate type!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    this.GetStudentAttendance();
  }
  GetOrganization() {

    let list: List = new List();
    list.fields = [
      "OrganizationId",
      "OrganizationName",
      "LogoPath",
      "Address",
      "CityId",
      "StateId",
      "CountryId",
      "WebSite",
      "Contact",
      "RegistrationNo",
      "ValidFrom",
      "ValidTo"

    ];
    list.PageName = "Organizations";
    list.filter = ["OrganizationId eq " + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((org: any) => {
        this.Organization = org.value.map(m => {
          //m.CountryName = '';
          var countryObj = this.allMasterData.filter(f => f.MasterDataId == m.CountryId);
          if (countryObj.length > 0)
            m.Country = countryObj[0].MasterDataName;

          var stateObj = this.allMasterData.filter(f => f.MasterDataId == m.StateId);
          if (stateObj.length > 0)
            m.State = stateObj[0].MasterDataName;

          var cityObj = this.allMasterData.filter(f => f.MasterDataId == m.CityId);
          if (cityObj.length > 0)
            m.City = cityObj[0].MasterDataName;

          return [{
            name: "OrganizationId", val: m.OrganizationId
          }, {
            name: "Organization", val: m.OrganizationName
          }, {
            name: "LogoPath", val: m.LogoPath
          }, {
            name: "Address", val: m.Address
          }, {
            name: "City", val: m.City
          }, {
            name: "State", val: m.State
          }, {
            name: "Country", val: m.Country
          }, {
            name: "Contact", val: m.Contact
          }, {
            name: "RegistrationNo", val: m.RegistrationNo == null ? '' : m.RegistrationNo
          }, {
            name: "ValidFrom", val: m.ValidFrom
          }, {
            name: "ValidTo", val: m.ValidTo
          },
          {
            name: "WebSite", val: m.WebSite == null ? '' : m.WebSite
          },
          {
            name: "ToDay", val: moment(new Date()).format("DD/MM/YYYY")
          }
          ]
        })
        //console.log("this.Organization",this.Organization);
        //console.log("this.CommonHeader.",this.CommonHeader);

        this.CommonHeader.forEach(header => {
          this.Organization[0].forEach(orgdet => {
            header.Description = header.Description.replaceAll("[" + orgdet.name + "]", orgdet.val);
          })
        })
        this.CommonFooter.forEach(footer => {
          this.Organization[0].forEach(orgdet => {
            footer.Description = footer.Description.replaceAll("[" + orgdet.name + "]", orgdet.val);
          })
        })
        this.loading = false; this.PageLoading = false;
      });
  }
  GetStudentAttendance() {

    let list: List = new List();
    list.fields = [
      "AttendanceId",
      "StudentClassId",
      "AttendanceStatus"
    ];
    list.PageName = "Attendances";
    //list.lookupFields = ["StudentClass($select=RollNo,SectionId;$expand=Student($select=FirstName,LastName))"];
    list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and StudentClassId eq " + this.StudentClassId + " and BatchId eq " + this.SelectedBatchId];

    this.dataservice.get(list)
      .subscribe((attendance: any) => {
        this.StudentAttendanceList = [...attendance.value]
        var groupbyPresentAbsent = alasql("select sum(AttendanceStatus) Total from ? where AttendanceStatus = 1 group by AttendanceStatus",
          [this.StudentAttendanceList])
        if (groupbyPresentAbsent.length > 0)
          this.AttendanceStatusSum = groupbyPresentAbsent[0].Total

        this.getPaymentStatus();
      });
  }
  getPaymentStatus() {

    let list: List = new List();
    list.fields = [
      "LedgerId",
      "Month"
    ];
    list.PageName = "AccountingLedgerTrialBalances";
    list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and StudentClassId eq " + this.StudentClassId + " and BatchId eq " + this.SelectedBatchId];
    list.limitTo = 1;
    list.orderBy = "Month Desc";
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.FeePaidLastMonth = data.value[0].Month;
        }
        this.GetStudentAndGenerateCerts();
      });
  }
  GetExams() {

    this.contentservice.GetExams(this.LoginUserDetail[0]["orgId"], this.SelectedBatchId)
      .subscribe((data: any) => {
        this.Exams = [];
        data.value.map(e => {
          var obj = this.ExamNames.filter(n => n.MasterDataId == e.ExamNameId);
          if (obj.length > 0)
            this.Exams.push({
              ExamId: e.ExamId,
              ExamName: obj[0].MasterDataName,
              ClassGroupId: e.ClassGroupId
            })
        })
      })
  }
  UpdateStudentCertificates() {
    //console.log("hi")
  }
  getDropDownData(dropdowntype) {
  return this.contentservice.getDropDownData(dropdowntype,this.tokenstorage,this.allMasterData);
    //   let Id = 0;
  //   let Ids = this.allMasterData.filter((item, indx) => {
  //     return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
  //   })
  //   if (Ids.length > 0) {
  //     Id = Ids[0].MasterDataId;
  //     return this.allMasterData.filter((item, index) => {
  //       return item.ParentId == Id
  //     })
  //   }
  //   else
  //     return [];

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

