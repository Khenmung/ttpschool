import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { List } from '../../../shared/interface';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ContentService } from 'src/app/shared/content.service';
import { DatePipe } from '@angular/common';
import { employee } from './employee';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentActivity } from './StudentActivity';

@Component({
  selector: 'app-excel-data-management',
  templateUrl: './excel-data-management.component.html',
  styleUrls: ['./excel-data-management.component.scss']
})
export class ExcelDataManagementComponent implements OnInit {
    PageLoading = true;
  constructor(
    private snackbar: MatSnackBar,
    private datepipe: DatePipe,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private fb: FormBuilder,
    private shareddata: SharedataService,
    private tokenservice: TokenStorageService,
    private employee: employee,
    private studentActivity: StudentActivity,
  ) {

  }

  UploadType = {
    CLASSROLLNOMAPPING: 'rollno class mapping',
    STUDENTDATA: 'student upload',
    STUDENTPROFILE: 'student profile',
    EMPLOYEEDETAIL: 'employee'
  }
  SelectedApplicationId = 0;
  filterOrgIdNBatchId = '';
  filterOrgId = '';
  ClassEvaluations = [];
  loading = false;
  SelectedBatchId = 0;
  loginDetail = [];
  Permission = '';
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
    this.Batches = this.tokenservice.getBatches();
    //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.shareddata.CurrentSection.subscribe(c => (this.Sections = c));
    this.shareddata.CurrentUploadType.subscribe(c => (this.UploadTypes = c));
    this.SelectedBatchId = +this.tokenservice.getSelectedBatchId();
    this.shareddata.CurrentFeeType.subscribe(b => this.FeeTypes = b);

    this.uploadForm = this.fb.group({
      UploadTypeId: [0, [Validators.required]]
    })
    this.filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenservice);
    this.filterOrgId = globalconstants.getStandardFilter(this.loginDetail);
    this.PageLoad();
  }
  PageLoad() {
    debugger;
    this.SelectedApplicationId = +this.tokenservice.getSelectedAPPId();
    var perObj = globalconstants.getPermission(this.tokenservice, globalconstants.Pages.edu.DATA.UPLOAD);
    if (perObj.length > 0)
      this.Permission = perObj[0].permission;
    if (this.Permission == 'deny') {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
    }
    else {
      //if (this.UploadTypes.length == 0)
      this.GetMasterData();
      //else
      this.GetStudents();
    }
  }
  NotMandatory = ["StudentId", "BankAccountNo", "IFSCCode", "MICRNo", "ContactNo",
    "MotherContactNo", "AlternateContact", "EmailAddress",
    "TransferFromSchool", "TransferFromSchoolBoard", "Remarks"];
  NoNeedToCheckBlank = ["StudentId", "BatchId", "BankAccountNo", "IFSCCode", "MICRNo", "ContactNo",
    "MotherContactNo", "AlternateContact", "EmailAddress",
    "TransferFromSchool", "TransferFromSchoolBoard",
    "Gender", "Religion", "Category", "Bloodgroup", "Club", "House",
    "PrimaryContactFatherOrMother", "Remarks"];

  ErrorMessage = '';
  StudentList = [];
  StudentClassList = [];
  displayedColumns: any[];
  ELEMENT_DATA = [];
  //dataSource: MatTableDataSource<any>;
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
  Houses = [];
  Clubs = [];
  Classes = [];
  Batches = [];
  Sections = [];
  FeeTypes = [];
  Genders = [];
  Category = [];
  Bloodgroup = [];
  Religion = [];
  EmployeeTypes = [];
  States = [];
  Country = [];
  AdmissionStatuses = [];
  PrimaryContact = [];
  Location = [];
  ActivityCategory = [];
  ActivitySubCategory = [];
  PrimaryContactFatherOrMother = [];
  EmployeeStatus = [];
  MaritalStatus = [];
  Departments = [];
  EmployeeGrades = [];
  Designations = [];
  WorkNatures = [];
  WorkAccounts = [];
  studentData: any[];
  SelectedUploadtype = '';

  onselectchange(event) {
    debugger;
    //    //console.log('event', event);
    this.SelectedUploadtype = this.UploadTypes.filter(item => item.MasterDataId == event.value)[0].MasterDataName

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
        "PermanentAddressCity",
        "PermanentAddressPincode",
        "PermanentAddressState",
        "PermanentAddressCountry",
        "PresentAddressCity",
        "PresentAddressState",
        "PresentAddressCountry",
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
        "Club",
        "House",
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
      //var _rowCount = this.storeData.length;
      // if (_rowCount > globalconstants.RowUploadLimit) {
      //   this.storeData.slice(globalconstants.RowUploadLimit);
      // }
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
      else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTPROFILE)) {
        this.ValidateStudentActivity();
      }
      else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.EMPLOYEEDETAIL)) {
        this.ValidateEmployeeData();
      }
      if (this.ErrorMessage.length == 0 && !this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTPROFILE)) {
        this.snackbar.open("Data is ready for upload. Please click on file upload button.", globalconstants.ActionText,
          globalconstants.BlueBackground);
      }
    }
    //this.dataSource = new MatTableDataSource<any>(this.jsonData);
    readFile.readAsArrayBuffer(this.fileUploaded);


  }

  ValidateEmployeeData() {
    debugger;
    this.ErrorMessage = '';
    this.jsonData.map((element, indx) => {

      element.Active = +element.Active;
      element.EmpEmployeeId = +element.EmpEmployeeId;
      element.NoticePeriodDays = +element.NoticePeriodDays;
      element.ProbationPeriodDays = +element.ProbationPeriodDays;

      if (element.FirstName == undefined || element.FirstName.length == 0)
        this.ErrorMessage += 'First name at row ' + indx + ' is required.\n';
      if (element.FatherName == undefined || element.FatherName.length == 0)
        this.ErrorMessage += 'Father name at row ' + indx + ' is required.\n';
      if (element.WorkAccount == '')
        this.ErrorMessage += 'Work Account at row ' + indx + ' is required.\n';
      else {
        var workaccountobj = this.WorkAccounts.filter(f => f.MasterDataName.toLowerCase() == element.WorkAccount.toLowerCase())
        if (workaccountobj.length > 0) {
          element.WorkAccountId = workaccountobj[0].MasterDataId;
        }
        else
          this.ErrorMessage += 'Invalid work account at row ' + indx + '.\n';
      }

      if (element.Gender == '')
        this.ErrorMessage += 'Gender at row ' + indx + ' is required.\n';
      else {
        var Genderobj = this.Genders.filter(f => f.MasterDataName.toLowerCase() == element.Gender.toLowerCase())
        if (Genderobj.length > 0) {
          element.GenderId = Genderobj[0].MasterDataId;
        }
        else
          this.ErrorMessage += 'Invalid gender at row ' + indx + '.\n';
      }
      if (element.Bloodgroup != '') {
        var bloodgroupobj = this.Bloodgroup.filter(f => f.MasterDataName.toLowerCase() == element.Bloodgroup.toLowerCase())
        if (bloodgroupobj.length == 0)
          this.ErrorMessage += 'Invalid blood group at row ' + indx + '.\n';
        else
          element.BloodgroupId = bloodgroupobj[0].MasterDataId;
      }
      if (element.Category != '') {
        var categoryobj = this.Category.filter(f => f.MasterDataName.toLowerCase() == element.Category.toLowerCase())
        if (categoryobj.length == 0)
          this.ErrorMessage += 'Invalid category at row ' + indx + '.\n';
        else
          element.CategoryId = categoryobj[0].MasterDataId;
      }
      if (element.EmploymentStatus != '') {
        var EmploymentStatusIdobj = this.EmployeeStatus.filter(f => f.MasterDataName.toLowerCase() == element.EmploymentStatus.toLowerCase())
        if (EmploymentStatusIdobj.length == 0)
          this.ErrorMessage += 'Invalid employee status at row ' + indx + '.\n';
        else
          element.EmploymentStatusId = EmploymentStatusIdobj[0].MasterDataId;
      }
      if (element.Religion != '') {
        var ReligionIdobj = this.Religion.filter(f => f.MasterDataName.toLowerCase() == element.Religion.toLowerCase())
        if (ReligionIdobj.length == 0)
          this.ErrorMessage += 'Invalid religion at row ' + indx + '.\n';
        else
          element.ReligionId = ReligionIdobj[0].MasterDataId;
      }
      if (element.EmploymentType != '') {
        var EmploymentTypeIdobj = this.EmployeeTypes.filter(f => f.MasterDataName.toLowerCase() == element.EmploymentType.toLowerCase())
        if (EmploymentTypeIdobj.length == 0)
          this.ErrorMessage += 'Invalid employment type at row ' + indx + '.\n';
        else
          element.EmploymentTypeId = EmploymentTypeIdobj[0].MasterDataId;
      }
      if (element.MaritalStatus != '') {
        var MaritalStatusobj = this.MaritalStatus.filter(f => f.MasterDataName.toLowerCase() == element.MaritalStatus.toLowerCase())
        if (MaritalStatusobj.length == 0)
          this.ErrorMessage += 'Invalid marital status at row ' + indx + '.\n';
        else
          element.MaritalStatusId = MaritalStatusobj[0].MasterDataId;
      }
      if (element.Nature != '') {
        var Natureobj = this.WorkNatures.filter(f => f.MasterDataName.toLowerCase() == element.Nature.toLowerCase())
        if (Natureobj.length == 0)
          this.ErrorMessage += 'Invalid work nature at row ' + indx + '.\n';
        else
          element.NatureId = Natureobj[0].MasterDataId;
      }

      if (element.PermanentAddressCountry != '') {
        var PermanentAddressCountryIdobj = this.Country.filter(f => f.MasterDataName.toLowerCase() == element.PermanentAddressCountry.toLowerCase())
        if (PermanentAddressCountryIdobj.length == 0)
          this.ErrorMessage += 'Invalid permament country at row ' + indx + '.\n';
        else {
          element.PermanentAddressCountryId = PermanentAddressCountryIdobj[0].MasterDataId;
          if (element.PermanentAddressState != '') {
            var PermanentAddressStateobj = this.AllMasterData.filter(f => f.ParentId == element.PermanentAddressCountryId)
            if (PermanentAddressStateobj.length > 0) {
              var listOfStates = PermanentAddressStateobj.filter(f => f.MasterDataName.toLowerCase() == element.PermanentAddressState.toLowerCase());
              if (listOfStates.length == 0)
                this.ErrorMessage += 'Invalid permament state at row ' + indx + '.\n';
              else {
                element.PermanentAddressStateId = +listOfStates[0].MasterDataId;
                if (element.PermanentAddressCity != '') {
                  var ListPermanentAddressCityobj = this.AllMasterData.filter(f => f.ParentId == element.PermanentAddressStateId)
                  if (ListPermanentAddressCityobj.length > 0) {
                    var CityObj = ListPermanentAddressCityobj.filter(f => f.MasterDataName.toLowerCase() == element.PermanentAddressCity.toLowerCase());
                    if (CityObj.length == 0)
                      this.ErrorMessage += 'Invalid permament city at row ' + indx + '.\n';
                    else
                      element.PermanentAddressCityId = +CityObj[0].MasterDataId;
                  }
                }
              }
            }
          }
        }
      }
      if (element.PresentAddressCountry != '') {
        var PresentAddressCountryIdobj = this.Country.filter(f => f.MasterDataName.toLowerCase() == element.PresentAddressCountry.toLowerCase())
        if (PresentAddressCountryIdobj.length == 0)
          this.ErrorMessage += 'Invalid present country at row ' + indx + '.\n';
        else {
          element.PresentAddressCountryId = +PresentAddressCountryIdobj[0].MasterDataId;
          if (element.PresentAddressState != '') {
            var PresentAddressStateobj = this.AllMasterData.filter(f => f.ParentId == element.PresentAddressCountryId)
            if (PresentAddressStateobj.length > 0) {
              var listOfStates = PresentAddressStateobj.filter(f => f.MasterDataName.toLowerCase() == element.PresentAddressState.toLowerCase());
              if (listOfStates.length == 0)
                this.ErrorMessage += 'Invalid present state at row ' + indx + '.\n';
              else {
                element.PresentAddressStateId = +listOfStates[0].MasterDataId;
                if (element.PresentAddressCity != '') {
                  var ListPresentAddressCityobj = this.AllMasterData.filter(f => f.ParentId == element.PresentAddressStateId)
                  if (ListPresentAddressCityobj.length > 0) {
                    var CityObj = ListPresentAddressCityobj.filter(f => f.MasterDataName.toLowerCase() == element.PresentAddressCity.toLowerCase());
                    if (CityObj.length == 0)
                      this.ErrorMessage += 'Invalid present city at row ' + indx + '.\n';
                    else
                      element.PresentAddressCityId = +CityObj[0].MasterDataId;
                  }
                }
              }
            }
          }
        }
      }
      if (element.Department != '') {
        var DepartmentIdobj = this.Departments.filter(f => f.MasterDataName.toLowerCase() == element.Department.toLowerCase())
        if (DepartmentIdobj.length == 0)
          this.ErrorMessage += 'Invalid department at row ' + indx + '.\n';
        else
          element.DepartmentId = DepartmentIdobj[0].MasterDataId;
      }
      if (element.Designation != '') {
        var DesignationIdobj = this.Designations.filter(f => f.MasterDataName.toLowerCase() == element.Designation.toLowerCase())
        if (DesignationIdobj.length == 0)
          this.ErrorMessage += 'Invalid designation at row ' + indx + '.\n';
        else
          element.DesignationId = DesignationIdobj[0].MasterDataId;
      }
      if (element.EmpGrade != '') {
        var EmpGradeIdobj = this.EmployeeGrades.filter(f => f.MasterDataName.toLowerCase() == element.EmpGrade.toLowerCase())
        if (EmpGradeIdobj.length == 0)
          this.ErrorMessage += 'Invalid grade at row ' + indx + '.\n';
        else
          element.EmpGradeId = EmpGradeIdobj[0].MasterDataId;
      }
      if (element.NoticePeriodDays != '' && isNaN(element.NoticePeriodDays))
        this.ErrorMessage += 'NoticePeriodDays at row ' + indx + ' must be numeric.\n';
      if (element.ProbationPeriodDays != '' && isNaN(element.ProbationPeriodDays))
        this.ErrorMessage += 'ProbationPeriodDays at row ' + indx + ' must be numeric.\n';

      if (element.DOB != undefined && isNaN(Date.parse(element.DOB)))
        this.ErrorMessage += 'Invalid DOB at row ' + indx;
      else if (element.DOB != undefined)
        element.DOB = new Date(element.DOB);

      if (element.DOJ != undefined && isNaN(Date.parse(element.DOJ)))
        this.ErrorMessage += 'Invalid DOJ at row ' + indx;
      else if (element.DOJ != undefined)
        element.DOJ = new Date(element.DOJ);

      if (element.ConfirmationDate != undefined && isNaN(Date.parse(element.ConfirmationDate)))
        this.ErrorMessage += 'Invalid ConfirmationDate at row ' + indx;
      else if (element.ConfirmationDate != undefined)
        element.ConfirmationDate = new Date(element.ConfirmationDate);

      if (element.MarriedDate != undefined && isNaN(Date.parse(element.MarriedDate)))
        this.ErrorMessage += 'Invalid MarriedDate at row ' + indx;
      else if (element.MarriedDate != undefined)
        element.MarriedDate = new Date(element.MarriedDate);

      if (element.ShortName != undefined && element.ShortName.length > 10)
        this.ErrorMessage += 'ShortName must be less than 11 characters at row ' + indx + '.\n';
      if (element.FirstName != undefined && element.FirstName.length > 30)
        this.ErrorMessage += 'FirstName must be less than 31 characters at row ' + indx + '.\n';
      if (element.LastName != undefined && element.LastName.length > 30)
        this.ErrorMessage += 'LastName must be less than 31 characters at row ' + indx + '.\n';

      if (element.MotherName != undefined && element.MotherName.length > 30)
        this.ErrorMessage += 'MotherName must be less than 31 characters at row ' + indx + '.\n';
      if (element.FatherName != undefined && element.FatherName.length > 30)
        this.ErrorMessage += 'FatherName must be less than 31 characters at row ' + indx + '.\n';
      if (element.MICRNo != undefined && element.MICRNo.length > 20)
        this.ErrorMessage += 'MICRNo must be less than 21 characters at row ' + indx + '.\n';

      if (element.BankAccountNo != undefined && element.BankAccountNo.length > 20)
        this.ErrorMessage += 'BankAccountNo must be less than 21 characters at row ' + indx + '.\n';
      if (element.IFSCCode != undefined && element.IFSCcode.length > 15)
        this.ErrorMessage += 'IFSCcode must be less than 16 characters at row ' + indx + '.\n';
      if (element.MICRNo != undefined && element.MICRNo.length > 20)
        this.ErrorMessage += 'MICRNo must be less than 21 characters at row ' + indx + '.\n';

      if (element.AdhaarNo != undefined && element.AdhaarNo.length > 15)
        this.ErrorMessage += 'AdhaarNo must be less than 16 characters at row ' + indx + '.\n';
      if (element.PhotoPath != undefined && element.PhotoPath.length > 50)
        this.ErrorMessage += 'PhotoPath must be less than 51 characters at row ' + indx + '.\n';
      if (element.ContactNo != undefined && element.ContactNo.length > 12)
        this.ErrorMessage += 'ContactNo must be less than 13 characters at row ' + indx + '.\n';
      if (element.WhatsappNo != undefined && element.WhatsappNo.length > 12)
        this.ErrorMessage += 'WhatsappNo must be less than 13 characters at row ' + indx + '.\n';
      if (element.AlternateContactNo != undefined && element.AlternateContactNo.length > 12)
        this.ErrorMessage += 'AlternateContactNo should be less than 13 characters at row ' + indx + '.\n';


      if (element.EmailAddress != undefined && element.EmailAddress.length > 30)
        this.ErrorMessage += 'EmailAddress must be less than 31 characters at row ' + indx + '.\n';
      else if (element.EmailAddress == undefined)
        element.EmailAddress = '';

      if (element.EmergencyContactNo != undefined && element.EmergencyContactNo.length > 12)
        this.ErrorMessage += 'EmergencyContactNo must be less than 13 characters at row ' + indx + '.\n';
      else if (element.EmergencyContactNo == undefined)
        element.EmergencyContactNo = ''

      if (element.PassportNo != undefined && element.PassportNo.length > 12)
        this.ErrorMessage += 'PassportNo must be less than 13 characters at row ' + indx + '.\n';
      else if (element.PassportNo == undefined)
        element.PassportNo = ''

      if (element.PAN != undefined && element.PAN.length > 12)
        this.ErrorMessage += 'PAN must be less 13 characters than 12 at row ' + indx + '.\n';
      else if (element.PAN == undefined)
        element.PAN = ''

      if (element.PFAccountNo != undefined && element.PFAccountNo.length > 20)
        this.ErrorMessage += 'PFAccountNo must be less 21 characters at row ' + indx + '.\n';
      else if (element.PFAccountNo == undefined)
        element.PFAccountNo = '';

      if (element["Remarks"] == undefined) {
        element["Remarks"] = '';
      }
      if (element["Remarks"] != undefined && element.Remarks.length > 20)
        this.ErrorMessage += 'Remarks must be less 21 characters at row ' + indx + '.\n';
      if (element.PresentAddress.length > 256)
        this.ErrorMessage += 'PresentAddress must be less 257 characters at row ' + indx + '.\n';
      else if (element.PresentAddress == undefined)
        element.PresentAddress = '';

      if (element.PresentAddressPincode.length > 10)
        this.ErrorMessage += 'PresentAddressPincode must be less 11 characters at row ' + indx + '.\n';
      else if (element.PresentAddressPincode == undefined)
        element.PresentAddressPincode = '';

      if (element.PermanentAddressPincode.length > 10)
        this.ErrorMessage += 'PermanentAddressPincode must be less 11 characters at row ' + indx + '.\n';
      else if (element.PermanentAddressPincode == undefined)
        element.PermanentAddressPincode = '';

      element.OrgId = this.loginDetail[0]["orgId"];
      if (this.ErrorMessage.length == 0)
        this.ELEMENT_DATA.push(element);
    });
    //console.log("this.ELEMENT_DATA", this.ELEMENT_DATA)
  }
  ValidateStudentActivity() {
    debugger;
    let slno: any = 0;
    this.ErrorMessage = '';
    this.GetClassEvaluations()
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.ClassEvaluations = [...data.value];

          this.jsonData.map((element, indx) => {
            slno = parseInt(indx) + 1;

            var _ratingId = element.RatingId;
            var _detail = element.Detail;

            if (element.ClassEvaluationId == 0) {
              this.ErrorMessage += "ClassEvaluationId cannot be blank or zero at row " + slno + ": " + element.ClassEvaluationId + "<br>";
            }
            else {
              var checkexist = this.ClassEvaluations.filter(f => f.ClassEvaluationId == element.ClassEvaluationId);
              if (checkexist.length == 0)
                this.ErrorMessage += "ClassEvaluationId is not valid at row " + slno + ": " + element.ClassEvaluationId + "<br>";

            }
            if (_ratingId == 0 && _detail == '')
              this.ErrorMessage += "Either rating or detail should be entered at row " + slno + ".<br>";

            let StudentClsFilter = this.StudentClassList.filter(g => g.StudentId == element.StudentId);
            if (StudentClsFilter.length == 0)
              this.ErrorMessage += "Invalid StudentId at row " + slno + ":" + element.StudentId + "<br>";
            else
              element.StudentClassId = StudentClsFilter[0].StudentClassId;
            element.CreatedDate = element.ActivityDate;
            element.OrgId = this.loginDetail[0]["orgId"];
            this.ELEMENT_DATA.push(element);
            //}
          })
        }
        else {
          this.contentservice.openSnackBar("No class evaluation found.", globalconstants.ActionText, globalconstants.RedBackground);
        }
        if (this.ErrorMessage.length > 0)
          this.snackbar.open("Data is ready for upload. Please click on file upload button.", globalconstants.ActionText,
            globalconstants.BlueBackground);
        this.loading = false; this.PageLoading = false;
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

        if (element[d] == undefined && this.NoNeedToCheckBlank.filter(b => b == d).length == 0)
          this.ErrorMessage += d + " is required at row " + slno + ".<br>";
      })
      debugger;
      //if (element.StudentId == undefined || element.StudentId == '' || element.StudentId == 0) {
      let GenderFilter = this.Genders.filter(g => g.MasterDataName.toLowerCase() == element.Gender.toLowerCase());
      if (GenderFilter.length == 0)
        this.ErrorMessage += "Invalid Gender at row " + slno + ":" + element.Gender + "<br>";
      else
        element.GenderId = GenderFilter[0].MasterDataId;
      // let houseFilter = this.Houses.filter(g => g.MasterDataName.toLowerCase() == element.House.toLowerCase());
      // if (houseFilter.length == 0)
      //   this.ErrorMessage += "Invalid House at row " + slno + ":" + element.House + "<br>";
      // else
      //   element.HouseId = houseFilter[0].MasterDataId;

      let BloodgroupFilter = this.Bloodgroup.filter(g => g.MasterDataName.toLowerCase() == element.Bloodgroup.toLowerCase());
      if (BloodgroupFilter.length == 0)
        this.ErrorMessage += "Invalid Bloodgroup at row " + slno + ":" + element.Bloodgroup + "<br>";
      else
        element.BloodgroupId = BloodgroupFilter[0].MasterDataId;

      let Categoryfilter = this.Category.filter(g => g.MasterDataName.toLowerCase() == element.Category.toLowerCase());
      if (Categoryfilter.length == 0)
        this.ErrorMessage += "Invalid Category at row " + slno + ":" + element.Category + "<br>";
      else
        element.CategoryId = Categoryfilter[0].MasterDataId;

      let ReligionFilter = this.Religion.filter(g => g.MasterDataName.toLowerCase() == element.Religion.toLowerCase());
      if (ReligionFilter.length == 0)
        this.ErrorMessage += "Invalid Religion at row " + slno + ":" + element.Religion + "<br>";
      else
        element.ReligionId = ReligionFilter[0].MasterDataId;

      let AdmissionStatusFilter = this.AdmissionStatuses.filter(g => g.MasterDataName.toLowerCase() == element.AdmissionStatus.toLowerCase());
      if (AdmissionStatusFilter.length == 0)
        this.ErrorMessage += "Invalid admission status at row " + slno + ":" + element.AdmissionStatus + "<br>";
      else
        element.AdmissionStatusId = AdmissionStatusFilter[0].MasterDataId;

      let PrimaryContactFatherOrMotherFilter = this.PrimaryContact.filter(g => g.MasterDataName.toLowerCase() == element.PrimaryContactFatherOrMother.toLowerCase());
      if (PrimaryContactFatherOrMotherFilter.length == 0)
        this.ErrorMessage += "Invalid PrimaryContactFatherOrMother at row " + slno + ":" + element.PrimaryContactFatherOrMother + "<br>";
      else
        element.PrimaryContactFatherOrMother = PrimaryContactFatherOrMotherFilter[0].MasterDataId;

      let ClassAdmissionSoughtFilter = this.Classes.filter(g => g.ClassName.toLowerCase() == element.ClassAdmissionSought.toLowerCase());
      if (ClassAdmissionSoughtFilter.length == 0)
        this.ErrorMessage += "Invalid ClassAdmissionSought at row " + slno + ":" + element.ClassAdmissionSought + "<br>";
      else
        element.ClassAdmissionSought = ClassAdmissionSoughtFilter[0].ClassId;

      if (element.Club.length > 0) {
        let ClubObj = this.Clubs.filter(g => g.MasterDataName.toLowerCase() == element.Club.toLowerCase());
        if (ClubObj.length == 0)
          this.ErrorMessage += "Invalid Club at row " + slno + ":" + element.Club + "<br>";
        else
          element.ClubId = ClubObj[0].MasterDataId;
      }
      if (element.PermanentAddressCountry.length > 0) {
        let CountryObj = this.AllMasterData.filter(g => g.MasterDataName.toLowerCase() == element.PermanentAddressCountry.toLowerCase());
        if (CountryObj.length == 0)
          this.ErrorMessage += "Invalid country at row " + slno + ":" + element.PermanentAddressCountry + "<br>";
        else {
          element.PermanentAddressCountryId = CountryObj[0].MasterDataId;
          if (element.PermanentAddressState.length > 0) {
            let stateObj = this.AllMasterData.filter(g => g.MasterDataName.toLowerCase() == element.PermanentAddressState.toLowerCase()
              && g.ParentId == element.PermanentAddressCountryId);
            if (stateObj.length == 0)
              this.ErrorMessage += "Invalid state at row " + slno + ":" + element.PermanentAddressState + "<br>";
            else {
              element.PermanentAddressStateId = stateObj[0].MasterDataId;
              if (element.PermanentAddressCity.length > 0) {
                let CityObj = this.AllMasterData.filter(g => g.MasterDataName.toLowerCase() == element.PermanentAddressCity.toLowerCase()
                  && g.ParentId == element.PermanentAddressStateId);
                if (CityObj.length == 0)
                  this.ErrorMessage += "Invalid city at row " + slno + ":" + element.PermanentAddressCity + "<br>";
                else
                  element.PermanentAddressCityId = CityObj[0].MasterDataId;
              }
            }
          }
        }
      }
      if (element.PresentAddressCountry.length > 0) {
        let CountryObj = this.AllMasterData.filter(g => g.MasterDataName.toLowerCase() == element.PresentAddressCountry.toLowerCase());
        if (CountryObj.length == 0)
          this.ErrorMessage += "Invalid country at row " + slno + ":" + element.PresentAddressCountry + "<br>";
        else {
          element.PresentAddressCountryId = CountryObj[0].MasterDataId;
          if (element.PresentAddressState.length > 0) {
            let stateObj = this.AllMasterData.filter(g => g.MasterDataName.toLowerCase() == element.PresentAddressState.toLowerCase()
              && g.ParentId == element.PresentAddressCountryId);
            if (stateObj.length == 0)
              this.ErrorMessage += "Invalid state at row " + slno + ":" + element.PresentAddressState + "<br>";
            else {
              element.PresentAddressStateId = stateObj[0].MasterDataId;
              if (element.PresentAddressCity.length > 0) {
                let CityObj = this.AllMasterData.filter(g => g.MasterDataName.toLowerCase() == element.PresentAddressCity.toLowerCase()
                  && g.ParentId == element.PresentAddressStateId);
                if (CityObj.length == 0)
                  this.ErrorMessage += "Invalid city at row " + slno + ":" + element.PresentAddressCity + "<br>";
                else
                  element.PresentAddressCityId = CityObj[0].MasterDataId;
              }
            }
          }
        }
      }

      element.StudentId = +element.StudentId;

      element.OrgId = this.loginDetail[0]["orgId"];
      element.BatchId = this.SelectedBatchId;

      this.ELEMENT_DATA.push(element);

    });

  }
  clear() {
    //this.fileUploaded=;
    this.selectedFile = '';
  }
  readAsCSV() {
    this.csvData = XLSX.utils.sheet_to_csv(this.worksheet);
    const data: Blob = new Blob([this.csvData], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "CSVFile" + new Date().getTime() + '.csv');
  }
  readAsJson() {
    try {
      this.loading = true;
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
          this.employee.save(this.ELEMENT_DATA)
            .subscribe((result: any) => {
              this.loading = false;
              this.PageLoading = false;
              this.ELEMENT_DATA =[];
              
              this.contentservice.openSnackBar("Data uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
            }, error => {
              this.contentservice.openSnackBar("Error occured. Please contact your administrator.", globalconstants.ActionText, globalconstants.RedBackground);
              console.log(error)
            });
        }
        else if (this.SelectedUploadtype.toLowerCase().includes(this.UploadType.STUDENTPROFILE)) {
          this.studentActivity.save(this.ELEMENT_DATA);
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
    this.loading = true;
    this.contentservice.GetStudentMaxPID(this.loginDetail[0]["orgId"])
      .subscribe((data: any) => {
        var _MaxPID = 1;
        if (data.value.length > 0) {
          _MaxPID = data.value[0].PID + 1;
        }
        debugger;
        if (this.ELEMENT_DATA.length > globalconstants.RowUploadLimit) {
          this.ELEMENT_DATA.splice(globalconstants.RowUploadLimit);
        }


        this.ELEMENT_DATA.forEach(row => {
          toInsert.push({
            "PID": _MaxPID++,
            "StudentId": row["StudentId"],
            "AadharNo": row["AadharNo"],
            "Active": +row["Active"],
            "AlternateContact": row["AlternateContact"],
            "BankAccountNo": row["BankAccountNo"],
            "BloodgroupId": +row["BloodgroupId"],
            "CategoryId": +row["CategoryId"],
            "GenderId": +row["GenderId"],
            "ClassAdmissionSought": +row["ClassAdmissionSought"],
            "ContactNo": row["ContactNo"],
            "ContactPersonContactNo": row["ContactPersonContactNo"],
            "DOB": this.datepipe.transform(row["DOB"], 'yyyy/MM/dd'),
            "EmailAddress": row["EmailAddress"],
            "FatherContactNo": row["FatherContactNo"],
            "FatherName": row["FatherName"],
            "FatherOccupation": row["FatherOccupation"],
            "FirstName": row["FirstName"],
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
            "ReligionId": +row["ReligionId"],
            "StudentDeclaration": +row["StudentDeclaration"],
            "TransferFromSchool": row["TransferFromSchool"],
            "TransferFromSchoolBoard": row["TransferFromSchoolBoard"],
            "UpdatedBy": row["UpdatedBy"],
            "UpdatedDate": this.datepipe.transform(row["UpdatedDate"], 'yyyy/MM/dd'),
            "CreatedBy": row["CreatedBy"],
            "CreatedDate": this.datepipe.transform(row["CreatedDate"], 'yyyy/MM/dd'),
            "WhatsAppNumber": row["WhatsAppNumber"],
            "ClubId": +row["ClubId"],
            "AdmissionStatusId": +row["AdmissionStatusId"],
            "AdmissionDate": row["AdmissionDate"],
            "BatchId": +row["BatchId"]

          });
        });

        //console.log("toInsert", toInsert)
        this.dataservice.postPatch('Students', toInsert, 0, 'post')
          .subscribe((result: any) => {
            this.loading = false; this.PageLoading = false;
            this.ELEMENT_DATA = [];
            this.contentservice.openSnackBar("Data uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
          }, error => {
            console.log("error from student upload:", error);
            this.ErrorMessage = "Something went wrong. Please contact your administrator.";
            this.contentservice.openSnackBar(this.ErrorMessage, globalconstants.ActionText, globalconstants.RedBackground);
          })
      });
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
        if (data.value.length > 0) {
          this.StudentClassList = [...data.value];
        }
        else {
          this.contentservice.openSnackBar("No class student found.", globalconstants.ActionText, globalconstants.RedBackground);
        }

        this.loading = false; this.PageLoading = false;
      })
  }
  GetClassEvaluations() {
    //this.filterOrgIdNBatchId = globalconstants.gt.getStandardFilterWithBatchId(this.tokenservice);

    let list: List = new List();
    list.fields = ["ClassEvaluationId", "Description", "ClassId"];
    list.PageName = "ClassEvaluations";
    list.filter = ["Active eq 1 and OrgId eq " + this.loginDetail[0]['orgId']];
    //list.orderBy = "ParentId";

    return this.dataservice.get(list);

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
        var SelectedApplicationName = '';
        var PermittedApplications = this.tokenservice.getPermittedApplications();
        var apps = PermittedApplications.filter(f => f.applicationId == this.SelectedApplicationId)
        if (apps.length > 0) {
          SelectedApplicationName = apps[0].appShortName;
        }


        this.AllMasterData = [...data.value];

        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
        //this.States = this.getDropDownData(globalconstants.MasterDefinitions.common.STATE);
        if (SelectedApplicationName == 'edu') {
          this.AdmissionStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.ADMISSIONSTATUS);
          this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.UPLOADTYPE);
          this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
          this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
          this.Location = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
          this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
          this.Clubs = this.getDropDownData(globalconstants.MasterDefinitions.school.CLUBS);
          this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
          this.ActivityCategory = this.getDropDownData(globalconstants.MasterDefinitions.school.QUESTIONNAIRETYPE);
        }
        else if (SelectedApplicationName == 'employee') {
          this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.employee.GENDER);

          this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEUPLOADTYPE);
          this.ActivityCategory = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEPROFILECATEGORY);
          this.Departments = this.getDropDownData(globalconstants.MasterDefinitions.employee.DEPARTMENT);
          this.Designations = this.getDropDownData(globalconstants.MasterDefinitions.employee.DESIGNATION);
          this.EmployeeGrades = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEGRADE);
          this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
          this.EmployeeStatus = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYMENTSTATUS);
          this.EmployeeTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYMENTTYPE);
          this.MaritalStatus = this.getDropDownData(globalconstants.MasterDefinitions.employee.MARITALSTATUS);
          this.WorkNatures = this.getDropDownData(globalconstants.MasterDefinitions.employee.NATURE);
          this.Country = this.getDropDownData(globalconstants.MasterDefinitions.common.COUNTRY);

        }
        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Batches = this.tokenservice.getBatches();
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
