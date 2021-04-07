import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TableUtil } from 'src/app/modules/TableUtil';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboardstudent',
  templateUrl: './dashboardstudent.component.html',
  styleUrls: ['./dashboardstudent.component.scss']
})
export class DashboardstudentComponent implements OnInit {
  @ViewChild("table") tableRef: ElementRef;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  ELEMENT_DATA: IStudent[];
  dataSource: MatTableDataSource<IStudent>;
  displayedColumns = ['StudentId', 'Name', 'ClassName', 'FatherName', 'MotherName',
    'Active', 'Action'];
  allMasterData = [];
  Classes = [];
  Batches = [];
  Bloodgroup = [];
  Category = [];
  Religion = [];
  States = []
  PrimaryContact = [];
  Location = [];
  currentbatchId = 0;
  StudentIDRollNo = [];
  StudentClassId=0;
  searchForm: FormGroup;
  
  constructor(private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.GetMasterData();
    this.dataSource = new MatTableDataSource<IStudent>(this.ELEMENT_DATA);
    this.searchForm = this.fb.group({
      StudentId: [''],
      Name: [''],
      FatherName: [''],
      MotherName: ['']
    })
  }
  GetMasterData() {
    debugger;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        this.allMasterData = [...data.value];
        this.Classes = this.getDropDownData(globalconstants.CLASSES);
        this.Batches = this.getDropDownData(globalconstants.BATCH);
        let currentBatch = globalconstants.getCurrentBatch();
        let currentBatchObj = this.Batches.filter(item => item.MasterDataName == currentBatch);
        if (currentBatchObj.length > 0) {
          this.currentbatchId = currentBatchObj[0].MasterDataId
        }
        this.getStudentIDRollNo();

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
    debugger;
    this.StudentClassId =this.StudentIDRollNo.filter(sid=>sid.StudentId==id)[0].StudentClassId;
    this.route.navigate(['/admin/addstudent/' + id],{queryParams:{scid:this.StudentClassId}});
  }
  new() {
    this.route.navigate(['/admin/addstudent']);
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.tableRef.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'basicinfo.xlsx');
  }
  exportArray() {
    const datatoExport: Partial<IStudentDownload>[] = this.ELEMENT_DATA.map(x => ({
      StudentId: x.StudentId,
      Name: x.Name,
      FatherName: x.FatherName,
      Class: '',
      RollNo: '',
      Section: '',
      AdmissionDate: null
    }));
    TableUtil.exportArrayToExcel(datatoExport, "ExampleArray");
  }
  getStudentIDRollNo() {
    let list: List = new List();
    list.fields = ["StudentId", "RollNo", "StudentClassId", "ClassId"];
    list.PageName = "StudentClasses";
    list.filter = ["Batch eq " + this.currentbatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.StudentIDRollNo = [...data.value];
          
        }
      })
  }
  //sum(acc, val) { return ',' + val.StudentId; }
  GetStudent() {
    debugger;
    //let StudentClassIds = '';
    let checkFilterString = "1 eq 1"
    if (this.searchForm.get("Name").value.trim().length > 0)
      checkFilterString += " and substringof('" + this.searchForm.get("Name").value + "',Name)";
    if (this.searchForm.get("FatherName").value.trim().length > 0)
      checkFilterString += " and substringof('" + this.searchForm.get("FatherName").value + "',FatherName)"
    if (this.searchForm.get("MotherName").value.trim().length > 0)
      checkFilterString += " and substringof('" + this.searchForm.get("MotherName").value + "',MotherName)"
    if (this.searchForm.get("StudentId").value > 0) {
      checkFilterString += " and StudentId eq " + this.searchForm.get("StudentId").value
    }
    
    let list: List = new List();
    list.fields = ["StudentId", "StudentClasses/StudentClassId", "StudentClasses/ClassId", "StudentClasses/RollNo", "Name", "FatherName"
      , "MotherName", "FatherContactNo", "MotherContactNo", "Active"];
    list.lookupFields = ["StudentClasses"];
    list.PageName = "Students";
    list.filter = [checkFilterString];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        console.log(data.value);
        if (data.value.length > 0) {
          this.ELEMENT_DATA = data.value.map(item => {
            if (item.StudentClasses.length == 0)
              item.ClassName = '';
            else {
              item.ClassName = this.Classes.filter(cls => {
                return cls.MasterDataId == item.StudentClasses[0].ClassId
              }
              )[0].MasterDataName;
            }
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
export interface IStudentDownload {
  StudentId: number;
  Name: string;
  FatherName: string;
  AdmissionDate: Date;
  Class: string;
  RollNo: string;
  Section: string;
}