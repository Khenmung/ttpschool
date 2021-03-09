import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';

@Component({
  selector: 'app-addstudent',
  templateUrl: './addstudent.component.html',
  styleUrls: ['./addstudent.component.scss']
})
export class AddstudentComponent implements OnInit {
  loading=false;
  Gender=[];
  studentForm= new FormGroup({
    Name:new FormControl('',[Validators.required]),
    FatherName:new FormControl('',[Validators.required]),
    MotherName:new FormControl(''),
    Gender:new FormControl(0,[Validators.required]),
    Address:new FormControl('',[Validators.required]),
    City:new FormControl(0),
    Pincode:new FormControl('',[Validators.required]),
    State:new FormControl(0),
    Country:new FormControl(0),
    DOB:new FormControl('',[Validators.required]),
    Bloodgroup:new FormControl(0),
    Category:new FormControl(0,[Validators.required]),
    BankAccountNo:new FormControl(''),
    IFSCCode:new FormControl(''),
    MICRNo:new FormControl(''),
    AadharNo:new FormControl(''),
    Photo:new FormControl(''),
    Religion:new FormControl(0),
    ContactNo:new FormControl('',[Validators.required]),
    AlternateContact:new FormControl(''),
    EmailAddress:new FormControl(''),
    TransferFromSchool:new FormControl(''),
    TransferFromSchoolBoard:new FormControl(''),
    Remarks:new FormControl(''),
    Active:new FormControl(0),
    locationId:new FormControl(0)
  });
  constructor(private dataservice:NaomitsuService) { }

  ngOnInit(): void {
  }
  @ViewChildren("allTabs") allTabs: QueryList<any>
  
  ngAfterViewInit() {
    console.log('total tabs: ' + this.allTabs.first._tabs.length);
  }
  
  get f(){return this.studentForm.controls}

  tabChanged(tabChangeEvent: number) {
    console.log('tab selected: ' + tabChangeEvent);
  }
  GetMasterData(ParentId) {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 and ParentId eq " + ParentId];
    list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Gender = data.value;
        //console.log(this.PageGroups);
      });

  }

}
