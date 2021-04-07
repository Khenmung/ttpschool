import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { List } from 'src/app/shared/interface';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/shared/components/alert/alert.service';

@Component({
  selector: 'app-excel-data-management',
  templateUrl: './excel-data-management.component.html',
  styleUrls: ['./excel-data-management.component.scss']
})
export class ExcelDataManagementComponent implements OnInit {
  constructor(private dataservice: NaomitsuService,
    private fb: FormBuilder,
    private alert: AlertService) {

  }
  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
    this.GetMasterData();
    this.uploadForm = this.fb.group({
      UploadTypeId: [0, [Validators.required]]
    })
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
  //Country = [];
  Genders = [];
  Category = [];
  Bloodgroup = [];
  Religion = [];
  States = [];
  PrimaryContact = [];
  Location = [];
  PrimaryContactFatherOrMother = [];
  studentData: any[];
  onselectchange(event) {
    //debugger;
    console.log('event', event);
    let Uploadtype = this.UploadTypes.filter(item => {
      return item.MasterDataId == event.value
    })[0].MasterDataName

    if (Uploadtype.toLowerCase().includes('rollno mapping'))
      this.displayedColumns = ["StudentId", "StudentName", "Class", "RollNo"];
    else if (Uploadtype.toLowerCase().includes('student upload'))
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
  uploadedFile(event) {
    this.fileUploaded = event.target.files[0];
    this.selectedFile = this.fileUploaded.name;
    this.readExcel();
  }
  readExcel() {
    debugger;

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
      let slno: any = 0;
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

        let GenderFilter = this.Genders.filter(g => g.MasterDataName == element.Gender);
        if (GenderFilter.length > 0)
          element.Gender = GenderFilter[0].MasterDataId;
        else
          this.ErrorMessage += "Invalid Gender at row " + slno + ":" + element.Gender + "<br>";

        let BloodgroupFilter = this.Bloodgroup.filter(g => g.MasterDataName == element.Bloodgroup);
        if (BloodgroupFilter.length > 0)
          element.Bloodgroup = BloodgroupFilter[0].MasterDataId;
        else
          this.ErrorMessage += "Invalid Bloodgroup at row " + slno + ":" + element.Bloodgroup + "<br>";

        let Categoryfilter = this.Category.filter(g => g.MasterDataName == element.Category);
        if (Categoryfilter.length > 0)
          element.Category = Categoryfilter[0].MasterDataId;
        else
          this.ErrorMessage += "Invalid Category at row " + slno + ":" + element.Category + "<br>";

        let ReligionFilter = this.Religion.filter(g => g.MasterDataName == element.Religion);
        if (ReligionFilter.length > 0)
          element.Religion = ReligionFilter[0].MasterDataId;
        else
          this.ErrorMessage += "Invalid Religion at row " + slno + ":" + element.Religion + "<br>";

        let PrimaryContactFatherOrMotherFilter = this.PrimaryContact.filter(g => g.MasterDataName == element.PrimaryContactFatherOrMother);
        if (PrimaryContactFatherOrMotherFilter.length > 0)
          element.PrimaryContactFatherOrMother = PrimaryContactFatherOrMotherFilter[0].MasterDataId;
        else
          this.ErrorMessage += "Invalid PrimaryContactFatherOrMother at row " + slno + ":" + element.PrimaryContactFatherOrMother + "<br>";

        let ClassAdmissionSoughtFilter = this.Classes.filter(g => g.MasterDataName == element.ClassAdmissionSought);
        if (ClassAdmissionSoughtFilter.length > 0)
          element.ClassAdmissionSought = ClassAdmissionSoughtFilter[0].MasterDataId;
        else
          this.ErrorMessage += "Invalid ClassAdmissionSought at row " + slno + ":" + element.ClassAdmissionSought + "<br>";

        return {
          element
        }
      });
      //this.jsonData = JSON.stringify(this.jsonData);
      //this.ELEMENT_DATA = [...this.jsonData];
      //this.dataSource = new MatTableDataSource<any>(this.jsonData);
      //console.log('this.Elementdata', this.ELEMENT_DATA);
    }
    readFile.readAsArrayBuffer(this.fileUploaded);

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
          for (const col in element) {
            this.studentData.push({ col: element[col] })
          }
          this.studentData["Active"] =1;
          //this.studentData = element;
          //console.log('element', this.studentData);
          //this.studentData =JSON.stringify(this.studentData);
          this.save();
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
        // debugger;
        // if (result != undefined) {

        //   this.alert.success("Student's data saved successfully.", this.options);

        // }

      }, error => console.log(error))
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
        this.AllMasterData = [...data.value];
        this.UploadTypes = this.getDropDownData(globalconstants.UPLOADTYPE);
        this.Genders = this.getDropDownData(globalconstants.GENDER);
        this.Bloodgroup = this.getDropDownData(globalconstants.BLOODGROUP);
        this.Category = this.getDropDownData(globalconstants.CATEGORY);
        this.Religion = this.getDropDownData(globalconstants.RELIGION);
        this.States = this.getDropDownData(globalconstants.STATE);
        this.PrimaryContact = this.getDropDownData(globalconstants.PRIMARYCONTACT);
        this.Location = this.getDropDownData(globalconstants.LOCATION);
        this.Classes = this.getDropDownData(globalconstants.CLASSES);
        //this.PrimaryContactFatherOrMother= this.getDropDownData(globalconstants.PRIMARYCONTACT);
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
