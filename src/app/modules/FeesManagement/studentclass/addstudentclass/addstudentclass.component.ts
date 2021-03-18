import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';

@Component({
  selector: 'app-addstudentclass',
  templateUrl: './addstudentclass.component.html',
  styleUrls: ['./addstudentclass.component.scss']
})
export class AddstudentclassComponent implements OnInit {
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  Id = 0;
  currentbatchId = 0;
  allMasterData = [];
  Students = [];
  Classes = [];
  Batches = [];
  Sections = [];
  FeeType = [];
  LanguageSubjectUpper = [];
  LanguageSubjectLower = [];
  studentclassForm = new FormGroup({
    StudentClassId: new FormControl('0'),
    StudentId: new FormControl(0, [Validators.required]),
    ClassId: new FormControl(0, [Validators.required]),
    Section: new FormControl('', [Validators.required]),
    RollNo: new FormControl('', [Validators.required]),
    Batch: new FormControl(0, [Validators.required]),
    FeeTypeId: new FormControl(0, [Validators.required]),
    LanguageSubject: new FormControl(0),
    Remarks: new FormControl(''),
    Active: new FormControl(0, [Validators.required]),
  });
  constructor(private dataservice: NaomitsuService,
    private aRoute: ActivatedRoute,
    private alert: AlertService,
    private nav: Router) { }

  ngOnInit(): void {
    this.aRoute.paramMap.subscribe(param => {
      this.Id = +param.get("id");
      this.GetStudent();
    })
    this.GetMasterData();

  }


  get f() { return this.studentclassForm.controls }

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
        this.Classes = this.getDropDownData(globalconstants.CLASSES);
        //debugger;
        this.Batches = this.getDropDownData(globalconstants.BATCH);
        this.FeeType = this.getDropDownData(globalconstants.FEETYPE);
        this.LanguageSubjectLower = this.getDropDownData(globalconstants.LANGUAGESUBJECTLOWERCLS);
        this.LanguageSubjectUpper = this.getDropDownData(globalconstants.LANGUAGESUBJECTUPPERCLS);
        this.Sections = this.getDropDownData(globalconstants.SECTION);
        let currentBatch = globalconstants.getCurrentBatch();
        let currentBatchObj = this.Batches.filter(item => item.MasterDataName == currentBatch);
        if (currentBatchObj.length > 0) {
          this.currentbatchId = currentBatchObj[0].MasterDataId
        }
      });

  }
  updateId(event) {
    this.Id = event.value;
    //this.GetStudent();

  }
  GetStudent() {
    if (this.Id == 0) {
      this.alert.error("Invalid StudentId", this.options);
      return;
    }
    let list: List = new List();
    list.fields = ["StudentId", "Name", "FatherName", "MotherName"];
    list.PageName = "Students";
    list.filter = ["Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.Students = data.value.map(student => {
            student.studentName = student.StudentId + " " + student.Name + " " + student.FatherName + " " + student.MotherName;
            return student;
          })
          this.studentclassForm.patchValue({ StudentId: this.Id });
        }
        else
          this.alert.error("Invalid student Id", this.options);
        //this.filterdOptions = [...this.Students];
      });

  }
  GetStudentClass() {
    if (this.Id == 0) {
      this.alert.error("Invalid StudentId", this.options);
      return;
    }
    let list: List = new List();
    list.fields = ["StudentClassId", "ClassId", "StudentId", "RollNo", "Section", "Batch", "FeeTypeId", "LanguageSubject", "Remarks", "Active"];
    list.PageName = "StudentClasses";
    list.filter = ["Active eq 1 and StudentId eq " + this.Id + ' and Batch eq ' + this.currentbatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.studentclassForm.patchValue({
            StudentClassId: data.value[0].StudentClassId,
            StudentId: data.value[0].StudentId,
            ClassId: data.value[0].ClassId,
            Section: data.value[0].Section,
            RollNo: data.value[0].RollNo,
            Batch: data.value[0].Batch,
            FeeTypeId: data.value[0].FeeTypeId,
            LanguageSubject: data.value[0].LanguageSubject,
            Remarks: data.value[0].Remarks,
            Active: data.value[0].Active,
          });
        }
        else
          this.alert.error("Invalid student Id", this.options);
        //this.filterdOptions = [...this.Students];
      });

  }
  back() {
    this.nav.navigate(['/admin/dashboardstudent']);
  }
  save() {

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
