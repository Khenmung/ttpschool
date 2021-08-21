import { DatePipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { StudentDocumentComponent } from '../StudentDocument/uploadstudentdocument/uploadstudentdoc.component';
import { SharedataService } from '../../../shared/sharedata.service';

@Component({
  selector: 'app-addstudent',
  templateUrl: './addstudent.component.html',
  styleUrls: ['./addstudent.component.scss']
})
export class AddstudentComponent implements OnInit {
  @ViewChild(AddstudentclassComponent) studentClass: AddstudentclassComponent;
  @ViewChild(AddstudentfeepaymentComponent) studentFeePayment: AddstudentfeepaymentComponent;
  @ViewChild(FeereceiptComponent) feeReceipt: FeereceiptComponent;
  @ViewChild(StudentDocumentComponent) studentDocument: StudentDocumentComponent;
  Edit = false;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
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
  Id = 0;
  loading = false;
  Classes = [];
  Country = [];
  Genders = [];
  Category = [];
  Bloodgroup = [];
  Religion = [];
  States = [];
  PrimaryContact = [];
  Location = [];
  allMasterData = [];
  ReasonForLeaving = [];
  studentData = {};
  CountryId = 0;
  LocationId = 0;
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
    this.selectedFile = files[0];
    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }
  }
  uploadFile() {
    let error: boolean = false;
    this.formdata = new FormData();
    this.formdata.append("description", "Passport photo of student");
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "StudentPhoto");
    this.formdata.append("parentId", "-1");

    if (this.Id != null || this.Id != 0)
      this.formdata.append("StudentId", this.Id.toString());
    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    this.uploadImage();
  }

  uploadImage() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    //this.formData.append("Image", <File>base64ToFile(this.croppedImage),this.fileName);
    this.fileUploadService.postFile(this.formdata).subscribe(res => {
      this.alertMessage.success("Files Uploaded successfully.", options);
      this.Edit = false;
    });
  }

  constructor(private dataservice: NaomitsuService,
    private routeUrl: ActivatedRoute,
    private route: Router,
    private alert: AlertService,
    private fb: FormBuilder,
    private formatdate: DatePipe,
    private alertMessage: AlertService,
    private fileUploadService: FileUploadService,
    private shareddata: SharedataService
  ) {
    this.shareddata.CurrentMasterData.subscribe(message => (this.allMasterData = message));
    this.shareddata.CurrentGenders.subscribe(genders => (this.Genders = genders));
    this.shareddata.CurrentCountry.subscribe(country => (this.Country == country));
    this.shareddata.CurrentBloodgroup.subscribe(bg => (this.Bloodgroup == bg));
    this.shareddata.CurrentCategory.subscribe(cat => (this.Category = cat));
    this.shareddata.CurrentReligion.subscribe(re => (this.Religion = re));
    this.shareddata.CurrentStates.subscribe(st => (this.States = st));
    this.shareddata.CurrentClasses.subscribe(cls => (this.Classes = cls));
    this.shareddata.CurrentLocation.subscribe(lo => (this.Location = lo));
    this.shareddata.CurrentPrimaryContact.subscribe(pr => (this.PrimaryContact = pr));
    this.shareddata.CurrentStudentId.subscribe(id => (this.Id = id));
    this.shareddata.CurrentStudentClassId.subscribe(scid => (this.StudentClassId = scid));
    this.shareddata.CurrentBloodgroup.subscribe(bg => (this.Bloodgroup = bg));
    this.shareddata.CurrentStudentName.subscribe(s => (this.StudentName = s));
    this.shareddata.CurrentReasonForLeaving.subscribe(r => (this.ReasonForLeaving = r))
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
      City: [0],
      //Pincode: new FormControl('', [Validators.required]),
      //State: [0],
      Country: [0],
      DOB: [new Date(), [Validators.required]],
      Bloodgroup: [0],
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
      Active: [1],
      LocationId: [0]
    });

  }

  ngOnInit(): void {

    if (this.Id > 0)
      this.GetStudent();
  }
  @ViewChildren("allTabs") allTabs: QueryList<any>

  ngAfterViewInit() {
    //console.log('total tabs: ' + this.allTabs.first._tabs.length);
  }

  get f() { return this.studentForm.controls }

  edit() {
    this.Edit = true;
  }

  tabChanged(tabChangeEvent: number) {
    this.selectedIndex = tabChangeEvent;
    this.navigateTab(this.selectedIndex);
    //   console.log('tab selected: ' + tabChangeEvent);
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
      case 5:
        this.studentDocument.PageLoad();
        break;          
    }
  }
  back() {
    this.route.navigate(['/admin/dashboardstudent']);
  }
  deActivate(event) {
    if (!event.checked)
      this.StudentLeaving = true;
    else {
      this.StudentLeaving = false;
      this.studentForm.patchValue({ReasonForLeavingId:this.ReasonForLeaving.filter(r=>r.MasterDataName.toLowerCase()=='active')[0].MasterDataId});
    }
  }
  GetMasterData() {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        this.allMasterData = [...data.value];
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
        this.Country = this.getDropDownData(globalconstants.MasterDefinitions.school.COUNTRY);
        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.school.BLOODGROUP);
        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.school.CATEGORY);
        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.school.RELIGION);
        this.States = this.getDropDownData(globalconstants.MasterDefinitions.school.STATE);
        this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
        this.Location = this.getDropDownData(globalconstants.MasterDefinitions.applications.LOCATION);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASS);
        this.CountryId = this.Country.filter(country => country.MasterDataName.toLowerCase() == "india")[0].MasterDataId;
        this.LocationId = this.Location.filter(location => location.MasterDataName.toLowerCase() == "lamka")[0].MasterDataId;
        this.PrimaryContactDefaultId = this.PrimaryContact.filter(contact => contact.MasterDataName.toLowerCase() == "father")[0].MasterDataId;
        this.PrimaryContactOtherId = this.PrimaryContact.filter(contact => contact.MasterDataName.toLowerCase() == "other")[0].MasterDataId;
        this.studentForm.patchValue({ Country: this.CountryId });
        this.studentForm.patchValue({ LocationId: this.LocationId });
        this.studentForm.patchValue({ PrimaryContactFatherOrMother: this.PrimaryContactDefaultId });
        this.studentForm.patchValue({ State: this.States.filter(state => state.MasterDataName.toUpperCase() == "MANIPUR")[0].MasterDataId });
        this.studentForm.patchValue({ReasonForLeavingId:this.ReasonForLeaving.filter(r=>r.MasterDataName.toLowerCase()=='active')[0].MasterDataId});
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
    this.loading =true;
    this.studentData = {
      FirstName: this.studentForm.get("FirstName").value,
      LastName: this.studentForm.get("LastName").value,
      FatherName: this.studentForm.get("FatherName").value,
      FatherOccupation: this.studentForm.get("FatherOccupation").value,
      MotherName: this.studentForm.get("MotherName").value,
      MotherOccupation: this.studentForm.get("MotherOccupation").value,
      Gender: this.studentForm.get("Gender").value,
      PermanentAddress: this.studentForm.get("PermanentAddress").value,
      PresentAddress: this.studentForm.get("PresentAddress").value,
      //City: this.studentForm.get("City").value,
      //Pincode: this.studentForm.get("Pincode").value,
      //State: this.studentForm.get("State").value,
      //Country: this.studentForm.get("Country").value,
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
      LocationId: this.studentForm.get("LocationId").value,
      ReasonForLeavingId: this.studentForm.get("ReasonForLeavingId").value,
    }
    //console.log("datato save", this.studentData);
    if (this.studentForm.get("StudentId").value == 0)
      this.save();
    else
      this.update();
  }

  save() {
    this.studentForm.patchValue({ AlternateContact: "" });

    this.dataservice.postPatch('Students', this.studentData, 0, 'post')
      .subscribe((result: any) => {
        debugger;
        if (result != undefined) {
          this.studentForm.patchValue({
            StudentId: result.StudentId
          })
          this.loading=false;
          this.alert.success("Student's data saved successfully.", this.options);

        }

      }, error => console.log(error))
  }
  update() {
    //console.log('student', this.studentForm.value)

    this.dataservice.postPatch('Students', this.studentData, +this.studentForm.get("StudentId").value, 'patch')
      .subscribe((result: any) => {
        //if (result.value.length > 0 )
        this.loading=false;
        this.alert.success("Student's data updated successfully.", this.options);
      })
  }
  adjustDateForTimeOffset(dateToAdjust) {
    //console.log(dateToAdjust)
    var offsetMs = dateToAdjust.getTimezoneOffset() * 60000;
    return new Date(dateToAdjust.getTime() - offsetMs);
  }
  GetStudent() {
    let list: List = new List();
    list.fields = ["*"];//"StudentId", "Name", "FatherName", "MotherName", "FatherContactNo", "MotherContactNo", "Active"];
    list.PageName = "Students";
    list.filter = ["StudentId eq " + this.Id];
    //list.orderBy = "ParentId";
    debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.studentForm.patchValue({
            StudentId: data.value[0].StudentId,
            FirstName: data.value[0].FirstName,
            LastName: data.value[0].LastName,
            FatherName: data.value[0].FatherName,
            MotherName: data.value[0].MotherName,
            FatherOccupation: data.value[0].FatherOccupation,
            MotherOccupation: data.value[0].MotherOccupation,
            PresentAddress: data.value[0].PresentAddress,
            PermanentAddress: data.value[0].PermanentAddress,
            Gender: data.value[0].Gender,
            Address: data.value[0].Address,
            City: data.value[0].City,
            Pincode: data.value[0].Pincode,
            State: data.value[0].State,
            Country: data.value[0].Country,
            DOB: new Date(data.value[0].DOB),//this.formatdate.transform(data.value[0].DOB,'dd/MM/yyyy'),
            Bloodgroup: data.value[0].Bloodgroup,
            Category: data.value[0].Category,
            BankAccountNo: data.value[0].BankAccountNo,
            IFSCCode: data.value[0].IFSCCode,
            MICRNo: data.value[0].MICRNo,
            AadharNo: data.value[0].AadharNo,
            Photo: data.value[0].Photo,
            Religion: data.value[0].Religion,
            ContactNo: data.value[0].ContactNo,
            WhatsAppNumber: data.value[0].WhatsAppNumber,
            FatherContactNo: data.value[0].FatherContactNo,
            MotherContactNo: data.value[0].MotherContactNo,
            PrimaryContactFatherOrMother: data.value[0].PrimaryContactFatherOrMother,
            NameOfContactPerson: data.value[0].NameOfContactPerson,
            RelationWithContactPerson: data.value[0].RelationWithContactPerson,
            ContactPersonContactNo: data.value[0].ContactPersonContactNo,
            AlternateContact: data.value[0].AlternateContact,
            EmailAddress: data.value[0].EmailAddress,
            LastSchoolPercentage: data.value[0].LastSchoolPercentage,
            ClassAdmissionSought: data.value[0].ClassAdmissionSought,
            TransferFromSchool: data.value[0].TransferFromSchool,
            TransferFromSchoolBoard: data.value[0].TransferFromSchoolBoard,
            Remarks: data.value[0].Remarks,
            Active: data.value[0].Active,
            LocationId: data.value[0].LocationId,
            ReasonForLeavingId: data.value[0].ReasonForLeavingId

          })
          if (data.value[0].PrimaryContactFatherOrMother == this.PrimaryContactOtherId)
            this.displayContactPerson = true;
          else
            this.displayContactPerson = false;

          this.imgURL = globalconstants.apiUrl + "/Image/StudentPhoto/" + data.value[0].Photo;
        }
        else {
          this.alert.error("No data found.", this.options);
        }
      });
  }
}
