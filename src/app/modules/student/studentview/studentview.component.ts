import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import alasql from 'alasql';
import * as moment from 'moment';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { FileUploadService } from 'src/app/shared/upload.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AddstudentclassComponent } from '../addstudentclass/addstudentclass.component';
import { AddstudentfeepaymentComponent } from '../studentfeepayment/addstudentfeepayment/addstudentfeepayment.component';
import { FeereceiptComponent } from '../studentfeepayment/feereceipt/feereceipt.component';

@Component({
  selector: 'app-studentview',
  templateUrl: './studentview.component.html',
  styleUrls: ['./studentview.component.scss']
})
export class StudentviewComponent implements OnInit {
  PageLoading = true;
  @ViewChild(AddstudentclassComponent) studentClass: AddstudentclassComponent;
  @ViewChild(AddstudentfeepaymentComponent) studentFeePayment: AddstudentfeepaymentComponent;
  @ViewChild(FeereceiptComponent) feeReceipt: FeereceiptComponent;
  Edit = false;
  SelectedBatchId = 0;
  SelectedApplicationId = 0;
  loginUserDetail = [];
  StudentLeaving = false;
  StudentName = '';
  StudentClassId = 0;
  selectedIndex: number = 0;
  imagePath: string;
  message: string;
  imgURL: any;
  selectedFile: any;
  Albums: any;
  errorMessage = '';
  formdata: FormData;
  StudentId = 0;
  loading = false;
  Classes = [];
  Sections = [];
  Clubs = [];
  Genders = [];
  Category = [];
  Bloodgroup = [];
  Religion = [];
  MaxPID = 0;
  Permission = '';
  PrimaryContact = [];
  Location = [];
  allMasterData = [];
  ReasonForLeaving = [];
  studentData = [];
  AdmissionStatuses = [];
  ColumnsOfSelectedReports = [];
  CountryId = 0;
  PrimaryContactDefaultId = 0;
  PrimaryContactOtherId = 0;
  displayContactPerson = false;
  Houses = [];
  Remarks = [];
  studentForm: UntypedFormGroup;
  Edited = false;
  public files: NgxFileDropEntry[] = [];
  @ViewChild(ImageCropperComponent, { static: true }) imageCropper: ImageCropperComponent;

  preview(files) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
    debugger;
    this.selectedFile = files[0];
    if (this.selectedFile.size > 120000) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Image size should be less than 100kb", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }
  }
  uploadFile() {
    debugger;
    let error: boolean = false;
    this.loading = true;
    if (this.selectedFile == undefined) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select a file.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.formdata = new FormData();
    this.formdata.append("description", "Passport photo of student");
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "StudentPhoto");
    this.formdata.append("parentId", "-1");

    this.formdata.append("batchId", "0");
    this.formdata.append("orgName", this.loginUserDetail[0]["org"]);
    this.formdata.append("orgId", this.loginUserDetail[0]["orgId"]);
    this.formdata.append("pageId", "0");

    if (this.StudentId != null && this.StudentId != 0)
      this.formdata.append("studentId", this.StudentId + "");
    this.formdata.append("studentClassId", this.StudentClassId.toString());
    this.formdata.append("docTypeId", "0");

    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    this.uploadImage();
  }

  uploadImage() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.fileUploadService.postFiles(this.formdata).subscribe(res => {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Files uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
      this.Edit = false;
    });
  }

  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private route: Router,
    private fb: UntypedFormBuilder,
    private fileUploadService: FileUploadService,
    private shareddata: SharedataService,
    private tokenService: TokenStorageService,

  ) {

    this.StudentId = this.tokenService.getStudentId();
    this.StudentClassId = this.tokenService.getStudentClassId()
  }

  ngOnInit(): void {
    this.imgURL = '';
    this.loginUserDetail = this.tokenService.getUserDetail();
    if (this.loginUserDetail.length == 0)
      this.route.navigate(['/auth/login'])
    else {
      var perObj = globalconstants.getPermission(this.tokenService, globalconstants.Pages.edu.STUDENT.STUDENTDETAIL);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
        //this.tabNames
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenService.getSelectedAPPId();
        this.getFields('Student Module');
        this.SelectedBatchId = +this.tokenService.getSelectedBatchId();
        this.GetMasterData();
        this.GetFeeTypes();
        this.GetStudentAttendance();
        this.GetSportsResult();
        this.contentservice.GetClasses(this.loginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
          this.loading = false;
          this.PageLoading = false;
        });

      }
    }
  }
  @ViewChildren("allTabs") allTabs: QueryList<any>

  ngAfterViewInit() {
    ////console.log('total tabs: ' + this.allTabs.first._tabs.length);
  }

  get f() { return this.studentForm.controls }

  edit() {
    this.route.navigate(['/edu/addstudent/' + this.StudentId])
  }

  tabChanged(tabChangeEvent: number) {
    this.selectedIndex = tabChangeEvent;
    this.navigateTab(this.selectedIndex);
    //   //console.log('tab selected: ' + tabChangeEvent);
  }
  public nextStep() {
    this.selectedIndex += 1;
    this.navigateTab(this.selectedIndex);
  }

  public previousStep() {
    this.selectedIndex -= 1;
    this.navigateTab(this.selectedIndex);
  }
  navigateTab(indx) {
    switch (indx) {
      case 4:
        this.studentClass.PageLoad();
        break;

    }
  }
  back() {
    this.route.navigate(['/edu']);
  }
  deActivate(event) {
    if (!event.checked)
      this.StudentLeaving = true;
    else {
      this.StudentLeaving = false;
      this.studentForm.patchValue({ ReasonForLeavingId: this.ReasonForLeaving.filter(r => r.MasterDataName.toLowerCase() == 'active')[0].MasterDataId });
    }
    this.OnBlur();
  }

  Batches = [];
  StudentClasses = [];
  GetStudentClass() {
    debugger;
    var filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenService);

    if (this.StudentId > 0 && this.StudentClassId > 0) {

      let list: List = new List();
      list.fields = [
        "StudentClassId", "ClassId",
        "StudentId", "RollNo", "SectionId",
        "BatchId", "FeeTypeId",
        "AdmissionDate", "Remarks", "Active"];
      list.PageName = "StudentClasses";
      list.filter = ["StudentClassId eq " + this.StudentClassId + " and " + filterOrgIdNBatchId];

      this.dataservice.get(list)
        .subscribe((data: any) => {
          if (data.value.length > 0) {
            var _class = ''
            var _classObj = this.Classes.filter(f => f.ClassId == data.value[0].ClassId);
            if (_classObj.length > 0)
              _class = _classObj[0].ClassName;

            var _section = ''
            var _sectionObj = this.Sections.filter(f => f.SectionId == data.value[0].SectionId);
            if (_sectionObj.length > 0)
              _section = _sectionObj[0].MasterDataName;

            var _feeType = ''
            var _feeTypeObj = this.FeeType.filter(f => f.FeeTypeId == data.value[0].FeeTypeId);
            if (_feeTypeObj.length > 0)
              _feeType = _feeTypeObj[0].FeeTypeName;

            var _batch = ''
            this.Batches = this.tokenService.getBatches();
            var _batchObj = this.Batches.filter(f => f.BatchId == data.value[0].BatchId);
            if (_batchObj.length > 0)
              _batch = _batchObj[0].BatchName;

            var admissiondate = moment(data.value[0].AdmissionDate).isBefore("1970-01-01")
            this.StudentClasses = [
              { Text: 'Admission No.', Value: data.value[0].StudentClassId },
              { Text: 'Class', Value: _class },
              { Text: 'Section', Value: _section },
              { Text: 'Roll No.', Value: data.value[0].RollNo },
              { Text: 'Batch', Value: _batch },
              { Text: 'Fee Type', Value: _feeType },
              { Text: 'Admission Date', Value: admissiondate ? moment() : moment(data.value[0].AdmissionDate).format('DD/MM/YYYY') },
              { Text: 'Remarks', Value: data.value[0].Remarks },
              { Text: 'Active', Value: data.value[0].Active == 1 ? 'Yes' : 'No' }
            ];
          }
          else {
            this.StudentClasses = [
              { Text: 'Admission No.', Value: '' },
              { Text: 'Class', Value: '' },
              { Text: 'Section', Value: '' },
              { Text: 'RollNo', Value: '' },
              { Text: 'BatchId', Value: '' },
              { Text: 'Fee Type', Value: '' },
              { Text: 'Admission Date', Value: '' },
              { Text: 'Remarks', Value: '' },
              { Text: 'Active', Value: '' }
            ];
            this.contentservice.openSnackBar("Class yet to be defined for this student", globalconstants.ActionText, globalconstants.RedBackground);
          }
          this.datasourceStudentClassInfo = new MatTableDataSource<any>(this.StudentClasses);
          this.loading = false;
          this.PageLoading = false;
        });
    }
    else {
      this.loading = false;
      this.PageLoading = false;
    }
  }
  StudentAttendanceList = [];
  AttendanceStatusSum = [];
  GetStudentAttendance() {
    debugger;

    let list: List = new List();
    list.fields = [
      "AttendanceId",
      "StudentClassId",
      "AttendanceDate",
      "AttendanceStatus",
      "ClassSubjectId",
      "Remarks",
      "OrgId",
      "BatchId"
    ];
    list.PageName = "Attendances";
    list.lookupFields = ["StudentClass($select=RollNo,SectionId;$expand=Student($select=FirstName,LastName))"];
    list.filter = ["OrgId eq " + this.loginUserDetail[0]["orgId"] +
      " and StudentClassId eq " + this.StudentClassId + " and BatchId eq " + this.SelectedBatchId];

    this.dataservice.get(list)
      .subscribe((attendance: any) => {
        attendance.value.forEach(att => {
          var _lastname = att.StudentClass.Student.LastName == null || att.StudentClass.Student.LastName == '' ? '' : " " + att.StudentClass.Student.LastName;
          this.StudentAttendanceList.push({
            AttendanceId: att.AttendanceId,
            StudentClassId: att.StudentClassId,
            AttendanceStatus: att.AttendanceStatus,
            Remarks: att.Remarks,
            StudentRollNo: att.StudentClass.Student.FirstName + _lastname
          });
        });
        this.AttendanceStatusSum = alasql("select AttendanceStatus, count(AttendanceStatus) Total from ? group by AttendanceStatus",
          [this.StudentAttendanceList]);
        if (this.AttendanceStatusSum.length > 0) {
          var _present = 0
          var _absent = 0;
          var _presentObj = this.AttendanceStatusSum.filter(f => f.AttendanceStatus == 1)
          if (_presentObj.length > 0)
            _present = _presentObj[0].Total

          var _absentObj = this.AttendanceStatusSum.filter(f => f.AttendanceStatus == 0)
          if (_absentObj.length > 0)
            _absent = _absentObj[0].Total

          var _AttendanceInfoList = [
            { "Text": "Present", Value: _present },
            { "Text": "Absent", Value: _absent }
          ]
        }
        this.datasourceAttendanceInfo = new MatTableDataSource<any>(_AttendanceInfoList);
      })
  }
  SportsResultList = [];
  ActivityNames = [];

  DisplayActivity = ["Secured", "Achievement", "SportsNameId", "CategoryId", "AchievementDate"];

  GetSportsResult() {
    debugger;
    var filterStr = "Active eq 1 and OrgId eq " + this.loginUserDetail[0]["orgId"];
    filterStr += " and StudentClassId eq " + this.StudentClassId;

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
          m.SubCategories = this.allMasterData.filter(f => f.ParentId == m.CategoryId);
          m.Achievement = globalconstants.decodeSpecialChars(m.Achievement);
          m.Action = false;
          return m;
        })

        //this.dataSourceActivity = new MatTableDataSource<any>(this.SportsResultList);

      });

  }

  StudentFamilyNFriendList = [];
  StudentFamilyNFriendListName = 'StudentFamilyNFriends';

  GetStudentFamilyNFriends() {

    var _ParentStudentId = 0;
    let filterStr = 'StudentId eq ' + this.StudentId + ' and OrgId eq ' + this.loginUserDetail[0]['orgId']
    let list: List = new List();
    list.fields = [
      'ParentStudentId'
    ];
    list.PageName = this.StudentFamilyNFriendListName;
    list.filter = [filterStr];
    this.StudentFamilyNFriendList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          _ParentStudentId = data.value[0].ParentStudentId;
          filterStr += ' and ParentStudentId eq ' + _ParentStudentId;

          list = new List();
          list.fields = [
            'StudentFamilyNFriendId',
            'StudentId',
            'ParentStudentId',
            'Name',
            'ContactNo',
            'RelationshipId',
            'Active',
            'Remarks'
          ];
          list.orderBy = "RelationshipId";
          list.PageName = this.StudentFamilyNFriendListName;
          list.lookupFields = ["Student($select=FirstName,LastName)"];
          list.filter = [filterStr];
          this.StudentFamilyNFriendList = [];
          this.dataservice.get(list)
            .subscribe((data: any) => {
              //debugger;
              if (data.value.length > 0) {
                this.StudentFamilyNFriendList = data.value.map(m => {
                  var _lastname = m.Student.LastName == null || m.Student.LastName == '' ? '' : " " + m.Student.LastName;
                  if (m.StudentId > 0) {
                    m.SiblingName = m.Student.FirstName + _lastname;
                    // m.FeeType = obj[0].FeeType;
                    // m.FeeTypeRemarks = obj[0].Remarks;
                  }
                  else
                    m.SiblingName = m.Name;
                  return m;
                });
              }
            });
        }
      })

  }
  GetMasterData() {
    this.contentservice.GetCommonMasterData(this.loginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        ////console.log(data.value);
        this.allMasterData = [...data.value];
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
        this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
        this.Clubs = this.getDropDownData(globalconstants.MasterDefinitions.school.CLUBS);
        this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
        this.Remarks = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARKS);
        this.AdmissionStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.ADMISSIONSTATUS);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);

        this.Location = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        this.PrimaryContactDefaultId = this.PrimaryContact.filter(contact => contact.MasterDataName.toLowerCase() == "father")[0].MasterDataId;
        this.PrimaryContactOtherId = this.PrimaryContact.filter(contact => contact.MasterDataName.toLowerCase() == "other")[0].MasterDataId;
        this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
        //this.studentForm.patchValue({ PrimaryContactFatherOrMother: this.PrimaryContactDefaultId });
        //this.studentForm.patchValue({ ReasonForLeavingId: this.ReasonForLeaving.filter(r => r.MasterDataName.toLowerCase() == 'active')[0].MasterDataId });
        if (this.StudentId > 0)
          this.GetStudent();

      });

  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenService, this.allMasterData);
    // let Id = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    // })[0].MasterDataId;
    // return this.allMasterData.filter((item, index) => {
    //   return item.ParentId == Id
    // });
  }
  displayContact(event) {
    if (event.value == this.PrimaryContactOtherId) {
      this.displayContactPerson = true;
    }
    else {
      this.displayContactPerson = false;
    }

  }
  OnBlur() {
    this.Edited = true;
  }
  ErrorMessage = '';
  SaveOrUpdate() {

    var _MandatoryColumns = this.ColumnsOfSelectedReports.filter(f => f.Active == 1);
    this.ErrorMessage = '';
    _MandatoryColumns.forEach(b => {
      if (this.studentForm.get(b.ReportName).value == undefined
        || this.studentForm.get(b.ReportName).value == null
        || this.studentForm.get(b.ReportName).value.length == 0
        || this.studentForm.get(b.ReportName).value == 0) {
        this.ErrorMessage += b.ReportName + " is required.\n";
      }
    })

    // if (this.studentForm.get("FirstName").value == 0) {
    //   errorMessage += "First Name is required.\n";
    // }
    // if (this.studentForm.get("FatherName").value == 0) {
    //   errorMessage += "Father name is required.\n";

    // }
    // if (this.studentForm.get("BloodgroupId").value == 0) {
    //   errorMessage += "Please select blood group.\n";

    // }
    // if (this.studentForm.get("GenderId").value == 0) {
    //   errorMessage += "Please select gender.\n";

    // }
    // if (this.studentForm.get("ReligionId").value == 0) {
    //   errorMessage += "Please select religion.\n";

    // }
    // if (this.studentForm.get("CategoryId").value == 0) {
    //   errorMessage += "Please select Category.\n";
    // }
    // if (this.studentForm.get("ClassAdmissionSought").value == 0) {
    //   errorMessage += "Please select Class for which admission is sought.\n";
    // }
    // if (this.studentForm.get("AdmissionStatusId").value == 0) {
    //   errorMessage += "Please select admission status.\n";
    // }
    // if (this.studentForm.get("ContactNo").value == 0) {
    //   errorMessage += "Please provide contact no..\n";
    // }
    // if (this.studentForm.get("WhatsAppNumber").value == 0) {
    //   errorMessage += "Please provide whatsapp no..\n";
    // }

    if (this.ErrorMessage.length > 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar(this.ErrorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    var _email = this.studentForm.get("EmailAddress").value;
    if (_email.length > 0) {
      var checkduppayload = { 'Id': this.StudentId, 'Email': _email }
      this.contentservice.CheckEmailDuplicate(checkduppayload)
        .subscribe((data: any) => {
          if (data) {
            this.loading = false; this.PageLoading = false;
            this.contentservice.openSnackBar("Email already in use.", globalconstants.ActionText, globalconstants.RedBackground);
            return;
          }
        });
    }
    this.studentData = [];
    //var _studentId = this.studentForm.get("StudentId").value;
    this.studentData.push({
      StudentId: this.StudentId,
      FirstName: this.studentForm.get("FirstName").value,
      LastName: this.studentForm.get("LastName").value,
      FatherName: this.studentForm.get("FatherName").value,
      FatherOccupation: this.studentForm.get("FatherOccupation").value,
      MotherName: this.studentForm.get("MotherName").value,
      MotherOccupation: this.studentForm.get("MotherOccupation").value,
      GenderId: this.studentForm.get("Gender").value,
      PermanentAddress: this.studentForm.get("PermanentAddress").value,
      PresentAddress: this.studentForm.get("PresentAddress").value,
      DOB: this.adjustDateForTimeOffset(this.studentForm.get("DOB").value),
      BloodgroupId: this.studentForm.get("Bloodgroup").value,
      CategoryId: this.studentForm.get("Category").value,
      BankAccountNo: this.studentForm.get("BankAccountNo").value,
      IFSCCode: this.studentForm.get("IFSCCode").value,
      MICRNo: this.studentForm.get("MICRNo").value,
      AdhaarNo: this.studentForm.get("AdhaarNo").value,
      Photo: this.studentForm.get("Photo").value,
      ReligionId: this.studentForm.get("Religion").value,
      ContactNo: this.studentForm.get("ContactNo").value,
      WhatsAppNumber: this.studentForm.get("WhatsAppNumber").value,
      FatherContactNo: this.studentForm.get("FatherContactNo").value,
      MotherContactNo: this.studentForm.get("MotherContactNo").value,
      PrimaryContactFatherOrMother: this.studentForm.get("PrimaryContactFatherOrMother").value,
      NameOfContactPerson: this.studentForm.get("NameOfContactPerson").value,
      RelationWithContactPerson: this.studentForm.get("RelationWithContactPerson").value,
      ContactPersonContactNo: this.studentForm.get("ContactPersonContactNo").value,
      AlternateContact: this.studentForm.get("AlternateContact").value,
      ClassAdmissionSought: this.studentForm.get("ClassAdmissionSought").value,
      LastSchoolPercentage: this.studentForm.get("LastSchoolPercentage").value,
      TransferFromSchool: this.studentForm.get("TransferFromSchool").value,
      TransferFromSchoolBoard: this.studentForm.get("TransferFromSchoolBoard").value,
      ClubId: this.studentForm.get("Club").value,
      HouseId: this.studentForm.get("House").value,
      RemarkId: this.studentForm.get("Remarks").value,
      AdmissionStatusId: this.studentForm.get("AdmissionStatus").value,
      AdmissionDate: this.studentForm.get("AdmissionDate").value,
      //Remarks: this.studentForm.get("Remarks").value,
      EmailAddress: _email,
      Active: this.studentForm.get("Active").value == true ? 1 : 0,
      ReasonForLeavingId: this.studentForm.get("ReasonForLeaving").value,
      OrgId: this.loginUserDetail[0]["orgId"],
      IdentificationMark: this.studentForm.get("IdentificationMark").value,
      Height: this.studentForm.get("Height").value,
      Weight: this.studentForm.get("Weight").value,
      BatchId: this.tokenService.getSelectedBatchId()
    });
    //debugger;
    console.log("studentData", this.studentData)
    if (this.studentForm.get("StudentId").value == 0) {
      //this.studentData[0].EmailAddress =this.studentForm.get("EmailAddress").value;
      this.save();
    }
    else {
      this.update();
    }

  }

  save() {
    debugger;
    this.studentForm.patchValue({ AlternateContact: "" });
    this.contentservice.GetStudentMaxPID(this.loginUserDetail[0]["orgId"]).subscribe((data: any) => {
      var _MaxPID = 1;
      if (data.value.length > 0) {
        _MaxPID = +data.value[0].PID + 1;
      }
      this.studentData[0].PID = _MaxPID;

      this.dataservice.postPatch('Students', this.studentData, 0, 'post')
        .subscribe((result: any) => {
          debugger;
          if (result != undefined) {
            this.studentForm.patchValue({
              StudentId: result.StudentId
            })
            this.StudentId = result.StudentId;
            // if (result != null && result.UserId != "")
            //   this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            // else
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

            //this.StudentClassId = this.studentForm.get("ClassAdmissionSought").value;
            this.loading = false; this.PageLoading = false;
            this.tokenService.saveStudentId(this.StudentId + "")
            //this.tokenService.saveStudentClassId(this.StudentClassId + "");
            this.CreateInvoice();
            this.GetStudent();
            this.Edited = false;

          }

        }, error => {
          console.log("student insert", error)
          var errormsg = globalconstants.formatError(error);
          this.loading = false;
          this.contentservice.openSnackBar(errormsg, globalconstants.ActionText, globalconstants.RedBackground);
        })
    })
  }

  update() {
    ////console.log('student', this.studentForm.value)

    this.dataservice.postPatch('Students', this.studentData[0], this.StudentId, 'patch')
      .subscribe((result: any) => {
        this.loading = false; this.PageLoading = false;
        this.Edited = false;
        if (result != null && result.UserId != "")
          this.contentservice.openSnackBar(globalconstants.UserLoginCreated, globalconstants.ActionText, globalconstants.BlueBackground);
        else
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
      }, error => {
        this.loading = false;
        console.log("student update", error);
      })
  }
  CreateInvoice() {
    this.contentservice.getInvoice(+this.loginUserDetail[0]["orgId"], this.SelectedBatchId, this.StudentClassId)
      .subscribe((data: any) => {

        this.contentservice.createInvoice(data, this.SelectedBatchId, this.loginUserDetail[0]["orgId"])
          .subscribe((data: any) => {
            //this.loading = false; this.PageLoading=false;
            //this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          },
            error => {
              this.loading = false;
              console.log("error in createInvoice", error);
            })
      },
        error => {
          this.loading = false;
          console.log("error in getinvoice", error);
        })
  }
  adjustDateForTimeOffset(dateToAdjust) {
    ////console.log(dateToAdjust)
    var offsetMs = dateToAdjust.getTimezoneOffset() * 60000;
    return new Date(dateToAdjust.getTime() - offsetMs);
  }
  FeeType = [];
  GetFeeTypes() {
    debugger;
    this.loading = true;
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = ["Active eq 1 and OrgId eq " + this.loginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeType = [...data.value];
        this.GetStudentClass();
      })
  }
  getFields(pModuleName) {
    this.contentservice.getSelectedReportColumn(this.loginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        var _baseReportId = 0;
        if (data.value.length > 0) {
          _baseReportId = data.value.filter(f => f.ReportName == 'Reports' && f.ParentId == 0)[0].ReportConfigItemId;
          var _studentModuleObj = data.value.filter(f => f.ReportName == pModuleName && f.ParentId == _baseReportId)
          var _studentModuleId = 0;
          if (_studentModuleObj.length > 0) {
            _studentModuleId = _studentModuleObj[0].ReportConfigItemId;
          }

          var _orgStudentModuleObj = data.value.filter(f => f.ParentId == _studentModuleId
            && f.OrgId == this.loginUserDetail[0]["orgId"] && f.Active == 1);
          var _orgStudentModuleId = 0;
          if (_orgStudentModuleObj.length > 0) {
            _orgStudentModuleId = _orgStudentModuleObj[0].ReportConfigItemId;
          }

          this.ColumnsOfSelectedReports = data.value.filter(f => f.ParentId == _orgStudentModuleId)

        }

      })
  }

  datasourcePrimaryInfo: MatTableDataSource<any>;
  datasourceContact: MatTableDataSource<any>;
  datasourceAdditionalInfo: MatTableDataSource<any>;
  datasourceBankAccountInfo: MatTableDataSource<any>;
  datasourceStudentClassInfo: MatTableDataSource<any>;
  datasourceAttendanceInfo: MatTableDataSource<any>;
  dataSourceActivity: MatTableDataSource<any>;

  displayedColumns = ["Text", "Value"];
  GetStudent() {
    //debugger;
    this.loading = true;
    let list: List = new List();
    list.fields = ["*"];//"StudentId", "Name", "FatherName", "MotherName", "FatherContactNo", "MotherContactNo", "Active"];
    list.PageName = "Students";
    list.lookupFields = ["StudentClasses($filter=BatchId eq " + this.SelectedBatchId + ";$select=StudentClassId,StudentId),StorageFnPs($select=FileId,FileName;$filter=StudentId eq " + this.StudentId + ")"]
    list.filter = ["StudentId eq " + this.StudentId];

    debugger;

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          data.value.forEach(stud => {
            if (stud.StudentClasses.length > 0) {
              this.StudentClassId = stud.StudentClasses[0].StudentClassId;
              this.tokenService.saveStudentClassId(this.StudentClassId + "");
            }
            var _lastname = stud.LastName == null || stud.LastName == '' ? '' : " " + stud.LastName;
            let StudentName = stud.PID + ' ' + stud.FirstName + _lastname + ' ' + stud.FatherName +
              ' ' + stud.MotherName + ',';
            this.shareddata.ChangeStudentName(StudentName);

            var _gender = '';
            var _genderObj = this.Genders.filter(f => f.MasterDataId == stud.GenderId)
            if (_genderObj.length > 0)
              _gender = _genderObj[0].MasterDataName;

            var _religion = '';
            var _religionObj = this.Religion.filter(f => f.MasterDataId == stud.ReligionId)
            if (_religionObj.length > 0)
              _religion = _religionObj[0].MasterDataName;

            var _category = '';
            var _categoryObj = this.Category.filter(f => f.MasterDataId == stud.CategoryId)
            if (_category.length > 0)
              _category = _categoryObj[0].MasterDataName;

            var _bloodGroup = '';
            var _bloodGroupObj = this.Bloodgroup.filter(f => f.MasterDataId == stud.BloodgroupId)
            if (_bloodGroupObj.length > 0)
              _bloodGroup = _bloodGroupObj[0].MasterDataName;

            var _classAdmissionSought = '';
            var _classAdmissionSoughtObj = this.Classes.filter(f => f.ClassId == stud.ClassAdmissionSought)
            if (_classAdmissionSoughtObj.length > 0)
              _classAdmissionSought = _classAdmissionSoughtObj[0].ClassName;

            var _club = '';
            var _clubObj = this.Clubs.filter(f => f.MasterDataId == stud.ClubId)
            if (_clubObj.length > 0)
              _club = _clubObj[0].MasterDataName;

            var _house = '';
            var _houseObj = this.Houses.filter(f => f.MasterDataId == stud.HouseId)
            if (_houseObj.length > 0)
              _house = _houseObj[0].ClassName;

            var _remark = '';
            var _remarkObj = this.Remarks.filter(f => f.MasterDataId == stud.RemarkId)
            if (_remarkObj.length > 0)
              _remark = _remarkObj[0].MasterDataName;

            var _admissionStatus = '';
            var _admissionStatusObj = this.AdmissionStatuses.filter(f => f.MasterDataId == stud.AdmissionStatusId)
            if (_admissionStatusObj.length > 0)
              _admissionStatus = _admissionStatusObj[0].MasterDataName;

            var _reasonForLeaving = '';
            var _reasonForLeavingObj = this.ReasonForLeaving.filter(f => f.MasterDataId == stud.ReasonForLeavingId)
            if (_reasonForLeavingObj.length > 0)
              _reasonForLeaving = _reasonForLeavingObj[0].MasterDataName;

            var _primaryContact = '';
            var _primaryContactObj = this.PrimaryContact.filter(f => f.MasterDataId == stud.PrimaryContactFatherOrMother)
            if (_primaryContactObj.length > 0)
              _primaryContact = _primaryContactObj[0].MasterDataName;

            var Primary = [
              { Text: 'PID', Value: stud.PID },
              { Text: 'First Name', Value: stud.FirstName },
              { Text: 'Last Name', Value: stud.LastName },
              { Text: 'Father Name', Value: stud.FatherName },
              { Text: 'Mother Name', Value: stud.MotherName },
              { Text: 'Father Occupation', Value: stud.FatherOccupation },
              { Text: 'Mother Occupation', Value: stud.MotherOccupation },
              { Text: 'Present Address', Value: stud.PresentAddress },
              { Text: 'Permanent Address', Value: stud.PermanentAddress },
              { Text: 'DOB', Value: moment(stud.DOB).format('DD/MM/YYYY') },
              { Text: 'Gender', Value: _gender },
              { Text: 'Blood group', Value: _bloodGroup },
              { Text: 'Category', Value: _category },
              { Text: 'Religion', Value: _religion },
            ];

            var BankAccountInfo = [
              { Text: 'Bank Account No', Value: stud.BankAccountNo },
              { Text: 'IFSC Code', Value: stud.IFSCCode },
              { Text: 'MICR No.', Value: stud.MICRNo },
            ];
            var ContactInfo = [
              { Text: 'Adhaar No.', Value: stud.AdhaarNo },
              { Text: 'Contact No.', Value: stud.ContactNo },
              { Text: 'WhatsApp Number', Value: stud.WhatsAppNumber },
              { Text: 'Father Contact No.', Value: stud.FatherContactNo },
              { Text: 'Mother Contact No.', Value: stud.MotherContactNo },
              { Text: 'Primary Contact', Value: _primaryContact },
              { Text: 'Name Of Contact Person', Value: stud.NameOfContactPerson },
              { Text: 'Relation With Contact Person', Value: stud.RelationWithContactPerson },
              { Text: "Contact Person's Contact No", Value: stud.ContactPersonContactNo },
              { Text: 'Alternate Contact No.', Value: stud.AlternateContact },
              { Text: 'Email Address', Value: stud.EmailAddress },
            ];
            var additionalInfo = [
              { Text: 'Last School Percentage', Value: stud.LastSchoolPercentage },
              { Text: 'Class Admission Sought', Value: _classAdmissionSought },
              { Text: 'Transfer From School', Value: stud.TransferFromSchool },
              { Text: 'Transfer From School Board', Value: stud.TransferFromSchoolBoard },
              { Text: 'Club', Value: _club },
              { Text: 'House', Value: _house },
              { Text: 'Admission Status', Value: _admissionStatus },
              { Text: 'Admission Date', Value: moment(stud.AdmissionDate).format('DD/MM/YYYY') },
              { Text: 'Remarks', Value: _remark },
              { Text: 'Active', Value: stud.Active == 1 ? 'Yes' : 'No' },
              { Text: 'Reason For Leaving', Value: _reasonForLeaving },
              { Text: 'Identification Mark', Value: stud.IdentificationMark },
              { Text: 'Weight', Value: stud.Weight },
              { Text: 'Height', Value: stud.Height }
            ]
            this.datasourcePrimaryInfo = new MatTableDataSource<any>(Primary);
            this.datasourceContact = new MatTableDataSource<any>(ContactInfo);
            this.datasourceAdditionalInfo = new MatTableDataSource<any>(additionalInfo);
            this.datasourceBankAccountInfo = new MatTableDataSource<any>(BankAccountInfo);

            if (stud.PrimaryContactFatherOrMother == this.PrimaryContactOtherId)
              this.displayContactPerson = true;
            else
              this.displayContactPerson = false;
            if (stud.StorageFnPs.length > 0) {
              var fileNames = stud.StorageFnPs.sort((a, b) => b.FileId - a.FileId)
              this.imgURL = globalconstants.apiUrl + "/Uploads/" + this.loginUserDetail[0]["org"] +
                "/StudentPhoto/" + fileNames[0].FileName;
            }
            else if (this.StudentId > 0)
              this.imgURL = 'assets/images/emptyimageholder.jpg'
          })
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);

        }
        this.loading = false;
        this.PageLoading = false;
      },
        err => {
          console.log("error", err)
        });
  }

}
