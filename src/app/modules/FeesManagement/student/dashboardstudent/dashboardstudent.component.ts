import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { Element } from '../../classfee/dashboardclassfee/dashboardclassfee.component';

@Component({
  selector: 'app-dashboardstudent',
  templateUrl: './dashboardstudent.component.html',
  styleUrls: ['./dashboardstudent.component.scss']
})
export class DashboardstudentComponent implements OnInit {
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  ELEMENT_DATA: IStudent[];
  dataSource: MatTableDataSource<IStudent>;
  displayedColumns = ['StudentId', 'Name', 'FatherName', 'MotherName', 'FatherContactNo', 'MotherContactNo', 'Active', 'Action'];
  allMasterData = [];
  Classes = [];
  Bloodgroup = [];
  Category = [];
  Religion = [];
  States = []
  PrimaryContact = [];
  Location = [];
  searchForm = new FormGroup({
    Name: new FormControl(''),
    FatherName: new FormControl(''),
    MotherName: new FormControl(''),

  })
  constructor(private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService) { }

  ngOnInit(): void {
    this.GetMasterData();
    this.dataSource = new MatTableDataSource<IStudent>(this.ELEMENT_DATA);
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
        //this.Classes = this.getDropDownData(globalconstants.CLASSES);
        // this.Category = this.getDropDownData(globalconstants.CATEGORY);
        // this.Religion = this.getDropDownData(globalconstants.RELIGION);
        // this.States = this.getDropDownData(globalconstants.STATE);
        // this.PrimaryContact = this.getDropDownData(globalconstants.PRIMARYCONTACT);
        // this.Location = this.getDropDownData(globalconstants.LOCATION);
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
  fee(id) {
    this.route.navigate(['/admin/addstudentfeepayment/' + id]);
  }
  class(id) {
    this.route.navigate(['/admin/addstudentcls/' + id]);
  }
  view(id) {
    this.route.navigate(['/admin/addstudent/' + id]);
  }
  new(){
    this.route.navigate(['/admin/addstudent']);
  }
  GetStudent() {

    let checkFilterString = "substringof('" + this.searchForm.get("Name").value + "',Name)"
    if (this.searchForm.get("FatherName").value.trim().length > 0)
      checkFilterString += " and substringof('" + this.searchForm.get("FatherName").value + "',FatherName)"
    if (this.searchForm.get("MotherName").value.trim().length > 0)
      checkFilterString += " and substringof('" + this.searchForm.get("MotherName").value + "',MotherName)"

    let list: List = new List();
    list.fields = ["StudentId", "Name", "FatherName", "MotherName", "FatherContactNo", "MotherContactNo", "Active"];
    list.PageName = "Students";
    list.filter = [checkFilterString];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {

        if (data.value.length > 0) {
          this.ELEMENT_DATA = data.value.map(item => {
            item.Action = "";
            return item;
          })
        }
        else {
          this.ELEMENT_DATA = [];
          this.alert.warn("No student found!", this.options);
        }
        this.dataSource = new MatTableDataSource<IStudent>(this.ELEMENT_DATA);
      });

  }
}
export interface IStudent {
  StudentId: number;
  Name: string;
  FatherName: string;
  MotherName: string;
  FatherContactNo: string;
  MotherContactNo: string;
  Active: boolean;
  Action: boolean;
}