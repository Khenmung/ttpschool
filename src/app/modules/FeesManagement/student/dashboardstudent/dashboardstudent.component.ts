import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TableUtil } from 'src/app/modules/TableUtil';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboardstudent',
  templateUrl: './dashboardstudent.component.html',
  styleUrls: ['./dashboardstudent.component.scss']
})
export class DashboardstudentComponent implements OnInit {
  @ViewChild("table") tableRef: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  ELEMENT_DATA: IStudent[];
  dataSource: MatTableDataSource<IStudent>;
  displayedColumns = ['StudentId', 'Name', 'ClassName', 'FatherName', 'MotherName',
    'Active', 'Action'];
  allMasterData = [];
  Genders =[];
  Classes = [];
  Batches = [];
  Bloodgroup = [];
  Category = [];
  Religion = [];
  States = []
  PrimaryContact = [];
  Location = [];
  LanguageSubjUpper=[];
  LanguageSubjLower=[];
  FeeType=[];
  FeeNames=[];
  Sections=[];
  BatchId = 0;
  StudentIDRollNo = [];
  StudentClassId = 0;
  searchForm: FormGroup;

  constructor(private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService,
    private fb: FormBuilder,
    private shareddata:SharedataService) { }

  ngOnInit(): void {
    this.GetMasterData();
    // this.dataSource = new MatTableDataSource<IStudent>(this.ELEMENT_DATA);
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
    this.searchForm = this.fb.group({
      BatchId: [0, Validators.required],
      StudentId: [0],
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
        this.shareddata.ChangeMasterData(data.value);
        this.allMasterData = [...data.value];
        
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.CLASSES);
        this.shareddata.ChangeClasses(this.Classes);
        
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.BATCH);
        this.shareddata.ChangeBatch(this.Batches);

        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.CATEGORY);
        this.shareddata.ChangeCategory(this.Category);

        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.RELIGION);
        this.shareddata.ChangeReligion(this.Religion);

        this.States = this.getDropDownData(globalconstants.MasterDefinitions.STATE);
        this.shareddata.ChangeStates(this.States);

        this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.PRIMARYCONTACT);
        this.shareddata.ChangePrimaryContact(this.PrimaryContact);

        this.Location = this.getDropDownData(globalconstants.MasterDefinitions.LOCATION);
        this.shareddata.ChangeLocation(this.Location);

        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.GENDER);
        this.shareddata.ChangeGenders(this.Genders);

        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.BLOODGROUP);
        this.shareddata.ChangeBloodgroup(this.Bloodgroup);

        this.FeeType = this.getDropDownData(globalconstants.MasterDefinitions.FEETYPE);
        this.shareddata.ChangeFeeType(this.FeeType);

        this.LanguageSubjUpper = this.getDropDownData(globalconstants.MasterDefinitions.LANGUAGESUBJECTUPPERCLS);
        this.shareddata.ChangeLanguageSubjectUpper(this.LanguageSubjUpper);

        this.LanguageSubjLower = this.getDropDownData(globalconstants.MasterDefinitions.BLOODGROUP);
        this.shareddata.ChangeLanguageSubjectLower(this.LanguageSubjLower);

        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions.FEENAMES);
        this.shareddata.ChangeFeeNames(this.FeeNames);

        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.SECTION);
        this.shareddata.ChangeSection(this.Sections);

        let currentBatch = this.getDropDownData(globalconstants.MasterDefinitions.CURRENTBATCH);
        let currentBatchObj = this.Batches.filter(item => item.MasterDataName.toLowerCase() == currentBatch[0].MasterDataName.toLowerCase());
        if (currentBatchObj.length > 0) {
          this.BatchId = currentBatchObj[0].MasterDataId
          this.searchForm.patchValue({ BatchId: this.BatchId });
          this.shareddata.ChangeBatchId(this.BatchId);
        }
        
        this.getStudentIDRollNo();

        
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
    let studentclass = this.StudentIDRollNo.filter(sid => sid.StudentId == id);
    if (studentclass.length > 0)
    {
      this.StudentClassId = studentclass[0].StudentClassId
      this.shareddata.ChangeStudentClassId(this.StudentClassId);
      this.shareddata.ChangeStudentId(id);
    }
    //  this.route.navigate(['/admin/addstudent/' + id], { queryParams: { scid: this.StudentClassId, bid: this.BatchId } });
    this.route.navigate(['/admin/addstudent/' + id]);
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
    list.filter = ["Batch eq " + this.BatchId];

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
    list.fields = ["StudentId", "StudentClasses/StudentClassId", "StudentClasses/Batch", "StudentClasses/ClassId", "StudentClasses/RollNo",
      "Name", "FatherName", "MotherName", "FatherContactNo", "MotherContactNo", "Active"];
    list.lookupFields = ["StudentClasses"];
    list.PageName = "Students";
    list.filter = [checkFilterString];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        if (data.value.length > 0) {
          this.ELEMENT_DATA = data.value.filter(sc => {
            sc.StudentClasses = sc.StudentClasses.filter(c => c.Batch == this.BatchId)
            return sc;
          })
            .map(item => {
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
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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