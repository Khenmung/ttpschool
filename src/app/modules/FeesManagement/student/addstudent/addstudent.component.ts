import { DatePipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';

@Component({
  selector: 'app-addstudent',
  templateUrl: './addstudent.component.html',
  styleUrls: ['./addstudent.component.scss']
})
export class AddstudentComponent implements OnInit {
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };

  Id = 0;
  loading = false;
  Country = [];
  Gender = [];
  Category = [];
  Bloodgroup = [];
  Religion = [];
  States = [];
  PrimaryContact = [];
  Location = [];
  allMasterData = [];
  studentData = {};
  CountryId=0;
  LocationId=0;
    
  studentForm = this.fb.group({
    StudentId: [0],
    Name: ['', [Validators.required]],
    FatherName: ['', [Validators.required]],
    MotherName: [''],
    Gender: [0, [Validators.required]],
    Address: new FormControl('', [Validators.required]),
    City: [0],
    Pincode: new FormControl('', [Validators.required]),
    State: [0],
    Country: [0],
    DOB: ['', [Validators.required]],
    Bloodgroup: [0],
    Category: [0, [Validators.required]],
    BankAccountNo: [''],
    IFSCCode: [''],
    MICRNo: [''],
    AadharNo: [''],
    Photo: [''],
    Religion: [''],
    ContactNo: [''],
    FatherContactNo: [''],
    MotherContactNo: [''],
    PrimaryContactFatherOrMother: [0],
    AlternateContact: [''],
    EmailAddress: [''],
    TransferFromSchool: [''],
    TransferFromSchoolBoard: [''],
    Remarks: [''],
    Active: [0],
    LocationId: [0]
  });
  constructor(private dataservice: NaomitsuService,
    private routeUrl: ActivatedRoute,
    private route: Router,
    private alert: AlertService,
    private fb: FormBuilder,
    private formatdate:DatePipe) { }

  ngOnInit(): void {
    this.routeUrl.paramMap.subscribe(param => {
      this.Id = +param.get('id')
    })
    this.GetMasterData();
    if (this.Id > 0)
      this.GetStudent();
  }
  @ViewChildren("allTabs") allTabs: QueryList<any>

  ngAfterViewInit() {
    //console.log('total tabs: ' + this.allTabs.first._tabs.length);
  }

  get f() { return this.studentForm.controls }

  tabChanged(tabChangeEvent: number) {
    console.log('tab selected: ' + tabChangeEvent);
  }
  back() {
    this.route.navigate(['/admin/dashboardstudent']);
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
        this.Gender = this.getDropDownData(globalconstants.GENDER);
        this.Country = this.getDropDownData(globalconstants.COUNTRY);
        this.Bloodgroup = this.getDropDownData(globalconstants.BLOODGROUP);
        this.Category = this.getDropDownData(globalconstants.CATEGORY);
        this.Religion = this.getDropDownData(globalconstants.RELIGION);
        this.States = this.getDropDownData(globalconstants.STATE);
        this.PrimaryContact = this.getDropDownData(globalconstants.PRIMARYCONTACT);
        this.Location = this.getDropDownData(globalconstants.LOCATION);
        this.CountryId=this.Country.filter(country=>country.MasterDataName=="India")[0].MasterDataId;
        this.LocationId = this.Location.filter(location=>location.MasterDataName=="Lamka")[0].MasterDataId;
        this.studentForm.patchValue({Country:this.CountryId});
        this.studentForm.patchValue({LocationId:this.LocationId});
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
  SaveOrUpdate() {
    debugger;
    // let dob=this.studentForm.get("DOB").value
    
    // let newDOB =  new Date(dob.getFullYear(), dob.getMonth(), dob.getDate(), 0, 0, 0); 
    // console.log('this.studentForm.get("DOB").value',this.studentForm.get("DOB").value)
    // console.log('newDOB',newDOB)
    this.studentData = {

      Name: this.studentForm.get("Name").value,
      FatherName: this.studentForm.get("FatherName").value,
      MotherName: this.studentForm.get("MotherName").value,
      Gender: this.studentForm.get("Gender").value,
      Address: this.studentForm.get("Address").value,
      //City: this.studentForm.get("City").value,
      Pincode: this.studentForm.get("Pincode").value,
      State: this.studentForm.get("State").value,
      //Country: this.studentForm.get("Country").value,
      DOB: this.studentForm.get("DOB").value,
      Bloodgroup: this.studentForm.get("Bloodgroup").value,
      Category: this.studentForm.get("Category").value,
      BankAccountNo: this.studentForm.get("BankAccountNo").value,
      IFSCCode: this.studentForm.get("IFSCCode").value,
      MICRNo: this.studentForm.get("MICRNo").value,
      AadharNo: this.studentForm.get("AadharNo").value,
      Photo: this.studentForm.get("Photo").value,
      Religion: this.studentForm.get("Religion").value,
      ContactNo: this.studentForm.get("ContactNo").value,
      FatherContactNo: this.studentForm.get("FatherContactNo").value,
      MotherContactNo: this.studentForm.get("MotherContactNo").value,
      PrimaryContactFatherOrMother: this.studentForm.get("PrimaryContactFatherOrMother").value,
      AlternateContact: this.studentForm.get("AlternateContact").value,
      EmailAddress: this.studentForm.get("EmailAddress").value,
      TransferFromSchool: this.studentForm.get("TransferFromSchool").value,
      TransferFromSchoolBoard: this.studentForm.get("TransferFromSchoolBoard").value,
      Remarks: this.studentForm.get("Remarks").value,
      Active: this.studentForm.get("Active").value,
      //LocationId: this.studentForm.get("LocationId").value
    }
    console.log("datato save",this.studentData);
    if (this.studentForm.get("StudentId").value == 0)
      this.save();
    else
      this.update();
  }
  save() {
    this.studentForm.patchValue({ AlternateContact: "" });
  
    this.dataservice.postPatch('Students', this.studentData, 0, 'post')
      .subscribe((result: any) => {
        //if (result.value.length > 0)
          this.alert.success("Student's data saved successfully.",this.options);
      },error=>console.log(error))
  }
  update() {
    //console.log('student', this.studentForm.value)

    this.dataservice.postPatch('Students', this.studentData, +this.studentForm.get("StudentId").value, 'patch')
      .subscribe((result: any) => {
        //if (result.value.length > 0 )
        this.alert.success("Student's data updated successfully.",this.options);
      })
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
            Name: data.value[0].Name,
            FatherName: data.value[0].FatherName,
            MotherName: data.value[0].MotherName,
            Gender: data.value[0].Gender,
            Address: data.value[0].Address,
            City: data.value[0].City,
            Pincode: data.value[0].Pincode,
            State: data.value[0].State,
            Country: data.value[0].Country,
            DOB:  data.value[0].DOB,//this.formatdate.transform(data.value[0].DOB,'dd/MM/yyyy'),
            Bloodgroup: data.value[0].Bloodgroup,
            Category: data.value[0].Category,
            BankAccountNo: data.value[0].BankAccountNo,
            IFSCCode: data.value[0].IFSCCode,
            MICRNo: data.value[0].MICRNo,
            AadharNo: data.value[0].AadharNo,
            Photo: data.value[0].Photo,
            Religion: data.value[0].Religion,
            ContactNo: data.value[0].ContactNo,
            FatherContactNo: data.value[0].FatherContactNo,
            MotherContactNo: data.value[0].MotherContactNo,
            PrimaryContactFatherOrMother: data.value[0].PrimaryContactFatherOrMother,
            AlternateContact: data.value[0].AlternateContact,
            EmailAddress: data.value[0].EmailAddress,
            TransferFromSchool: data.value[0].TransferFromSchool,
            TransferFromSchoolBoard: data.value[0].TransferFromSchoolBoard,
            Remarks: data.value[0].Remarks,
            Active: data.value[0].Active,
            LocationId: data.value[0].LocationId,

          })
        }
        else {
          this.alert.error("No data found.", this.options);
        }
      });
  }
}
