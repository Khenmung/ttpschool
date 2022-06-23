import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { ImageCropperComponent } from 'ngx-image-cropper';

import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { FileUploadService } from '../../../shared/upload.service';
import { AddstudentclassComponent } from '../addstudentclass/addstudentclass.component';
import { AddstudentfeepaymentComponent } from '../studentfeepayment/addstudentfeepayment/addstudentfeepayment.component';
import { FeereceiptComponent } from '../studentfeepayment/feereceipt/feereceipt.component';
import { SharedataService } from '../../../shared/sharedata.service';
import { ContentService } from 'src/app/shared/content.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-studentprimaryinfo',
  templateUrl: './studentprimaryinfo.component.html',
  styleUrls: ['./studentprimaryinfo.component.scss']
})
export class studentprimaryinfoComponent implements OnInit {
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
  CountryId = 0;
  PrimaryContactDefaultId = 0;
  PrimaryContactOtherId = 0;
  displayContactPerson = false;
  studentForm: FormGroup;
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
    if (this.selectedFile.size > 60000) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Image size should be less than 80kb", globalconstants.ActionText, globalconstants.RedBackground);
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
    private fb: FormBuilder,
    private fileUploadService: FileUploadService,
    private shareddata: SharedataService,
    private tokenService: TokenStorageService,

  ) {
    //this.shareddata.CurrentGenders.subscribe(genders => (this.Genders = genders));
    //if (this.Genders.length == 0)
    //  this.route.navigate(["/edu"]);
    //else {
    this.studentForm = this.fb.group({
      ReasonForLeavingId: [0],
      StudentId: [0],
      FirstName: ['', [Validators.required]],
      LastName: [''],
      FatherName: ['', [Validators.required]],
      FatherOccupation: ['', [Validators.required]],
      MotherName: ['', [Validators.required]],
      MotherOccupation: ['', [Validators.required]],
      GenderId: [0, [Validators.required]],
      PresentAddress: ['', [Validators.required]],
      PermanentAddress: ['', [Validators.required]],
      DOB: [new Date(), [Validators.required]],
      BloodgroupId: [0, [Validators.required]],
      CategoryId: [0, [Validators.required]],
      ClassAdmissionSought: [0, [Validators.required]],
      ReligionId: [0, [Validators.required]],
      BankAccountNo: [''],
      IFSCCode: [''],
      MICRNo: [''],
      AadharNo: [''],
      Photo: [''],
      ContactNo: ['', [Validators.required]],
      WhatsAppNumber: ['', [Validators.required]],
      FatherContactNo: [''],
      MotherContactNo: [''],
      PrimaryContactFatherOrMother: [0],
      NameOfContactPerson: [''],
      RelationWithContactPerson: [''],
      ContactPersonContactNo: [''],
      AlternateContact: [''],
      EmailAddress: [''],
      LastSchoolPercentage: [''],
      TransferFromSchool: [''],
      TransferFromSchoolBoard: [''],
      ClubId: [0],
      AdmissionStatusId: [0],
      AdmissionDate: [new Date()],
      Remarks: [''],
      Active: [1]
    });
    this.StudentId = this.tokenService.getStudentId();
    this.StudentClassId = this.tokenService.getStudentClassId()
  }

  ngOnInit(): void {
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

        this.SelectedBatchId = +this.tokenService.getSelectedBatchId();
        this.GetMasterData();
        if (this.StudentId > 0)
          this.GetStudent();
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
    this.Edit = true;
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
        this.AdmissionStatuses = this.getDropDownData(globalconstants.MasterDefinitions.school.ADMISSIONSTATUS);

        this.Location = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        this.PrimaryContactDefaultId = this.PrimaryContact.filter(contact => contact.MasterDataName.toLowerCase() == "father")[0].MasterDataId;
        this.PrimaryContactOtherId = this.PrimaryContact.filter(contact => contact.MasterDataName.toLowerCase() == "other")[0].MasterDataId;
        this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
        this.studentForm.patchValue({ PrimaryContactFatherOrMother: this.PrimaryContactDefaultId });
        this.studentForm.patchValue({ ReasonForLeavingId: this.ReasonForLeaving.filter(r => r.MasterDataName.toLowerCase() == 'active')[0].MasterDataId });
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
  SaveOrUpdate() {
    var errorMessage = '';
    if (this.studentForm.get("FirstName").value == 0) {
      errorMessage += "First Name is required.\n";
    }
    if (this.studentForm.get("FatherName").value == 0) {
      errorMessage += "Father name is required.\n";

    }
    if (this.studentForm.get("BloodgroupId").value == 0) {
      errorMessage += "Please select blood group.\n";

    }
    if (this.studentForm.get("GenderId").value == 0) {
      errorMessage += "Please select gender.\n";

    }
    if (this.studentForm.get("ReligionId").value == 0) {
      errorMessage += "Please select religion.\n";

    }
    if (this.studentForm.get("CategoryId").value == 0) {
      errorMessage += "Please select Category.\n";
    }
    if (this.studentForm.get("ClassAdmissionSought").value == 0) {
      errorMessage += "Please select Class for which admission is sought.\n";
    }
    if (this.studentForm.get("AdmissionStatusId").value == 0) {
      errorMessage += "Please select admission status.\n";
    }
    if (this.studentForm.get("ContactNo").value == 0) {
      errorMessage += "Please provide contact no..\n";
    }
    if (this.studentForm.get("WhatsAppNumber").value == 0) {
      errorMessage += "Please provide whatsapp no..\n";
    }

    if (errorMessage.length > 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar(errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
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
      GenderId: this.studentForm.get("GenderId").value,
      PermanentAddress: this.studentForm.get("PermanentAddress").value,
      PresentAddress: this.studentForm.get("PresentAddress").value,
      DOB: this.adjustDateForTimeOffset(this.studentForm.get("DOB").value),
      BloodgroupId: this.studentForm.get("BloodgroupId").value,
      CategoryId: this.studentForm.get("CategoryId").value,
      BankAccountNo: this.studentForm.get("BankAccountNo").value,
      IFSCCode: this.studentForm.get("IFSCCode").value,
      MICRNo: this.studentForm.get("MICRNo").value,
      AadharNo: this.studentForm.get("AadharNo").value,
      Photo: this.studentForm.get("Photo").value,
      ReligionId: this.studentForm.get("ReligionId").value,
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
      ClubId: this.studentForm.get("ClubId").value,
      AdmissionStatusId: this.studentForm.get("AdmissionStatusId").value,
      AdmissionDate: this.studentForm.get("AdmissionDate").value,
      Remarks: this.studentForm.get("Remarks").value,
      EmailAddress: _email,
      Active: this.studentForm.get("Active").value == true ? 1 : 0,
      ReasonForLeavingId: this.studentForm.get("ReasonForLeavingId").value,
      OrgId: this.loginUserDetail[0]["orgId"],
      BatchId: this.tokenService.getSelectedBatchId()
    });
    //debugger;
    //console.log("studentData", this.studentData)
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
          console.log(error)
          var errormsg = globalconstants.formatError(error);
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
            let StudentName = stud.PID + ' ' + stud.FirstName + ' ' + stud.LastName + ' ' + stud.FatherName +
              ' ' + stud.MotherName + ',';
            this.shareddata.ChangeStudentName(StudentName);
            this.studentForm.patchValue({
              StudentId: stud.StudentId,
              FirstName: stud.FirstName,
              LastName: stud.LastName,
              FatherName: stud.FatherName,
              MotherName: stud.MotherName,
              FatherOccupation: stud.FatherOccupation,
              MotherOccupation: stud.MotherOccupation,
              PresentAddress: stud.PresentAddress,
              PermanentAddress: stud.PermanentAddress,
              DOB: new Date(stud.DOB),//this.formatdate.transform(stud.DOB,'dd/MM/yyyy'),
              GenderId: stud.GenderId,
              BloodgroupId: stud.BloodgroupId,
              CategoryId: stud.CategoryId,
              ReligionId: stud.ReligionId,
              BankAccountNo: stud.BankAccountNo,
              IFSCCode: stud.IFSCCode,
              MICRNo: stud.MICRNo,
              AadharNo: stud.AadharNo,
              Photo: stud.Photo,
              ContactNo: stud.ContactNo,
              WhatsAppNumber: stud.WhatsAppNumber,
              FatherContactNo: stud.FatherContactNo,
              MotherContactNo: stud.MotherContactNo,
              PrimaryContactFatherOrMother: stud.PrimaryContactFatherOrMother,
              NameOfContactPerson: stud.NameOfContactPerson,
              RelationWithContactPerson: stud.RelationWithContactPerson,
              ContactPersonContactNo: stud.ContactPersonContactNo,
              AlternateContact: stud.AlternateContact,
              EmailAddress: stud.EmailAddress,
              LastSchoolPercentage: stud.LastSchoolPercentage,
              ClassAdmissionSought: stud.ClassAdmissionSought,
              TransferFromSchool: stud.TransferFromSchool,
              TransferFromSchoolBoard: stud.TransferFromSchoolBoard,
              ClubId: stud.ClubId,
              AdmissionStatusId: stud.AdmissionStatusId,
              AdmissionDate: stud.AdmissionDate,
              Remarks: stud.Remarks,
              Active: stud.Active,
              ReasonForLeavingId: stud.ReasonForLeavingId
            })
            // if(this.studentForm.get("EmailAddress").value !="")
            // {
            //   this.studentForm.get("EmailAddress").disable();
            // }
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
        this.loading = false; this.PageLoading = false;
      },
        err => {
          console.log("error", err)
        });
  }

}
