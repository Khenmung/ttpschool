import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { List } from '../../../shared/interface';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { SharedataService } from '../../../shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ContentService } from 'src/app/shared/content.service';

@Component({
  selector: 'app-excel-data-management',
  templateUrl: './excel-data-management.component.html',
  styleUrls: ['./excel-data-management.component.scss']
})
export class ExcelDataManagementComponent implements OnInit {
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private fb: FormBuilder,
    private alert: AlertService,
    private shareddata: SharedataService,
    private tokenservice: TokenStorageService) {

  }
  CLASSROLLNOMAPPING = 'rollno class mapping';
  STUDENTDATA = 'student upload'
  filterOrgIdNBatchId = '';
  filterOrgId = '';

  loading = false;
  SelectedBatchId = 0;
  loginDetail = [];
  ngOnInit() {
    //this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
    //this.GetMasterData();
    this.loading = true;
    this.loginDetail = this.tokenservice.getUserDetail();
    this.shareddata.CurrentGenders.subscribe(c => (this.Genders = c));
    this.shareddata.CurrentBloodgroup.subscribe(c => (this.Bloodgroup = c));
    this.shareddata.CurrentCategory.subscribe(c => (this.Category = c));
    this.shareddata.CurrentReligion.subscribe(c => (this.Religion = c));
    this.shareddata.CurrentStates.subscribe(c => (this.States = c));
    this.shareddata.CurrentPrimaryContact.subscribe(c => (this.PrimaryContact = c));
    this.shareddata.CurrentLocation.subscribe(c => (this.Location = c));

    this.contentservice.GetClasses(this.loginDetail[0]["orgId"]).subscribe((data: any) => {
      this.Classes = [...data.value];

    });

    this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
    this.shareddata.CurrentSection.subscribe(c => (this.Sections = c));
    this.shareddata.CurrentUploadType.subscribe(c => (this.UploadTypes = c));
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenservice.getSelectedBatchId();
    this.shareddata.CurrentFeeType.subscribe(b => this.FeeTypes = b);

    this.uploadForm = this.fb.group({
      //BatchId:[this.SelectedBatchId],
      UploadTypeId: [0, [Validators.required]]
    })
    this.filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenservice);
    this.filterOrgId = globalconstants.getStandardFilter(this.loginDetail);

  }
  PageLoad() {
    if (this.UploadTypes.length == 0)
      this.GetMasterData();
    else
      this.GetStudents();
  }
  NotMandatory = ["BankAccountNo", "IFSCCode", "MICRNo", "ContactNo",
    "MotherContactNo", "AlternateContact", "EmailAddress",
    "TransferFromSchool", "TransferFromSchoolBoard", "Remarks"];
  NoNeedToCheckBlank = ["BankAccountNo", "IFSCCode", "MICRNo", "ContactNo",
    "MotherContactNo", "AlternateContact", "EmailAddress",
    "TransferFromSchool", "TransferFromSchoolBoard",
    "Gender", "Religion", "Category", "Bloodgroup",
    "PrimaryContactFatherOrMother", "ClassAdmissionSought", "Remarks"];
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  ErrorMessage = '';
  StudentList = [];
  StudentClassList = [];
  displayedColumns: any[];
  ELEMENT_DATA: any[];
  dataSource: MatTableDataSource<any>;
  uploadForm: FormGroup;
  AllMasterData: any[];
  UploadTypes: any[];
  storeData: any;
  csvData: any;
  jsonData: any;
  textData: any;
  htmlData: any;
  fileUploaded: File;
  worksheet: any;
  selectedFile: string;
  Classes = [];
  Batches = [];
  Sections = [];
  FeeTypes = [];
  Genders = [];
  Category = [];
  Bloodgroup = [];
  Religion = [];
  States = [];
  PrimaryContact = [];
  Location = [];
  PrimaryContactFatherOrMother = [];
  studentData: any[];
  Uploadtype = '';
  onselectchange(event) {
    ////debugger;
    //    console.log('event', event);
    this.Uploadtype = this.UploadTypes.filter(item => {
      return item.MasterDataId == event.value
    })[0].MasterDataName

    if (this.Uploadtype.toLowerCase().includes(this.CLASSROLLNOMAPPING))
      this.displayedColumns = ["StudentId", "Class", "Section", "RollNo"];
    else if (this.Uploadtype.toLowerCase().includes(this.STUDENTDATA))
      this.displayedColumns = [
        "Name",
        "FatherName",
        "FatherOccupation",
        "MotherName",
        "MotherOccupation",
        "Gender",
        "PresentAddress",
        "PermanentAddress",
        "DOB",
        "Bloodgroup",
        "Category",
        "BankAccountNo",
        "IFSCCode",
        "MICRNo",
        "AadharNo",
        "Religion",
        "ContactNo",
        "WhatsAppNumber",
        "FatherContactNo",
        "MotherContactNo",
        "PrimaryContactFatherOrMother",
        "NameOfContactPerson",
        "RelationWithContactPerson",
        "ContactPersonContactNo",
        "AlternateContact",
        "EmailAddress",
        "ClassAdmissionSought",
        "LastSchoolPercentage",
        "TransferFromSchool",
        "TransferFromSchoolBoard",
        "Remarks"];
    //  this.readExcel();
    //    this.uploadedFile(event);
  }
  browseOnChange(event) {
    this.fileUploaded = event.target.files[0];
    this.selectedFile = this.fileUploaded.name;
    this.readExcel();
  }
  readExcel() {
    //debugger;

    let readFile = new FileReader();
    this.ErrorMessage = '';
    readFile.onload = (e) => {
      this.storeData = readFile.result;
      var data = new Uint8Array(this.storeData);
      //console.log('data',data)
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      this.worksheet = workbook.Sheets[first_sheet_name];
      this.jsonData = XLSX.utils.sheet_to_json(this.worksheet, { raw: false });
      if (this.Uploadtype.toLowerCase().includes(this.CLASSROLLNOMAPPING))
        this.ValidateStudentClassData();
      else if (this.Uploadtype.toLowerCase().includes(this.STUDENTDATA))
        this.ValidateStudentData();

    }
    readFile.readAsArrayBuffer(this.fileUploaded);

  }
  ValidateStudentClassData() {
    let slno: any = 0;
    this.ErrorMessage = '';
    this.ELEMENT_DATA = this.jsonData.map((element, indx) => {
      slno = parseInt(indx) + 1;

      let studentFilter = this.StudentList.filter(g => g.StudentId == element.StudentId);
      if (studentFilter.length == 0)
        this.ErrorMessage += "Invalid StudentId at row " + slno + ":" + element.StudentId + "<br>";
      let sectionFilter = this.Sections.filter(g => g.MasterDataName.toUpperCase() == element.Section.trim().toUpperCase());
      if (sectionFilter.length == 0)
        this.ErrorMessage += "Invalid section at row " + slno + ":" + element.Section + "<br>";
      else {
        element.Section = sectionFilter[0].MasterDataId;
      }
      let classFilter = this.Classes.filter(g => g.MasterDataName == element.Class);
      if (classFilter.length == 0)
        this.ErrorMessage += "Invalid Class at row " + slno + ":" + element.Class + "<br>";
      else {
        element.ClassId = classFilter[0].MasterDataId;
        var _studentclass = this.StudentClassList.filter(f => f.ClassId == classFilter[0].MasterDataId && f.StudentId == element.StudentId);
        if (_studentclass.length > 0)
          element.StudentClassId = _studentclass[0].StudentClassId
        else
          element.StudentClassId = 0;
      }
      var _regularFeeTypeIds = this.FeeTypes.filter(f => f.MasterDataName.toLowerCase() == 'regular');
      var _regularFeeTypeId = 0;
      if (_regularFeeTypeIds.length > 0)
        _regularFeeTypeId = _regularFeeTypeIds[0].MasterDataId;
      return {
        StudentId: +element.StudentId,
        ClassId: element.ClassId,
        Section: element.Section,
        RollNo: element.RollNo,
        StudentClassId: element.StudentClassId,
        FeeTypeId: _regularFeeTypeId,
        BatchId: this.SelectedBatchId,
        OrgId: this.loginDetail[0]["orgId"]

      }
    });
  }
  ValidateStudentData() {
    let slno: any = 0;
    this.ErrorMessage = '';
    this.ELEMENT_DATA = this.jsonData.map((element, indx) => {
      slno = parseInt(indx) + 1;
      //let checkProperty = [];
      this.displayedColumns.forEach(d => {
        if (d == "DOB") {
          element[d] = new Date(element[d]);
        }

        if (element[d] == undefined && this.NoNeedToCheckBlank.filter(b => b == d).length == 0)
          this.ErrorMessage += d + " is required at row " + slno + ".<br>";
      })

      let GenderFilter = this.Genders.filter(g => g.MasterDataName.toLowerCase() == element.Gender.toLowerCase());
      if (GenderFilter.length > 0)
        element.Gender = GenderFilter[0].MasterDataId;
      else
        this.ErrorMessage += "Invalid Gender at row " + slno + ":" + element.Gender + "<br>";

      let BloodgroupFilter = this.Bloodgroup.filter(g => g.MasterDataName.toLowerCase() == element.Bloodgroup.toLowerCase());
      if (BloodgroupFilter.length > 0)
        element.Bloodgroup = BloodgroupFilter[0].MasterDataId;
      else
        this.ErrorMessage += "Invalid Bloodgroup at row " + slno + ":" + element.Bloodgroup + "<br>";

      let Categoryfilter = this.Category.filter(g => g.MasterDataName.toLowerCase() == element.Category.toLowerCase());
      if (Categoryfilter.length > 0)
        element.Category = Categoryfilter[0].MasterDataId;
      else
        this.ErrorMessage += "Invalid Category at row " + slno + ":" + element.Category + "<br>";

      let ReligionFilter = this.Religion.filter(g => g.MasterDataName.toLowerCase() == element.Religion.toLowerCase());
      if (ReligionFilter.length > 0)
        element.Religion = ReligionFilter[0].MasterDataId;
      else
        this.ErrorMessage += "Invalid Religion at row " + slno + ":" + element.Religion + "<br>";

      let PrimaryContactFatherOrMotherFilter = this.PrimaryContact.filter(g => g.MasterDataName.toLowerCase() == element.PrimaryContactFatherOrMother.toLowerCase());
      if (PrimaryContactFatherOrMotherFilter.length > 0)
        element.PrimaryContactFatherOrMother = PrimaryContactFatherOrMotherFilter[0].MasterDataId;
      else
        this.ErrorMessage += "Invalid PrimaryContactFatherOrMother at row " + slno + ":" + element.PrimaryContactFatherOrMother + "<br>";

      let ClassAdmissionSoughtFilter = this.Classes.filter(g => g.MasterDataName.toLowerCase() == element.ClassAdmissionSought.toLowerCase());
      if (ClassAdmissionSoughtFilter.length > 0)
        element.ClassAdmissionSought = ClassAdmissionSoughtFilter[0].MasterDataId;
      else
        this.ErrorMessage += "Invalid ClassAdmissionSought at row " + slno + ":" + element.ClassAdmissionSought + "<br>";

      return {
        element
      }
    });
  }
  readAsCSV() {
    this.csvData = XLSX.utils.sheet_to_csv(this.worksheet);
    const data: Blob = new Blob([this.csvData], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "CSVFile" + new Date().getTime() + '.csv');
  }
  readAsJson() {
    try {
      let datalength = this.ELEMENT_DATA.length;
      if (this.ErrorMessage.length == 0) {
        this.ELEMENT_DATA.forEach((element, indx) => {
          this.studentData = [];
          element["Active"] = 1;
          if (this.Uploadtype.toLowerCase().includes(this.CLASSROLLNOMAPPING)) {
            if (element.StudentClassId > 0) {
              element.UpdatedDate = new Date();
              element.UpdatedBy = this.loginDetail[0]["userId"];
              this.studentData.push({ element });
              this.updateStudentClass();
            }
            else {
              element.CreatedDate = new Date();
              element.CreatedBy = this.loginDetail[0]["userId"];
              this.studentData.push({ element });
              this.saveStudentClass();
            }
          }
          else if (this.Uploadtype.toLowerCase().includes(this.STUDENTDATA)) {
            this.save();
          }
          if (datalength == indx + 1)
            this.alert.success("Data saved successfully.", this.options);
        });
      }
    }
    catch (ex) {
      console.log("something went wrong: ", ex);
    }
  }
  readAsHTML() {
    this.htmlData = XLSX.utils.sheet_to_html(this.worksheet);
    const data: Blob = new Blob([this.htmlData], { type: "text/html;charset=utf-8;" });
    FileSaver.saveAs(data, "HtmlFile" + new Date().getTime() + '.html');
  }
  readAsText() {
    this.textData = XLSX.utils.sheet_to_txt(this.worksheet);
    const data: Blob = new Blob([this.textData], { type: 'text/plain;charset=utf-8;' });
    FileSaver.saveAs(data, "TextFile" + new Date().getTime() + '.txt');
  }

  save() {

    this.dataservice.postPatch('Students', this.studentData[0].col, 0, 'post')
      .subscribe((result: any) => {

      }, error => console.log(error))
  }
  updateStudentClass() {
    this.dataservice.postPatch('StudentClasses', this.studentData[0].element, this.studentData[0].element.StudentClassId, 'patch')
      .subscribe((result: any) => {
      }, error => console.log(error))
  }
  saveStudentClass() {
    console.log('data to save', this.studentData[0].element)
    this.dataservice.postPatch('StudentClasses', this.studentData[0].element, 0, 'post')
      .subscribe((result: any) => {
        console.log('inserted');
      }, error => console.log(error))
  }
  GetStudentClasses() {
    this.filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenservice);

    let list: List = new List();
    list.fields = ["StudentId", "StudentClassId", "ClassId"];
    list.PageName = "StudentClasses";
    list.filter = ["Active eq 1 and " + this.filterOrgIdNBatchId];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClassList = [...data.value];
        this.loading = false;
      })
  }
  GetStudents() {

    let list: List = new List();
    list.fields = ["StudentId", "FirstName", "LastName", "Active"];
    list.PageName = "Students";
    list.filter = ["Active eq 1 and " + this.filterOrgId];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentList = [...data.value];
        this.GetStudentClasses();

      })
  }
  GetMasterData() {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 or " + this.filterOrgId + ")"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        this.AllMasterData = [...data.value];
        this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.UPLOADTYPE);
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.school.BLOODGROUP);
        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.school.CATEGORY);
        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.school.RELIGION);
        this.States = this.getDropDownData(globalconstants.MasterDefinitions.school.STATE);
        this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
        this.Location = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.SelectedBatchId = +this.tokenservice.getSelectedBatchId();
        this.GetStudents();
      });

  }
  getDropDownData(dropdowntype) {
    let Id = this.AllMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    })[0].MasterDataId;
    return this.AllMasterData.filter((item, index) => {
      return item.ParentId == Id
    });
  }
}
