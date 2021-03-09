import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';

@Component({
  selector: 'app-addstudent',
  templateUrl: './addstudent.component.html',
  styleUrls: ['./addstudent.component.scss']
})
export class AddstudentComponent implements OnInit {
  loading = false;
  Country = [];
  Gender = [];
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
    ContactNo: new FormControl('', [Validators.required]),
    AlternateContact: new FormControl(''),
    EmailAddress: new FormControl(''),
    TransferFromSchool: new FormControl(''),
    TransferFromSchoolBoard: new FormControl(''),
    Remarks: new FormControl(''),
    Active: new FormControl(0),
    locationId: new FormControl(0)
  });
  constructor(private dataservice: NaomitsuService) { }

  ngOnInit(): void {
    this.GetMasterData();
  }
  @ViewChildren("allTabs") allTabs: QueryList<any>

  ngAfterViewInit() {
    console.log('total tabs: ' + this.allTabs.first._tabs.length);
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
}
