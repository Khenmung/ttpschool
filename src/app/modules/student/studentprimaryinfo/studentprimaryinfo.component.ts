import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { AlertService } from '../../../shared/components/alert/alert.service';
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
  @ViewChild(AddstudentclassComponent) studentClass: AddstudentclassComponent;
  @ViewChild(AddstudentfeepaymentComponent) studentFeePayment: AddstudentfeepaymentComponent;
  @ViewChild(FeereceiptComponent) feeReceipt: FeereceiptComponent;
  // @ViewChild(StudentDocumentComponent) studentDocument: StudentDocumentComponent;
  // @ViewChild(GenerateCertificateComponent) gencertificate: GenerateCertificateComponent;
  Edit = false;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
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
  //Country = [];
  Genders = [];
  Category = [];
  Bloodgroup = [];
  Religion = [];
  //States = [];
  Permission = '';
  PrimaryContact = [];
  Location = [];
  allMasterData = [];
  ReasonForLeaving = [];
  studentData = [];
  CountryId = 0;
  PrimaryContactDefaultId = 0;
  PrimaryContactOtherId = 0;
  displayContactPerson = false;
  studentForm: FormGroup;

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
      this.loading = false;
      this.alert.error("Image size should be less than 80kb", this.optionsNoAutoClose);
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
    if(this.selectedFile==undefined)
    {
      this.loading=false;
      this.alert.error("Please select a file.",this.optionsAutoClose);
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
    //this.formData.append("Image", <File>base64ToFile(this.croppedImage),this.fileName);
    this.fileUploadService.postFiles(this.formdata).subscribe(res => {
      this.loading = false;
      this.alertMessage.success("Files Uploaded successfully.", options);

      this.Edit = false;
    });
  }

  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService,
    private fb: FormBuilder,
    private alertMessage: AlertService,
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
      Gender: [0, [Validators.required]],
      PresentAddress: ['', [Validators.required]],
      PermanentAddress: ['', [Validators.required]],
      DOB: [new Date(), [Validators.required]],
      Bloodgroup: [0, [Validators.required]],
      Category: [0, [Validators.required]],
      BankAccountNo: [''],
      IFSCCode: [''],
      MICRNo: [''],
      AadharNo: [''],
      Photo: [''],
      Religion: [''],
      ContactNo: [''],
      WhatsAppNumber: [''],
      FatherContactNo: [''],
      MotherContactNo: [''],
      PrimaryContactFatherOrMother: [0],
      NameOfContactPerson: [''],
      RelationWithContactPerson: [''],
      ContactPersonContactNo: [''],
      AlternateContact: [''],
      EmailAddress: [''],
      ClassAdmissionSought: [0],
      LastSchoolPercentage: [''],
      TransferFromSchool: [''],
      TransferFromSchoolBoard: [''],
      Remarks: [''],
      Active: [1]
    });
    this.StudentId = this.tokenService.getStudentId();
    this.StudentClassId = this.tokenService.getStudentClassId()
    // this.shareddata.CurrentMasterData.subscribe(message => (this.allMasterData = message));

    // this.shareddata.CurrentCountry.subscribe(country => (this.Country == country));
    // this.shareddata.CurrentBloodgroup.subscribe(bg => (this.Bloodgroup == bg));
    // this.shareddata.CurrentCategory.subscribe(cat => (this.Category = cat));
    // this.shareddata.CurrentReligion.subscribe(re => (this.Religion = re));
    // this.shareddata.CurrentStates.subscribe(st => (this.States = st));
    // this.shareddata.CurrentLocation.subscribe(lo => (this.Location = lo));
    // this.shareddata.CurrentPrimaryContact.subscribe(pr => (this.PrimaryContact = pr));


    // //console.log("this.StudentClassId",this.StudentClassId)
    // this.shareddata.CurrentBloodgroup.subscribe(bg => (this.Bloodgroup = bg));
    // this.shareddata.CurrentStudentName.subscribe(s => (this.StudentName = s));
    // this.shareddata.CurrentReasonForLeaving.subscribe(r => (this.ReasonForLeaving = r))

    //}
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
        //var SelectedBatchId = this.tokenService.getSelectedBatchId();
        this.GetMasterData();
        if (this.StudentId > 0)
          this.GetStudent();
        this.contentservice.GetClasses(this.loginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
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
        //this.Country = this.getDropDownData(globalconstants.MasterDefinitions.common.COUNTRY);
        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
        //    this.States = this.getDropDownData(globalconstants.MasterDefinitions.common.STATE);
        this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
        this.Location = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        //this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASS);
        //this.CountryId = this.Country.filter(country => country.MasterDataName.toLowerCase() == "india")[0].MasterDataId;
        this.PrimaryContactDefaultId = this.PrimaryContact.filter(contact => contact.MasterDataName.toLowerCase() == "father")[0].MasterDataId;
        this.PrimaryContactOtherId = this.PrimaryContact.filter(contact => contact.MasterDataName.toLowerCase() == "other")[0].MasterDataId;
        //this.studentForm.patchValue({ Country: this.CountryId });
        this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
        this.studentForm.patchValue({ PrimaryContactFatherOrMother: this.PrimaryContactDefaultId });
        //      this.studentForm.patchValue({ State: this.States.filter(state => state.MasterDataName.toUpperCase() == "MANIPUR")[0].MasterDataId });
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
  SaveOrUpdate() {
    var errorMessage = '';
    if (this.studentForm.get("FirstName").value == 0) {
      errorMessage += "First Name is required.<br>";
    }
    if (this.studentForm.get("FatherName").value == 0) {
      errorMessage += "Father name is required.<br>";

    }
    if (this.studentForm.get("Bloodgroup").value == 0) {
      errorMessage += "Please select blood group.<br>";

    }
    if (this.studentForm.get("Gender").value == 0) {
      errorMessage += "Please select gender.<br>";

    }
    if (this.studentForm.get("Category").value == 0) {
      errorMessage += "Please select Category.<br>";
    }
    if (errorMessage.length > 0) {
      this.loading = false;
      this.alert.error(errorMessage, this.optionsNoAutoClose);
      return;
    }
    this.loading = true;
    this.studentData.push({
      FirstName: this.studentForm.get("FirstName").value,
      LastName: this.studentForm.get("LastName").value,
      FatherName: this.studentForm.get("FatherName").value,
      FatherOccupation: this.studentForm.get("FatherOccupation").value,
      MotherName: this.studentForm.get("MotherName").value,
      MotherOccupation: this.studentForm.get("MotherOccupation").value,
      Gender: this.studentForm.get("Gender").value,
      PermanentAddress: this.studentForm.get("PermanentAddress").value,
      PresentAddress: this.studentForm.get("PresentAddress").value,
      DOB: this.adjustDateForTimeOffset(this.studentForm.get("DOB").value),
      Bloodgroup: this.studentForm.get("Bloodgroup").value,
      Category: this.studentForm.get("Category").value,
      BankAccountNo: this.studentForm.get("BankAccountNo").value,
      IFSCCode: this.studentForm.get("IFSCCode").value,
      MICRNo: this.studentForm.get("MICRNo").value,
      AadharNo: this.studentForm.get("AadharNo").value,
      Photo: this.studentForm.get("Photo").value,
      Religion: this.studentForm.get("Religion").value,
      ContactNo: this.studentForm.get("ContactNo").value,
      WhatsAppNumber: this.studentForm.get("WhatsAppNumber").value,
      FatherContactNo: this.studentForm.get("FatherContactNo").value,
      MotherContactNo: this.studentForm.get("MotherContactNo").value,
      PrimaryContactFatherOrMother: this.studentForm.get("PrimaryContactFatherOrMother").value,
      NameOfContactPerson: this.studentForm.get("NameOfContactPerson").value,
      RelationWithContactPerson: this.studentForm.get("RelationWithContactPerson").value,
      ContactPersonContactNo: this.studentForm.get("ContactPersonContactNo").value,
      AlternateContact: this.studentForm.get("AlternateContact").value,
      EmailAddress: this.studentForm.get("EmailAddress").value,
      ClassAdmissionSought: this.studentForm.get("ClassAdmissionSought").value,
      LastSchoolPercentage: this.studentForm.get("LastSchoolPercentage").value,
      TransferFromSchool: this.studentForm.get("TransferFromSchool").value,
      TransferFromSchoolBoard: this.studentForm.get("TransferFromSchoolBoard").value,
      Remarks: this.studentForm.get("Remarks").value,
      Active: this.studentForm.get("Active").value == true ? 1 : 0,
      ReasonForLeavingId: this.studentForm.get("ReasonForLeavingId").value,
      OrgId: this.loginUserDetail[0]["orgId"]
    });
    //onsole.log("studentData", this.studentData)
    if (this.studentForm.get("StudentId").value == 0)
      this.save();
    else
      this.update();
  }

  save() {
    this.studentForm.patchValue({ AlternateContact: "" });

    this.dataservice.postPatch('Students', this.studentData, 0, 'post')
      .subscribe((result: any) => {
        //debugger;
        if (result != undefined) {
          this.studentForm.patchValue({
            StudentId: result.StudentId
          })
          this.StudentId = result.StudentId;
          this.loading = false;
          this.alert.success("Student's data saved successfully.", this.optionsAutoClose);

        }

      }, error => console.log(error))
  }
  update() {
    ////console.log('student', this.studentForm.value)

    this.dataservice.postPatch('Students', this.studentData[0], +this.studentForm.get("StudentId").value, 'patch')
      .subscribe((result: any) => {
        //if (result.value.length > 0 )
        this.loading = false;
        this.alert.success("Student's data updated successfully.", this.optionsAutoClose);
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
    list.lookupFields = ["StorageFnPs($select=FileId,FileName;$filter=StudentId eq " + this.StudentId + ")"]
    list.filter = ["StudentId eq " + this.StudentId];

    //debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          data.value.forEach(stud => {

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
              Gender: stud.Gender,
              DOB: new Date(stud.DOB),//this.formatdate.transform(stud.DOB,'dd/MM/yyyy'),
              Bloodgroup: stud.Bloodgroup,
              Category: stud.Category,
              BankAccountNo: stud.BankAccountNo,
              IFSCCode: stud.IFSCCode,
              MICRNo: stud.MICRNo,
              AadharNo: stud.AadharNo,
              Photo: stud.Photo,
              Religion: stud.Religion,
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
              Remarks: stud.Remarks,
              Active: stud.Active,
              ReasonForLeavingId: stud.ReasonForLeavingId
            })

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
          this.alert.error("No data found.", this.optionsAutoClose);
        }
        this.loading = false;
      });
  }
}
