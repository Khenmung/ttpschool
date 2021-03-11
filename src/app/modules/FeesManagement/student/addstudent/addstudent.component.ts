import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  studentForm = new FormGroup({
    Name: new FormControl('', [Validators.required]),
    FatherName: new FormControl('', [Validators.required]),
    MotherName: new FormControl(''),
    Gender: new FormControl(0, [Validators.required]),
    Address: new FormControl('', [Validators.required]),
    City: new FormControl(0),
    Pincode: new FormControl('', [Validators.required]),
    State: new FormControl(0),
    Country: new FormControl(0),
    DOB: new FormControl('', [Validators.required]),
    Bloodgroup: new FormControl(0),
    Category: new FormControl(0, [Validators.required]),
    BankAccountNo: new FormControl(''),
    IFSCCode: new FormControl(''),
    MICRNo: new FormControl(''),
    AadharNo: new FormControl(''),
    Photo: new FormControl(''),
    Religion: new FormControl(0),
    ContactNo: new FormControl(''),
    FatherContactNo: new FormControl(''),
    MotherContactNo: new FormControl(''),
    PrimaryContact: new FormControl(0),
    AlternateContact: new FormControl(''),
    EmailAddress: new FormControl(''),
    TransferFromSchool: new FormControl(''),
    TransferFromSchoolBoard: new FormControl(''),
    Remarks: new FormControl(''),
    Active: new FormControl(0),
    locationId: new FormControl(0)
  });
  constructor(private dataservice: NaomitsuService,
    private routeUrl: ActivatedRoute,
    private alert: AlertService) { }

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
  GetMasterData() {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        console.log(data.value);
        this.allMasterData = [...data.value];
        this.Gender = this.getDropDownData(globalconstants.GENDER);
        this.Country = this.getDropDownData(globalconstants.COUNTRY);
        this.Bloodgroup = this.getDropDownData(globalconstants.BLOODGROUP);
        this.Category = this.getDropDownData(globalconstants.CATEGORY);
        this.Religion = this.getDropDownData(globalconstants.RELIGION);
        this.States = this.getDropDownData(globalconstants.STATE);
        this.PrimaryContact = this.getDropDownData(globalconstants.PRIMARYCONTACT);
        this.Location = this.getDropDownData(globalconstants.LOCATION);
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
  GetStudent() {

    let list: List = new List();
    list.fields = ["StudentId", "Name", "FatherName", "MotherName", "FatherContactNo", "MotherContactNo", "Active"];
    list.PageName = "Students";
    list.filter = ["StudentId eq " + this.Id];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.studentForm.setValue({
            Name: data.value[0].Name,
            FatherName: data.value[0].FatherName,
            MotherName: data.value[0].MotherName,
            Gender: data.value[0].Gender,
            Address: data.value[0].Address,
            City: data.value[0].City,
            Pincode: data.value[0].Pincode,
            State: data.value[0].State,
            Country: data.value[0].Country,
            DOB: data.value[0].DOB,
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
            PrimaryContact: data.value[0].PrimaryContact,
            AlternateContact: data.value[0].AlternateContact,
            EmailAddress: data.value[0].EmailAddress,
            TransferFromSchool: data.vaue[0].TransferFromSchool,
            TransferFromSchoolboard: data.value[0].TransferFromSchoolboard,
            Remarks: data.value[0].Remarks,
            Active: data.value[0].Active,
            locationId: data.value[0].locationId,

          })
        }
        else {
          this.alert.error("No data found.", this.options);
        }
      });
  }
}
