import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TableUtil } from '../../../../modules/TableUtil';
import { AlertService } from '../../../../shared/components/alert/alert.service';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
import { SharedataService } from '../../../../shared/sharedata.service';
import * as XLSX from 'xlsx';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

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
  filterOrgIdNBatchId = '';
  filterOrgIdOnly = '';
  ELEMENT_DATA: IStudent[];
  dataSource: MatTableDataSource<IStudent>;
  displayedColumns = ['StudentId', 'Name', 'ClassName', 'FatherName', 'MotherName',
    'Active', 'ReasonForLeaving', 'Action'];
  allMasterData = [];
  Genders = [];
  Classes = [];
  Batches = [];
  Bloodgroup = [];
  Category = [];
  Religion = [];
  States = []
  PrimaryContact = [];
  Location = [];
  LanguageSubjUpper = [];
  LanguageSubjLower = [];
  FeeType = [];
  FeeNames = [];
  Sections = [];
  UploadTypes = [];
  ReasonForLeaving = [];
  //StandardFilter ='';
  SelectedBatchId = 0;
  SelectedBatchStudentIDRollNo = [];
  StudentClassId = 0;
  studentSearchForm: FormGroup;
  LoginUserDetail = [];
  constructor(private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService,
    private fb: FormBuilder,
    private shareddata: SharedataService,
    private token: TokenStorageService) { }

  ngOnInit(): void {
    this.LoginUserDetail = this.token.getUserDetail();
    
    this.filterOrgIdOnly = globalconstants.getStandardFilter(this.LoginUserDetail);
    //this.shareddata.ChangeSelectedBatchId
    //this.StandardFilter =globalconstants.getStandardFilter(this.LoginUserDetail);
    this.studentSearchForm = this.fb.group({
      //BatchId: [0, Validators.required],
      StudentId: [0],
      Name: [''],
      FatherName: [''],
      MotherName: ['']
    })
    this.GetMasterData();
    // this.dataSource = new MatTableDataSource<IStudent>(this.ELEMENT_DATA);
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;

  }
  GetMasterData() {
    debugger;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 and (ParentId eq 0 or " + this.filterOrgIdOnly +')'];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
        console.log('this.SelectedBatchId',this.SelectedBatchId);
        this.filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.LoginUserDetail, this.shareddata);

        this.shareddata.ChangeMasterData(data.value);
        this.allMasterData = [...data.value];

        this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].REASONFORLEAVING);
        this.shareddata.ChangeReasonForLeaving(this.ReasonForLeaving);

        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASS);
        this.shareddata.ChangeClasses(this.Classes);

        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BATCH);
        //this.shareddata.ChangeBatch(this.Batches);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        //this.shareddata.CurrentSelectedBatchId.subscribe(c=>(this.SelectedBatchId=c));

        this.Category = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CATEGORY);
        this.shareddata.ChangeCategory(this.Category);

        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].RELIGION);
        this.shareddata.ChangeReligion(this.Religion);

        this.States = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].STATE);
        this.shareddata.ChangeStates(this.States);

        this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].PRIMARYCONTACT);
        this.shareddata.ChangePrimaryContact(this.PrimaryContact);

        this.Location = this.getDropDownData(globalconstants.MasterDefinitions[0].applications[0].LOCATION);
        this.shareddata.ChangeLocation(this.Location);

        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].GENDER);
        this.shareddata.ChangeGenders(this.Genders);

        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BLOODGROUP);
        this.shareddata.ChangeBloodgroup(this.Bloodgroup);

        this.FeeType = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].FEETYPE);
        this.shareddata.ChangeFeeType(this.FeeType);

        this.LanguageSubjUpper = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].LANGUAGESUBJECTUPPERCLS);
        this.shareddata.ChangeLanguageSubjectUpper(this.LanguageSubjUpper);

        this.LanguageSubjLower = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].LANGUAGESUBJECTLOWERCLS);
        this.shareddata.ChangeLanguageSubjectLower(this.LanguageSubjLower);

        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].FEENAME);
        this.shareddata.ChangeFeeNames(this.FeeNames);

        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SECTION);
        this.shareddata.ChangeSection(this.Sections);

        this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].UPLOADTYPE);
        this.shareddata.ChangeUploadType(this.UploadTypes);

        //let currentBatch = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CURRENTBATCH);
        //let currentBatchObj = this.Batches.filter(item => item.MasterDataName.toLowerCase() == currentBatch[0].MasterDataName.toLowerCase());
        // if (currentBatchObj.length > 0) {
        //   this.BatchId = currentBatchObj[0].MasterDataId
        //   this.studentSearchForm.patchValue({ BatchId: this.BatchId });

        // }

        this.getSelectedBatchStudentIDRollNo();


      });

  }
  getDropDownData(dropdowntype) {
    let Ids = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    });
    if (Ids.length > 0) {
      var Id =Ids[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      });
    }
    else
      return [];
  }
  fee(id) {
    this.route.navigate(['/admin/addstudentfeepayment/' + id]);
  }
  class(id) {
    this.route.navigate(['/admin/addstudentcls/' + id]);
  }
  UpdateSelectedBatchId(event) {
    this.shareddata.ChangeSelectedBatchId(event);
    //this.shareddata.CurrentSelectedBatchId.subscribe(s=>console.log("selected batchid",s));
  }
  view(element) {
    debugger;
    let StudentName = element.StudentId + ' ' + element.Name + ' ' + element.FatherName + ' ' + element.MotherName;
    this.shareddata.ChangeStudentName(StudentName);

    let studentclass = this.SelectedBatchStudentIDRollNo.filter(sid => sid.StudentId == element.StudentId);
    if (studentclass.length > 0)
      this.StudentClassId = studentclass[0].StudentClassId

    this.shareddata.ChangeStudentClassId(this.StudentClassId);
    this.shareddata.ChangeStudentId(element.StudentId);

    //  this.route.navigate(['/admin/addstudent/' + id], { queryParams: { scid: this.StudentClassId, bid: this.BatchId } });
    this.route.navigate(['/admin/addstudent/' + element.StudentId]);
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
  getSelectedBatchStudentIDRollNo() {
    let list: List = new List();
    list.fields = ["StudentId", "RollNo", "StudentClassId", "ClassId"];
    list.PageName = "StudentClasses";
    list.filter = [this.filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.SelectedBatchStudentIDRollNo = [...data.value];

        }
      })
  }
  //sum(acc, val) { return ',' + val.StudentId; }
  GetStudent() {
    debugger;
    //let StudentClassIds = '';

    let checkFilterString = '';//"OrgId eq " + this.LoginUserDetail[0]["orgId"] + ' and Batch eq ' + 
    if (this.studentSearchForm.get("Name").value.trim().length > 0)
      checkFilterString += " and substringof('" + this.studentSearchForm.get("Name").value + "',Name)";
    if (this.studentSearchForm.get("FatherName").value.trim().length > 0)
      checkFilterString += " and substringof('" + this.studentSearchForm.get("FatherName").value + "',FatherName)"
    if (this.studentSearchForm.get("MotherName").value.trim().length > 0)
      checkFilterString += " and substringof('" + this.studentSearchForm.get("MotherName").value + "',MotherName)"
    if (this.studentSearchForm.get("StudentId").value > 0) {
      checkFilterString += " and StudentId eq " + this.studentSearchForm.get("StudentId").value
    }

    this.filterOrgIdOnly += checkFilterString;

    let list: List = new List();
    list.fields = ["StudentId", "StudentClasses/StudentClassId",
      "StudentClasses/BatchId",
      "StudentClasses/ClassId",
      "StudentClasses/RollNo",
      "Name", "FatherName",
      "MotherName", "FatherContactNo",
      "MotherContactNo", "Active",
      "ReasonForLeavingId"];
    list.lookupFields = ["StudentClasses"];
    list.PageName = "Students";
    list.filter = [this.filterOrgIdOnly];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        if (data.value.length > 0) {
          var formattedData = data.value.filter(sc => {
            let reason = this.ReasonForLeaving.filter(r => r.MasterDataId == sc.ReasonForLeavingId)
            sc.StudentClasses = sc.StudentClasses.filter(c => c.BatchId == this.SelectedBatchId)
            sc.ReasonForLeaving = reason.length > 0 ? reason[0].MasterDataName : '';
            return sc;
          });
          this.ELEMENT_DATA = formattedData.map(item => {
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
          this.alert.info("No student found!", this.options);
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