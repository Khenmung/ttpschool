import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { List } from '../../../shared/interface';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ContentService } from 'src/app/shared/content.service';
import { DatePipe } from '@angular/common';
import { employee } from './employee';

@Component({
  selector: 'app-excel-data-management',
  templateUrl: './excel-data-management.component.html',
  styleUrls: ['./excel-data-management.component.scss']
})
export class ExcelDataManagementComponent implements OnInit {
  constructor(
    private datepipe: DatePipe,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private fb: FormBuilder,
    private alert: AlertService,
    private shareddata: SharedataService,
    private tokenservice: TokenStorageService,
    private employee: employee) {

  }
  UploadType = {
    CLASSROLLNOMAPPING: 'rollno class mapping',
    STUDENTDATA: 'student upload',
    STUDENTACTIVITY: 'student activity',
    EMPLOYEEDETAIL: 'employee detail'
  }
  SelectedApplicationId = 0;
  filterOrgIdNBatchId = '';
  filterOrgId = '';

  loading = false;
  SelectedBatchId = 0;
  loginDetail = [];
  ngOnInit() {
    //this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
    //this.GetMasterData();
    this.loading = true;
    this.loginDetail = this.tokenservice.getUserDetail();
    this.shareddata.CurrentGenders.subscribe(c => (this.Genders = c));
    this.shareddata.CurrentBloodgroup.subscribe(c => (this.Bloodgroup = c));
    this.shareddata.CurrentCategory.subscribe(c => (this.Category = c));
    this.shareddata.CurrentReligion.subscribe(c => (this.Religion = c));
    this.shareddata.CurrentStates.subscribe(c => (this.States = c));
    this.shareddata.CurrentPrimaryContact.subscribe(c => (this.PrimaryContact = c));
    this.shareddata.CurrentLocation.subscribe(c => (this.Location = c));

    this.contentservice.GetClasses(this.loginDetail[0]["orgId"]).subscribe((data: any) => {
      this.Classes = [...data.value];

    });

    this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.shareddata.CurrentSection.subscribe(c => (this.Sections = c));
    this.shareddata.CurrentUploadType.subscribe(c => (this.UploadTypes = c));
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenservice.getSelectedBatchId();
    this.shareddata.CurrentFeeType.subscribe(b => this.FeeTypes = b);

    this.uploadForm = this.fb.group({
      //BatchId:[this.SelectedBatchId],
      UploadTypeId: [0, [Validators.required]]
    })
    this.filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenservice);
    this.filterOrgId = globalconstants.getStandardFilter(this.loginDetail);
    this.PageLoad();
  }
  PageLoad() {
    this.SelectedApplicationId = +this.tokenservice.getSelectedAPPId();
    if (this.UploadTypes.length == 0)
      this.GetMasterData();
    else
      this.GetStudents();
  }
  NotMandatory = ["StudentId", "BankAccountNo", "IFSCCode", "MICRNo", "ContactNo",
    "MotherContactNo", "AlternateContact", "EmailAddress",
    "TransferFromSchool", "TransferFromSchoolBoard", "Remarks"];
  NoNeedToCheckBlank = ["StudentId", "BankAccountNo", "IFSCCode", "MICRNo", "ContactNo",
    "MotherContactNo", "AlternateContact", "EmailAddress",
    "TransferFromSchool", "TransferFromSchoolBoard",
    "Gender", "Religion", "Category", "Bloodgroup",
    "PrimaryContactFatherOrMother", "ClassAdmissionSought", "Remarks"];
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  ErrorMessage = '';
  StudentList = [];
  StudentClassList = [];
  displayedColumns: any[];
  ELEMENT_DATA = [];
  dataSource: MatTableDataSource<any>;
  uploadForm: FormGroup;
  AllMasterData: any[];
  UploadTypes: any[];
  storeData: any;
  csvData: any;
  jsonData: any;
  textData: any;
  htmlData: any;
  fileUploaded: File;
  worksheet: any;
  selectedFile: string;
  Classes = [];
  Batches = [];
  Sections = [];
  FeeTypes = [];
  Genders = [];
  Category = [];
  Bloodgroup = [];
  Religion = [];
  States = [];
  PrimaryContact = [];
  Location = [];
  ActivityCategory = [];
  ActivitySubCategory = [];
  PrimaryContactFatherOrMother = [];
  studentData: any[];
  SelectedUploadtype = '';
  onselectchange(event) {
    ////debugger;
    //    //console.log('event', event);
    this.SelectedUploadtype = this.UploadTypes.filter(item => {
      return item.MasterDataId == event.value
    })[0].MasterDataName

    if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.CLASSROLLNOMAPPING))
      this.displayedColumns = ["StudentId", "Class", "Section", "RollNo"];
    else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTDATA))
      this.displayedColumns = [
        "StudentId",
        "FirstName",
        "LastName",
        "FatherName",
        "MotherName",
        "Gender",
        "PermanentAddress",
        "PresentAddress",
        "WhatsAppNumber",
        "PermanentAddressCityId",
        "PermanentAddressPincode",
        "PermanentAddressStateId",
        "PermanentAddressCountryId",
        "PresentAddressCityId",
        "PresentAddressStateId",
        "PresentAddressCountryId",
        "DOB",
        "Bloodgroup",
        "Category",
        "BankAccountNo",
        "IFSCCode",
        "MICRNo",
        "AadharNo",
        "Photo",
        "Religion",
        "ContactNo",
        "AlternateContact",
        "EmailAddress",
        "ClassAdmissionSought",
        "LastSchoolPercentage",
        "TransferFromSchool",
        "TransferFromSchoolBoard",
        "Remarks",
        "FatherOccupation",
        "FatherContactNo",
        "MotherContactNo",
        "MotherOccupation",
        "PrimaryContactFatherOrMother",
        "NameOfContactPerson",
        "RelationWithContactPerson",
        "ContactPersonContactNo",
        "Active",
        "StudentDeclaration",
        "ParentDeclaration",
        "LocationId",
        "ReasonForLeavingId",
        "OrgId",
        "CreatedDate",
        "CreatedBy",
        "UpdatedDate",
        "UpdatedBy",
        "BatchId"
      ];
    //  this.readExcel();
    //    this.uploadedFile(event);
  }
  browseOnChange(event) {
    this.fileUploaded = event.target.files[0];
    this.selectedFile = this.fileUploaded.name;
    this.readExcel();
  }
  readExcel() {
    debugger;

    let readFile = new FileReader();
    this.ErrorMessage = '';
    readFile.onload = (e) => {
      this.storeData = readFile.result;
      var data = new Uint8Array(this.storeData);
      ////console.log('data',data)
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      this.worksheet = workbook.Sheets[first_sheet_name];
      this.jsonData = XLSX.utils.sheet_to_json(this.worksheet, { raw: false });
      if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.CLASSROLLNOMAPPING))
        this.ValidateStudentClassData();
      else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTDATA)) {
        this.ValidateStudentData();
      }
      else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTACTIVITY)) {
        this.ValidateStudentActivity();
      }
      else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.EMPLOYEEDETAIL)) {
        this.ValidateEmployeeData();
      }
    }
    readFile.readAsArrayBuffer(this.fileUploaded);

  }

  ValidateEmployeeData() {
    debugger;
    this.ErrorMessage = '';
    this.jsonData.map((element, indx) => {
      if (element.FirstName.length == 0)
        this.ErrorMessage += 'First name at row ' + indx + ' is required.\n';
      if (element.FatherName.length == 0)
        this.ErrorMessage += 'Father name at row ' + indx + ' is required.\n';
      if (element.GenderId == 0)
        this.ErrorMessage += 'GenderId at row ' + indx + ' is required.\n';
      if (element.BloodgroupId != '' && isNaN(element.BloodgroupId))
        this.ErrorMessage += 'BloodgroupId at row ' + indx + ' must be numeric.\n';
      if (element.CategoryId != '' && isNaN(element.CategoryId))
        this.ErrorMessage += 'CategoryId at row ' + indx + ' must be numeric.\n';
      if (element.EmploymentStatusId != '' && isNaN(element.EmploymentStatusId))
        this.ErrorMessage += 'EmploymentStatusId at row ' + indx + ' must be numeric.\n';
      if (element.ReligionId != '' && isNaN(element.ReligionId))
        this.ErrorMessage += 'ReligionId at row ' + indx + ' must be numeric.\n';
      if (element.EmploymentTypeId != '' && isNaN(element.EmploymentTypeId))
        this.ErrorMessage += 'EmploymentTypeId at row ' + indx + ' must be numeric.\n';
      if (element.NoticePeriodDays != '' && isNaN(element.NoticePeriodDays))
        this.ErrorMessage += 'NoticePeriodDays at row ' + indx + ' must be numeric.\n';
      if (element.ProbationPeriodDays != '' && isNaN(element.ProbationPeriodDays))
        this.ErrorMessage += 'ProbationPeriodDays at row ' + indx + ' must be numeric.\n';
      if (element.MaritalStatusId != '' && isNaN(element.MaritalStatusId))
        this.ErrorMessage += 'MaritalStatusId at row ' + indx + ' must be numeric.\n';
      if (element.NatureId != '' && isNaN(element.NatureId))
        this.ErrorMessage += 'NatureId at row ' + indx + ' must be numeric.\n';

      if (element.PermanentAddressStateId != '' && isNaN(element.PermanentAddressStateId))
        this.ErrorMessage += 'PermanentAddressStateId at row ' + indx + ' must be numeric.\n';
      if (element.PermanentAddressCountryId != '' && isNaN(element.PermanentAddressCountryId))
        this.ErrorMessage += 'PermanentAddressCountryId at row ' + indx + ' must be numeric.\n';
      if (element.DepartmentId != '' && isNaN(element.DepartmentId))
        this.ErrorMessage += 'DepartmentId at row ' + indx + ' must be numeric.\n';
      if (element.DesignationId != '' && isNaN(element.DesignationId))
        this.ErrorMessage += 'DesignationId at row ' + indx + ' must be numeric.\n';
      if (element.EmpGradeId != '' && isNaN(element.EmpGradeId))
        this.ErrorMessage += 'EmpGradeId at row ' + indx + ' must be numeric.\n';

      if (element.DOB != '' && isNaN(Date.parse(element.DOB)))
        this.ErrorMessage += 'Invalid DOB at row ' + indx;
      if (element.DOJ != '' && isNaN(Date.parse(element.DOJ)))
        this.ErrorMessage += 'Invalid DOJ at row ' + indx;
      if (element.ConfirmationDate != '' && isNaN(Date.parse(element.ConfirmationDate)))
        this.ErrorMessage += 'Invalid ConfirmationDate at row ' + indx;
      if (element.MarriedDate != '' && isNaN(Date.parse(element.MarriedDate)))
        this.ErrorMessage += 'Invalid MarriedDate at row ' + indx;


      if (element.ShortName.length > 10)
        this.ErrorMessage += 'ShortName must be less than 11 characters at row ' + indx + '.\n';
      if (element.FirstName.length > 30)
        this.ErrorMessage += 'FirstName must be less than 31 characters at row ' + indx + '.\n';
      if (element.LastName.length > 30)
        this.ErrorMessage += 'LastName must be less than 31 characters at row ' + indx + '.\n';

      if (element.MotherName.length > 30)
        this.ErrorMessage += 'MotherName must be less than 31 characters at row ' + indx + '.\n';
      if (element.FatherName.length > 30)
        this.ErrorMessage += 'FatherName must be less than 31 characters at row ' + indx + '.\n';
      if (element.MICRNo.length > 20)
        this.ErrorMessage += 'MICRNo must be less than 21 characters at row ' + indx + '.\n';

      if (element.BankAccountNo.length > 20)
        this.ErrorMessage += 'BankAccountNo must be less than 21 characters at row ' + indx + '.\n';
      if (element.IFSCcode.length > 15)
        this.ErrorMessage += 'IFSCcode must be less than 16 characters at row ' + indx + '.\n';
      if (element.MICRNo.length > 20)
        this.ErrorMessage += 'MICRNo must be less than 21 characters at row ' + indx + '.\n';

      if (element.AdhaarNo.length > 15)
        this.ErrorMessage += 'AdhaarNo must be less than 16 characters at row ' + indx + '.\n';
      if (element.PhotoPath.length > 50)
        this.ErrorMessage += 'PhotoPath must be less than 51 characters at row ' + indx + '.\n';
      if (element.ContactNo.length > 12)
        this.ErrorMessage += 'ContactNo must be less than 13 characters at row ' + indx + '.\n';
      if (element.WhatsappNo.length > 12)
        this.ErrorMessage += 'WhatsappNo must be less than 13 characters at row ' + indx + '.\n';
      if (element.AlternateContactNo.length > 12)
        this.ErrorMessage += 'AlternateContactNo should be less than 13 characters at row ' + indx + '.\n';


      if (element.EmailAddress.length > 30)
        this.ErrorMessage += 'EmailAddress must be less than 31 characters at row ' + indx + '.\n';
      if (element.EmergencyContactNo.length > 12)
        this.ErrorMessage += 'EmergencyContactNo must be less than 13 characters at row ' + indx + '.\n';
      if (element.PassportNo.length > 12)
        this.ErrorMessage += 'PassportNo must be less than 13 characters at row ' + indx + '.\n';
      if (element.PAN.length > 12)
        this.ErrorMessage += 'PAN must be less 13 characters than 12 at row ' + indx + '.\n';
      if (element.PFAccountNo.length > 20)
        this.ErrorMessage += 'PFAccountNo must be less 21 characters at row ' + indx + '.\n';
      if (element["Remarks"] == undefined) {
        element["Remarks"] = '';
      }
      if (element["Remarks"] != undefined && element.Remarks.length > 20)
        this.ErrorMessage += 'Remarks must be less 21 characters at row ' + indx + '.\n';
      if (element.PresentAddress.length > 256)
        this.ErrorMessage += 'PresentAddress must be less 257 characters at row ' + indx + '.\n';

      if (element.PresentAddressPincode.length > 10)
        this.ErrorMessage += 'PresentAddressPincode must be less 11 characters at row ' + indx + '.\n';
      if (element.PermanentAddressPincode.length > 10)
        this.ErrorMessage += 'PermanentAddressPincode must be less 11 characters at row ' + indx + '.\n';

      element.OrgId = this.loginDetail[0]["orgId"];
      if (this.ErrorMessage.length == 0)
        this.ELEMENT_DATA.push(element);
    });
  }
  ValidateStudentActivity() {
    debugger;
    let slno: any = 0;
    this.ErrorMessage = '';
    this.jsonData.map((element, indx) => {
      slno = parseInt(indx) + 1;

      let CategoryIdFilter = this.ActivityCategory.filter(g => g.MasterDataId == element.CategoryId);
      if (CategoryIdFilter.length == 0)
        this.ErrorMessage += "Invalid CategoryId at row " + slno + ":" + element.CategoryId + "<br>";
      let SubCategoryIdFilter = this.ActivitySubCategory.filter(g => g.MasterDataId == element.SubCategoryId);
      if (SubCategoryIdFilter.length == 0)
        this.ErrorMessage += "Invalid Sub Category Id at row " + slno + ":" + element.SubCategoryId + "<br>";
      let StudentClsFilter = this.StudentClassList.filter(g => g.StudentClassId == element.StudentClassId);
      if (StudentClsFilter.length == 0)
        this.ErrorMessage += "Invalid StudentClassId at row " + slno + ":" + element.StudentClassId + "<br>";
      //if (this.ErrorMessage.length == 0) {
      element.OrgId = this.loginDetail[0]["orgId"];
      element.BatchId = this.SelectedBatchId;
      this.ELEMENT_DATA.push(element);
      //}
    })
  }
  ValidateStudentClassData() {
    debugger;
    let slno: any = 0;
    this.ErrorMessage = '';
    this.jsonData.forEach((element, indx) => {
      slno = parseInt(indx) + 1;

      let studentFilter = this.StudentList.filter(g => g.StudentId == element.StudentId);
      if (studentFilter.length == 0)
        this.ErrorMessage += "Invalid StudentId at row " + slno + ":" + element.StudentId + "<br>";
      let sectionFilter = this.Sections.filter(g => g.MasterDataName.toUpperCase() == element.Section.trim().toUpperCase());
      if (sectionFilter.length == 0)
        this.ErrorMessage += "Invalid section at row " + slno + ":" + element.Section + "<br>";
      else {
        element.Section = sectionFilter[0].MasterDataId;
      }
      let classFilter = this.Classes.filter(g => g.MasterDataName == element.Class);
      if (classFilter.length == 0)
        this.ErrorMessage += "Invalid Class at row " + slno + ":" + element.Class + "<br>";
      else {
        element.ClassId = classFilter[0].MasterDataId;
        var _studentclass = this.StudentClassList.filter(f => f.ClassId == classFilter[0].MasterDataId && f.StudentId == element.StudentId);
        if (_studentclass.length > 0)
          element.StudentClassId = _studentclass[0].StudentClassId
        else
          element.StudentClassId = 0;
      }
      var _regularFeeTypeIds = this.FeeTypes.filter(f => f.MasterDataName.toLowerCase() == 'regular');
      var _regularFeeTypeId = 0;
      if (_regularFeeTypeIds.length > 0)
        _regularFeeTypeId = _regularFeeTypeIds[0].MasterDataId;

      //if (this.ErrorMessage.length == 0) {
      this.ELEMENT_DATA.push({
        StudentId: +element.StudentId,
        ClassId: element.ClassId,
        Section: element.Section,
        RollNo: element.RollNo,
        StudentClassId: element.StudentClassId,
        FeeTypeId: _regularFeeTypeId,
        BatchId: this.SelectedBatchId,
        OrgId: this.loginDetail[0]["orgId"]
      });
      //}
    });
    ////console.log('this.ELEMENT_DATA', this.ELEMENT_DATA);
  }
  ValidateStudentData() {
    let slno: any = 0;
    debugger;
    this.ErrorMessage = '';
    this.jsonData.forEach((element, indx) => {
      slno = parseInt(indx) + 1;
      //let checkProperty = [];
      this.displayedColumns.forEach(d => {

        if (d == "DOB" || d == "CreatedDate" || d == "UpdatedDate") {
          if (element[d] != undefined)
            element[d] = new Date(element[d]);
          else
            element[d] = new Date();
        }

        if ((element.StudentId == '' || element.StudentId == 0) && element[d] == undefined && this.NoNeedToCheckBlank.filter(b => b == d).length == 0)
          this.ErrorMessage += d + " is required at row " + slno + ".<br>";
      })

      if (element.StudentId == undefined || element.StudentId == '' || element.StudentId == 0) {
        let GenderFilter = this.Genders.filter(g => g.MasterDataId == element.Gender);
        if (GenderFilter.length == 0)
          this.ErrorMessage += "Invalid Gender at row " + slno + ":" + element.Gender + "<br>";

        let BloodgroupFilter = this.Bloodgroup.filter(g => g.MasterDataId == element.Bloodgroup);
        if (BloodgroupFilter.length == 0)
          this.ErrorMessage += "Invalid Bloodgroup at row " + slno + ":" + element.Bloodgroup + "<br>";

        let Categoryfilter = this.Category.filter(g => g.MasterDataId == element.Category);
        if (Categoryfilter.length == 0)
          this.ErrorMessage += "Invalid Category at row " + slno + ":" + element.Category + "<br>";

        let ReligionFilter = this.Religion.filter(g => g.MasterDataId == element.Religion);
        if (ReligionFilter.length == 0)
          this.ErrorMessage += "Invalid Religion at row " + slno + ":" + element.Religion + "<br>";

        let PrimaryContactFatherOrMotherFilter = this.PrimaryContact.filter(g => g.MasterDataId == element.PrimaryContactFatherOrMother);
        if (PrimaryContactFatherOrMotherFilter.length == 0)
          this.ErrorMessage += "Invalid PrimaryContactFatherOrMother at row " + slno + ":" + element.PrimaryContactFatherOrMother + "<br>";

        let ClassAdmissionSoughtFilter = this.Classes.filter(g => g.ClassId == element.ClassAdmissionSought);
        if (ClassAdmissionSoughtFilter.length == 0)
          this.ErrorMessage += "Invalid ClassAdmissionSought at row " + slno + ":" + element.ClassAdmissionSought + "<br>";
      }
      else
        element.StudentId = +element.StudentId;

      element.OrgId = this.loginDetail[0]["orgId"];
      element.BatchId = this.SelectedBatchId;

      this.ELEMENT_DATA.push(element);

    });
    ////console.log('this.ELEMENT_DATA', this.ELEMENT_DATA);
  }
  readAsCSV() {
    this.csvData = XLSX.utils.sheet_to_csv(this.worksheet);
    const data: Blob = new Blob([this.csvData], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "CSVFile" + new Date().getTime() + '.csv');
  }
  readAsJson() {
    try {
      debugger;
      let datalength = this.ELEMENT_DATA.length;
      if (this.ErrorMessage.length == 0) {

        if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.CLASSROLLNOMAPPING)) {
          this.ELEMENT_DATA.forEach((element, indx) => {
            this.studentData = [];
            element["Active"] = 1;
            if (element.StudentClassId > 0) {
              element.UpdatedDate = new Date();
              element.UpdatedBy = this.loginDetail[0]["userId"];
              element.Prmoted = 0;
              this.studentData.push({ element });
              this.updateStudentClass();
            }
            else {
              element.CreatedDate = new Date();
              element.CreatedBy = this.loginDetail[0]["userId"];
              element.Prmoted = 0;
              this.studentData.push({ element });
              this.saveStudentClass();
            }
          });
        }
        else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTDATA)) {
          this.save();
        }
        else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.EMPLOYEEDETAIL)) {
          this.employee.save(this.ELEMENT_DATA);
        }
      }
    }
    catch (ex) {
      //console.log("something went wrong: ", ex);
    }
  }
  readAsHTML() {
    this.htmlData = XLSX.utils.sheet_to_html(this.worksheet);
    const data: Blob = new Blob([this.htmlData], { type: "text/html;charset=utf-8;" });
    FileSaver.saveAs(data, "HtmlFile" + new Date().getTime() + '.html');
  }
  readAsText() {
    this.textData = XLSX.utils.sheet_to_txt(this.worksheet);
    const data: Blob = new Blob([this.textData], { type: 'text/plain;charset=utf-8;' });
    FileSaver.saveAs(data, "TextFile" + new Date().getTime() + '.txt');
  }

  save() {
    var toInsert = [];
    debugger;
    this.ELEMENT_DATA.forEach(row => {
      toInsert.push({
        "StudentId": row["StudentId"],
        "AadharNo": row["AadharNo"],
        "Active": +row["Active"],
        "AlternateContact": row["AlternateContact"],
        "BankAccountNo": row["BankAccountNo"],
        "Bloodgroup": +row["Bloodgroup"],
        "Category": +row["Category"],
        "ClassAdmissionSought": +row["ClassAdmissionSought"],
        "ContactNo": row["ContactNo"],
        "ContactPersonContactNo": row["ContactPersonContactNo"],
        "DOB": this.datepipe.transform(row["DOB"], 'yyyy/MM/dd'),
        "EmailAddress": row["EmailAddress"],
        "FatherContactNo": row["FatherContactNo"],
        "FatherName": row["FatherName"],
        "FatherOccupation": row["FatherOccupation"],
        "FirstName": row["FirstName"],
        "Gender": +row["Gender"],
        "IFSCCode": row["IFSCCode"],
        "LastName": row["LastName"],
        "LastSchoolPercentage": row["LastSchoolPercentage"],
        "LocationId": +row["LocationId"],
        "MICRNo": row["MICRNo"],
        "MotherContactNo": row["MotherContactNo"],
        "MotherName": row["MotherName"],
        "MotherOccupation": row["MotherOccupation"],
        "NameOfContactPerson": row["NameOfContactPerson"],
        "OrgId": +row["OrgId"],
        "ParentDeclaration": +row["ParentDeclaration"],
        "PermanentAddress": row["PermanentAddress"],
        "PermanentAddressCityId": +row["PermanentAddressCityId"],
        "PermanentAddressCountryId": +row["PermanentAddressCountryId"],
        "PermanentAddressPincode": row["PermanentAddressPincode"],
        "PermanentAddressStateId": +row["PermanentAddressStateId"],
        "Photo": row["Photo"],
        "PresentAddress": row["PresentAddress"],
        "PresentAddressCityId": +row["PresentAddressCityId"],
        "PresentAddressCountryId": +row["PresentAddressCountryId"],
        "PresentAddressStateId": +row["PresentAddressStateId"],
        "PrimaryContactFatherOrMother": +row["PrimaryContactFatherOrMother"],
        "ReasonForLeavingId": +row["ReasonForLeavingId"],
        "RelationWithContactPerson": row["RelationWithContactPerson"],
        "Religion": +row["Religion"],
        "StudentDeclaration": +row["StudentDeclaration"],
        "TransferFromSchool": row["TransferFromSchool"],
        "TransferFromSchoolBoard": row["TransferFromSchoolBoard"],
        "UpdatedBy": row["UpdatedBy"],
        "UpdatedDate": this.datepipe.transform(row["UpdatedDate"], 'yyyy/MM/dd'),
        "CreatedBy": row["CreatedBy"],
        "CreatedDate": this.datepipe.transform(row["CreatedDate"], 'yyyy/MM/dd'),
        "WhatsAppNumber": row["WhatsAppNumber"],
        "BatchId": +row["BatchId"]

      });
    });
    ////console.log("toInsert", toInsert)
    this.dataservice.postPatch('Students', toInsert, 0, 'post')
      .subscribe((result: any) => {
        this.loading = false;
        this.alert.error("Data uploaded successfully.", this.options.autoClose);
      }, error => console.log(error))
  }
  updateStudentClass() {
    this.dataservice.postPatch('StudentClasses', this.studentData[0].element, this.studentData[0].element.StudentClassId, 'patch')
      .subscribe((result: any) => {
      }, error => console.log(error))
  }
  saveStudentClass() {
    //console.log('data to save', this.studentData[0].element)
    this.dataservice.postPatch('StudentClasses', this.studentData[0].element, 0, 'post')
      .subscribe((result: any) => {
        //console.log('inserted');
      }, error => console.log(error))
  }
  GetStudentClasses() {
    this.filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenservice);

    let list: List = new List();
    list.fields = ["StudentId", "StudentClassId", "ClassId"];
    list.PageName = "StudentClasses";
    list.filter = ["Active eq 1 and " + this.filterOrgIdNBatchId];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClassList = [...data.value];
        this.loading = false;
      })
  }
  GetStudents() {

    let list: List = new List();
    list.fields = ["StudentId", "FirstName", "LastName", "Active"];
    list.PageName = "Students";
    list.filter = ["Active eq 1 and " + this.filterOrgId];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentList = [...data.value];
        this.GetStudentClasses();

      })
  }
  GetMasterData() {
    this.contentservice.GetCommonMasterData(this.loginDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        ////console.log(data.value);
        debugger;
        var _gender = '';
        var SelectedApplicationName = '';
        var PermittedApplications = this.tokenservice.getPermittedApplications();
        var apps = PermittedApplications.filter(f => f.applicationId == this.SelectedApplicationId)
        if (apps.length > 0) {
          SelectedApplicationName = apps[0].appShortName;
        }


        this.AllMasterData = [...data.value];
        this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.UPLOADTYPE);

        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
        this.States = this.getDropDownData(globalconstants.MasterDefinitions.common.STATE);
        if (SelectedApplicationName == 'edu') {
          this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
          this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
          this.Location = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
          this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
          this.ActivityCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.ACTIVITYCATEGORY);
          this.ActivitySubCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.ACTIVITYSUBCATEGORY);
        }
        else if (SelectedApplicationName == 'employee') {
          this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.employee.GENDER);
          this.ActivityCategory = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEACTIVITYCATEGORY);
          this.ActivitySubCategory = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEACTIVITYSUBCATEGORY);
        }
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.SelectedBatchId = +this.tokenservice.getSelectedBatchId();
        this.GetStudents();
      });

  }

  getDropDownData(dropdowntype) {
    let Id = this.AllMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    })[0].MasterDataId;
    return this.AllMasterData.filter((item, index) => {
      return item.ParentId == Id
    });
  }
}
