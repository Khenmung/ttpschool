import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { FileUploadService } from 'src/app/shared/upload.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {

  Edit = false;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  loginUserDetail = [];
  EmployeeLeaving = false;
  EmployeeName = '';
  selectedIndex: number = 0;
  imagePath: string;
  message: string;
  imgURL: any;
  selectedFile: any;
  Albums: any;
  errorMessage = '';
  formdata: FormData;
  EmployeeId = 0;
  loading = false;
  WorkNature =[];
  MaritalStatus =[];
  EmploymentStatus = [];
  EmploymentTypes = [];
  Grades = [];
  Genders = [];
  Category = [];
  City=[];
  State = [];
  Country = [];
  Bloodgroup = [];
  Religion = [];
  PrimaryContact = [];
  Location = [];
  allMasterData = [];
  ReasonForLeaving = [];
  EmployeeData = {};
  CountryId = 0;
  LocationId = 0;
  PrimaryContactDefaultId = 0;
  PrimaryContactOtherId = 0;
  displayContactPerson = false;
  EmployeeForm: FormGroup;

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
    debugger;
    let error: boolean = false;
    this.loading = true;
    this.formdata = new FormData();
    this.formdata.append("description", "Passport photo of Employee");
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "EmployeePhoto");
    this.formdata.append("parentId", "-1");

    this.formdata.append("batchId", "0");
    this.formdata.append("orgName", this.loginUserDetail[0]["org"]);
    this.formdata.append("orgId", this.loginUserDetail[0]["orgId"]);
    this.formdata.append("pageId", "0");

    if (this.EmployeeId != null && this.EmployeeId != 0)
      this.formdata.append("EmployeeId", this.EmployeeId + "");
    //this.formdata.append("EmployeeClassId", this.EmployeeClassId.toString());
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

    this.shareddata.CurrentGenders.subscribe(genders => (this.Genders = genders));
    if (this.Genders.length == 0)
      this.route.navigate(['/employee/']);
    else {
      this.shareddata.CurrentMasterData.subscribe(message => (this.allMasterData = message));

      //this.shareddata.CurrentCountry.subscribe(country => (this.Country == country));
      this.shareddata.CurrentBloodgroup.subscribe(bg => (this.Bloodgroup == bg));
      this.shareddata.CurrentCategory.subscribe(cat => (this.Category = cat));
      this.shareddata.CurrentReligion.subscribe(re => (this.Religion = re));
      //this.shareddata.CurrentStates.subscribe(st => (this.States = st));
      this.shareddata.CurrentLocation.subscribe(lo => (this.Location = lo));
      //this.shareddata.CurrentPrimaryContact.subscribe(pr => (this.PrimaryContact = pr));

      this.shareddata.CurrentBloodgroup.subscribe(bg => (this.Bloodgroup = bg));
      this.shareddata.CurrentEmployeeName.subscribe(s => (this.EmployeeName = s));
      //this.shareddata.CurrentReasonForLeaving.subscribe(r => (this.ReasonForLeaving = r))
      this.EmployeeForm = this.fb.group({
        ShortName:[''],
        FirstName:['',[Validators.required]],
        LastName:[''],
        FatherName:[''],
        MotherName:[''],
        Gender:[0],
        DOB:['',[Validators.required]],
        DOJ:['',[Validators.required]],
        Bloodgroup:[0],
        CategoryId:[0],
        BankAccountNo:[''],
        IFSCcode:[''],
        MICRNo:[''],
        AdhaarNo:[''],
        PhotoPath:[''],
        ReligionId:[0],
        ContactNo:[''],
        WhatsappNo:[''],
        AlternateContactNo:[''],
        EmailAddress:[''],
        EmergencyContactNo:[''],
        EmploymentStatusId:[0],
        EmploymentTypeId:[0],
        ConfirmationDate:[''],
        NoticePeriodDays:[0],
        ProbationPeriodDays:[0],
        PAN:[''],
        PassportNo:[''],
        AadharNo:[''],
        MaritalStatusId:[0],
        MarriedDate:[''],
        PFAccountNo:[''],
        NatureId:[0],
        EmployeeCode:[''],
        Active:[0],
        Remarks:[''],
        PresentAddress:[''],
        PermenentAddress:[''],
        PresentAddressCityId:[0],
        PresentAddressStateId:[0],
        PresentAddressCountryId:[0],
        PermanentAddressCityId:[0],
        PermanentAddressStateId:[0],
        PermanentAddressCountryId:[0]
      });
    }
  }

  ngOnInit(): void {
    this.loginUserDetail = this.tokenService.getUserDetail();
    this.EmployeeId = this.tokenService.getEmployeeId();
    if (this.EmployeeId > 0)
      this.GetEmployee();
    else
      this.route.navigate(['/employee/']);
    // this.contentservice.GetClasses(this.loginUserDetail[0]["orgId"]).subscribe((data: any) => {
    //   this.Grades = [...data.value];
    // });
  }
  @ViewChildren("allTabs") allTabs: QueryList<any>

  ngAfterViewInit() {
    //console.log('total tabs: ' + this.allTabs.first._tabs.length);
  }

  get f() { return this.EmployeeForm.controls }

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
    // switch (indx) {
    //   case 4:
    //     this.EmployeeClass.PageLoad();
    //     break;
    //   case 5:
    //     this.EmployeeDocument.PageLoad();
    //     break;
    // }
  }
  back() {
    this.route.navigate(['/edu/home']);
  }
  deActivate(event) {
    if (!event.checked)
      this.EmployeeLeaving = true;
    else {
      this.EmployeeLeaving = false;
      this.EmployeeForm.patchValue({ ReasonForLeavingId: this.ReasonForLeaving.filter(r => r.MasterDataName.toLowerCase() == 'active')[0].MasterDataId });
    }
  }
  GetMasterData() {

    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 or OrgId eq " + this.loginUserDetail[0]["orgId"] + ")"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        this.allMasterData = [...data.value];
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.employee.GENDER);
        this.Country = this.getDropDownData(globalconstants.MasterDefinitions.common.COUNTRY);
        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
        this.City = this.getDropDownData(globalconstants.MasterDefinitions.common.CITY);
        this.State = this.getDropDownData(globalconstants.MasterDefinitions.common.STATE);
        this.Location = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        this.MaritalStatus = this.getDropDownData(globalconstants.MasterDefinitions.employee.MARITALSTATUS);
        this.WorkNature = this.getDropDownData(globalconstants.MasterDefinitions.employee.NATURE);
        
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
    this.loading = true;
    this.EmployeeData = {
      EmpEmployeeId: this.EmployeeForm.get("EmpEmployeeId").value,
      ShortName: this.EmployeeForm.get("ShortName").value,
      FirstName: this.EmployeeForm.get("FirstName").value,
      LastName: this.EmployeeForm.get("LastName").value,
      FatherName: this.EmployeeForm.get("FatherName").value,
      MotherName: this.EmployeeForm.get("MotherName").value,
      Gender: this.EmployeeForm.get("Gender").value,
      Address: this.EmployeeForm.get("Address").value,
      DOB: this.EmployeeForm.get("DOB").value,
      DOJ: this.EmployeeForm.get("DOJ").value,
      Bloodgroup: this.EmployeeForm.get("Bloodgroup").value,
      CategoryId: this.EmployeeForm.get("CategoryId").value,
      BankAccountNo: this.EmployeeForm.get("BankAccountNo").value,
      IFSCcode: this.EmployeeForm.get("IFSCcode").value,
      MICRNo: this.EmployeeForm.get("MICRNo").value,
      AdhaarNo: this.EmployeeForm.get("AdhaarNo").value,
      PhotoPath: this.EmployeeForm.get("PhotoPath").value,
      ReligionId: this.EmployeeForm.get("ReligionId").value,
      ContactNo: this.EmployeeForm.get("ContactNo").value,
      WhatsappNo: this.EmployeeForm.get("WhatsappNo").value,
      AlternateContactNo: this.EmployeeForm.get("AlternateContactNo").value,
      EmailAddress: this.EmployeeForm.get("EmailAddress").value,
      EmergencyContactNo: this.EmployeeForm.get("EmergencyContactNo").value,
      EmploymentStatusId: this.EmployeeForm.get("EmploymentStatusId").value,
      EmploymentTypeId: this.EmployeeForm.get("EmploymentTypeId").value,
      ConfirmationDate: this.EmployeeForm.get("ConfirmationDate").value,
      NoticePeriodDays: this.EmployeeForm.get("NoticePeriodDays").value,
      ProbationPeriodDays: this.EmployeeForm.get("ProbationPeriodDays").value,
      PAN: this.EmployeeForm.get("PAN").value,
      PassportNo: this.EmployeeForm.get("PassportNo").value,
      AadharNo: this.EmployeeForm.get("AadharNo").value,
      MaritalStatusId: this.EmployeeForm.get("MaritalStatusId").value,
      MarriedDate: this.EmployeeForm.get("MarriedDate").value,
      PFAccountNo: this.EmployeeForm.get("PFAccountNo").value,
      NatureId: this.EmployeeForm.get("NatureId").value,
      EmployeeCode: this.EmployeeForm.get("EmployeeCode").value,
      Active: this.EmployeeForm.get("Active").value,
      Remarks: this.EmployeeForm.get("Remarks").value,
      PresentAddress: this.EmployeeForm.get("PresentAddress").value,
      PresentAddressCityId: this.EmployeeForm.get("PresentAddressCityId").value,
      PresentAddressStateId: this.EmployeeForm.get("PresentAddressStateId").value,
      PresentAddressCountryId: this.EmployeeForm.get("PresentAddressCountryId").value,
      PermanentAddressCityId: this.EmployeeForm.get("PermanentAddressCityId").value,
      PermanentAddressStateId: this.EmployeeForm.get("PermanentAddressStateId").value,
      PermanentAddressCountryId: this.EmployeeForm.get("PermanentAddressCountryId").value,
      PermenentAddress: this.EmployeeForm.get("PermenentAddress").value
    }
    if (this.EmployeeForm.get("EmployeeId").value == 0)
      this.save();
    else
      this.update();
  }

  save() {
    this.EmployeeForm.patchValue({ AlternateContact: "" });

    this.dataservice.postPatch('EmpEmployees', this.EmployeeData, 0, 'post')
      .subscribe((result: any) => {
        //debugger;
        if (result != undefined) {
          this.EmployeeForm.patchValue({
            EmployeeId: result.EmployeeId
          })
          this.loading = false;
          this.alert.success("Employee's data saved successfully.", this.options);

        }

      }, error => console.log(error))
  }
  update() {
    //console.log('Employee', this.EmployeeForm.value)

    this.dataservice.postPatch('EmpEmployees', this.EmployeeData, +this.EmployeeForm.get("EmpEmployeeId").value, 'patch')
      .subscribe((result: any) => {
        //if (result.value.length > 0 )
        this.loading = false;
        this.alert.success("Employee's data updated successfully.", this.options);
      })
  }
  adjustDateForTimeOffset(dateToAdjust) {
    //console.log(dateToAdjust)
    var offsetMs = dateToAdjust.getTimezoneOffset() * 60000;
    return new Date(dateToAdjust.getTime() - offsetMs);
  }
  GetEmployee() {
    let list: List = new List();
    list.fields = ["*"];//"EmployeeId", "Name", "FatherName", "MotherName", "FatherContactNo", "MotherContactNo", "Active"];
    list.PageName = "EmpEmployees";
    list.lookupFields = ["StorageFnPs($select=FileName;$filter=EmployeeId eq " + this.EmployeeId + ")"]
    list.filter = ["EmpEmployeeId eq " + this.EmployeeId];
    //list.orderBy = "ParentId";
    //debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          data.value.forEach(stud => {
            this.EmployeeForm.patchValue({
              "EmpEmployeeId": stud.EmpEmployeeId,
              "ShortName": stud.ShortName,
              "FirstName": stud.FirstName,
              "LastName": stud.LastName,
              "FatherName": stud.FatherName,
              "MotherName": stud.MotherName,
              "Gender": stud.Gender,
              "DOB": stud.DOB,
              "DOJ": stud.DOJ,
              "Bloodgroup": stud.Bloodgroup,
              "CategoryId": stud.CategoryId,
              "BankAccountNo": stud.BankAccountNo,
              "IFSCcode": stud.IFSCcode,
              "MICRNo": stud.MICRNo,
              "AdhaarNo": stud.AdhaarNo,
              "PhotoPath": stud.PhotoPath,
              "ReligionId": stud.ReligionId,
              "ContactNo": stud.ContactNo,
              "WhatsappNo": stud.WhatsappNo,
              "AlternateContactNo": stud.AlternateContactNo,
              "EmailAddress": stud.EmailAddress,
              "EmergencyContactNo": stud.EmergencyContactNo,
              "EmploymentStatusId": stud.EmploymentStatusId,
              "EmploymentTypeId": stud.EmploymentTypeId,
              "ConfirmationDate": stud.ConfirmationDate,
              "NoticePeriodDays": stud.NoticePeriodDays,
              "ProbationPeriodDays": stud.ProbationPeriodDays,
              "PAN": stud.PAN,
              "PassportNo": stud.PassportNo,
              "AadharNo": stud.AadharNo,
              "MaritalStatusId": stud.MaritalStatusId,
              "MarriedDate": stud.MarriedDate,
              "PFAccountNo": stud.PFAccountNo,
              "NatureId": stud.NatureId,
              "EmployeeCode": stud.EmployeeCode,
              "Active": stud.Active,
              "Remarks": stud.Remarks,
              "PresentAddress": stud.PresentAddress,
              "PresentAddressCityId": stud.PresentAddressCityId,
              "PresentAddressStateId": stud.PresentAddressStateId,
              "PresentAddressCountryId": stud.PresentAddressCountryId,
              "PermanentAddress,": stud.PermanentAddress,
              "PermanentAddressCityId": stud.PermanentAddressCityId,
              "PermanentAddressStateId": stud.PermanentAddressStateId,
              "PermanentAddressCountryId": stud.PermanentAddressCountryId,
            });
            if (stud.PrimaryContactFatherOrMother == this.PrimaryContactOtherId)
              this.displayContactPerson = true;
            else
              this.displayContactPerson = false;
            if (stud.StorageFnPs.length > 0)
              this.imgURL = globalconstants.apiUrl + "/Uploads/" + this.loginUserDetail[0]["org"] +
                "/EmployeePhoto/" + stud.StorageFnPs[0].FileName;
          })
        }
        else {
          this.alert.error("No data found.", this.options);
        }
      });
  }
}

