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
import { SwUpdate } from '@angular/service-worker';

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
  constructor(private servicework: SwUpdate,
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
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    //this.loadTheme();
    //debugger;
    this.searchForm = this.fb.group({
      searchActivityId: [0],
      searchCategoryId: [0],
      searchSubCategoryId: [0],
      searchStudentName: [''],
      searchSessionId: [0],
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

      if (this.Permission != 'deny') {
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.GetMasterData();

      }
      else {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
    }
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
        var _activityName = '', _activityCategory = '', _activitySubCategory = '', _activitySession = '', _secured = '';
        if (this.SportsResultList.length > 0) {
          _activityName = this.SportsResultList[0].ActivityName;
          _activityCategory = this.SportsResultList[0].Category;
          _activitySubCategory = this.SportsResultList[0].SubCategory;
          _activitySession = this.SportsResultList[0].Session;
          _secured = this.SportsResultList[0].Secured;
        }

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
            { name: "House", val: _house },
            { name: "ActivityName", val: _activityName },
            { name: "ActivityCategory", val: _activityCategory },
            { name: "ActivitySubCategory", val: _activitySubCategory },
            { name: "ActivitySession", val: _activitySession },
            { name: "Secured", val: _secured }
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
  DisplayColumn = [];
  GeneratedCertificatelist = [];
  GetGeneratedCertificate() {
    var filterstr = 'Active eq true and OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _studentId = this.searchForm.get("searchStudentName").value.StudentId;
    if (_studentId == undefined) {
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    filterstr += " and StudentId eq " + _studentId;

    if (this.SportsCertificate)
      this.DisplayColumn = ["CertificateType", "ActivityName", "Category", "SubCategory", "Session"];
    else
      this.DisplayColumn = ["CertificateType"];


    let list: List = new List();
    list.fields = [
      'GeneratedCertificateId',
      'StudentId',
      'StudentClassId',
      'ActivityId',
      'CategoryId',
      'SubCategoryId',
      'SessionId',
      'CertificateTypeId',
      'IssuedDate'
    ];
    list.PageName = "GeneratedCertificates";
    list.filter = [filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.GeneratedCertificatelist = [];

        data.value.forEach(d => {
          var _certificateTypeObj = this.CertificateTypes.filter(a => a.MasterDataId == d.CertificateTypeId);
          if (_certificateTypeObj.length > 0)
            d.CertificateType = _certificateTypeObj[0].MasterDataName;

          var _activityNameObj = this.ActivityNames.filter(a => a.MasterDataId == d.ActivityId);
          if (_activityNameObj.length > 0)
            d.ActivityName = _activityNameObj[0].MasterDataName;

          var _categoryObj = this.ActivityCategory.filter(a => a.MasterDataId == d.CategoryId);
          if (_categoryObj.length > 0)
            d.Category = _categoryObj[0].MasterDataName;

          var _subCategoryObj = this.allMasterData.filter(a => a.MasterDataId == d.SubCategoryId);
          if (_subCategoryObj.length > 0)
            d.SubCategory = _subCategoryObj[0].MasterDataName;

          var _sessionObj = this.ActivitySessions.filter(a => a.MasterDataId == d.SessionId);
          if (_sessionObj.length > 0)
            d.Session = _sessionObj[0].MasterDataName;
          this.GeneratedCertificatelist.push(d);
        })
        if (this.GeneratedCertificatelist.length == 0) {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<any>(this.GeneratedCertificatelist);
        this.loading = false;
        this.PageLoading = false;
      })

  }
  View(row){

  }
  Save() {

    debugger;


    var _studentObj = this.searchForm.get("searchStudentName").value
    var _studentclassId = _studentObj.StudentClassId;
    var _studentId = _studentObj.StudentId;

    var _certificateTypeId = this.searchForm.get("searchCertificateTypeId").value;
    var _SportsNameId = this.searchForm.get("searchActivityId").value;
    var _categoryId = this.searchForm.get("searchCategoryId").value;
    var _subCategoryId = this.searchForm.get("searchSubCategoryId").value;
    var _SessionId = this.searchForm.get("searchSessionId").value;

    if (this.searchForm.get("searchStudentName").value == '') {
      this.loading = false;
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    this.loading = true;
    if (this.SportsCertificate) {
      if (_SportsNameId == 0) {
        this.contentservice.openSnackBar("Please select activity.", globalconstants.ActionText, globalconstants.RedBackground);
        return;
      }
    }

    if (_certificateTypeId == 0) {
      this.contentservice.openSnackBar("Please select certificate type.", globalconstants.ActionText, globalconstants.RedBackground);
    }
    let checkFilterString = "Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"];
    checkFilterString += " and CertificateTypeId eq " + _certificateTypeId;
    checkFilterString += " and StudentId eq " + _studentId + " and StudentClassId eq " + _studentclassId;

    let list: List = new List();
    list.fields = ["StudentClassId"];
    list.PageName = "GeneratedCertificates";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          var insertCertificate;
          insertCertificate.Active = 1;
          insertCertificate.StudentId = _studentId;
          insertCertificate.StudentClassId = _studentclassId;
          insertCertificate.CategoryId = _categoryId;
          insertCertificate.SubCategoryId = _subCategoryId;
          insertCertificate.CertificateTypeId = _certificateTypeId;
          insertCertificate.ActivityId = _SportsNameId;
          insertCertificate.SessionId = _SessionId;
          insertCertificate.OrgId = this.LoginUserDetail[0]["orgId"];

          insertCertificate["CreatedDate"] = new Date();
          insertCertificate["CreatedBy"] = this.LoginUserDetail[0]["userId"];
          insertCertificate["UpdatedDate"] = new Date();
          this.insert(insertCertificate);
        }
      });
  }
  insert(data) {

    //debugger;
    this.dataservice.postPatch("GenerateCertificates", data, 0, 'post')
      .subscribe(
        (data: any) => {
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  print() {
    var printContents = document.getElementById('printSection').innerHTML;
     var originalContents = document.body.innerHTML;

     document.body.innerHTML = printContents;

     window.print();

     document.body.innerHTML = originalContents;

  }

  CheckType() {
    debugger;
    var _certificateId = this.searchForm.get("searchCertificateTypeId").value;
    var obj = this.CertificateTypes.filter(f => f.MasterDataId == _certificateId);
    if (obj.length > 0 && obj[0].MasterDataName.toLowerCase() == 'sports certificate') {
      this.SportsCertificate = true;
    }
    else
      this.SportsCertificate = false;
  }
  SetCategory() {
    var _activityId = this.searchForm.get("searchActivityId").value;
    this.ActivityCategory = this.allMasterData.filter(f => f.ParentId == _activityId);
  }
  SetSubCategory() {
    var _categoryId = this.searchForm.get("searchCategoryId").value;
    this.ActivitySubCategory = this.allMasterData.filter(f => f.ParentId == _categoryId);
  }
  SportsCertificate = false;
  ActivitySubCategory = [];
  ActivityCategory = [];
  ActivityNames = [];
  ActivitySessions = [];
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
        this.ActivityNames = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYNAME);
        this.ActivitySessions = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYSESSION);
        this.ActivityCategory = this.getDropDownData(globalconstants.MasterDefinitions.common.ACTIVITYCATEGORY);

        //this.shareddata.ChangeBatch(this.Batches);
        this.contentservice.GetClassGroups(this.LoginUserDetail[0]["orgId"])
          .subscribe((data: any) => {
            this.ClassGroups = [...data.value];
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
  SportsResultList = [];
  GetSportsResult() {
    debugger;
    var filterStr = "Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"];


    var _studentclassId = this.searchForm.get("searchStudentName").value.StudentClassId;
    var _SportsNameId = this.searchForm.get("searchActivityId").value;
    var _categoryId = this.searchForm.get("searchCategoryId").value;
    var _subCategoryId = this.searchForm.get("searchSubCategoryId").value;
    var _SessionId = this.searchForm.get("searchSessionId").value;
    if (_studentclassId != undefined) {
      filterStr += " and StudentClassId eq " + _studentclassId;
    }
    else {
      this.contentservice.openSnackBar("Please select student.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_SportsNameId > 0) {
      filterStr += " and SportsNameId eq " + _SportsNameId;
    }
    if (_SessionId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select session.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      filterStr += " and SessionId eq " + _SessionId;
    }

    if (_categoryId > 0) {
      filterStr += " and CategoryId eq " + _categoryId;
    }
    if (_subCategoryId > 0) {
      filterStr += " and SubCategoryId eq " + _subCategoryId;
    }

    this.loading = true;
    this.SportsResultList = [];

    let list: List = new List();
    list.fields = [
      "SportResultId",
      "StudentClassId",
      "Secured",
      "Achievement",
      "SportsNameId",
      "CategoryId",
      "SubCategoryId",
      "AchievementDate",
      "SessionId",
      "Active"
    ];

    list.PageName = "SportResults";
    list.filter = [filterStr];
    this.SportsResultList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SportsResultList = data.value.map(m => {
          var obj = this.ActivityNames.filter(f => f.MasterDataId == m.SportsNameId);
          if (obj.length > 0)
            m.SportsName = obj[0].MasterDataName;
          else
            m.SportsName = '';
          var objCategory = this.allMasterData.filter(f => f.MasterDataId == m.CategoryId);
          if (objCategory.length > 0)
            m.Category = objCategory[0].MasterDataName;
          else
            m.Category = '';

          var objSubCategory = this.allMasterData.filter(f => f.MasterDataId == m.SubCategoryId);
          if (objSubCategory.length > 0) {
            m.SubCategory = objSubCategory[0].MasterDataName;
          }
          else
            m.SubCategory = '';

          var objSession = this.allMasterData.filter(f => f.MasterDataId == m.SessionId);
          if (objSession.length > 0) {
            m.Session = objSession[0].MasterDataName;
          }
          else
            m.Session = '';

          m.Secured = globalconstants.decodeSpecialChars(m.Secured);
          m.Achievement = globalconstants.decodeSpecialChars(m.Achievement);
          m.Action = false;
          return m;
        });
        if (this.SportsResultList.length == 0) {
          this.loading = false;
          this.contentservice.openSnackBar("No activity record found for this student.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        else
          this.GetStudentAttendance();
      });

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
    if (this.SportsCertificate) {

      this.GetSportsResult()

    }
    else
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
    return this.contentservice.getDropDownData(dropdowntype, this.tokenstorage, this.allMasterData);
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

