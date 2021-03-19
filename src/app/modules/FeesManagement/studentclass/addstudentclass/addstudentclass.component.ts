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
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  Id = 0;
  invalidId = false;
  currentbatch: string;
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
  studentclassData = {
    StudentClassId: 0,
    StudentId: 0,
    ClassId: 0,
    Section: 0,
    RollNo: '',
    Batch: 0,
    FeeTypeId: 0,
    LanguageSubject: 0,
    Remarks: '',
    Active: 1,
  }
  constructor(private dataservice: NaomitsuService,
    private aRoute: ActivatedRoute,
    private alert: AlertService,
    private nav: Router) { }

  ngOnInit(): void {
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
        //console.log(data.value);
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

        this.aRoute.paramMap.subscribe(param => {
          this.Id = +param.get("id");
          this.GetStudent();
        })
      });

  }
  StudentChange(event) {
   
    this.Id = event.value;
    this.GetStudentClass();
    
  }
  GetStudent() {
    if (this.Id == 0) {
      this.alert.error("Invalid StudentId", this.optionsNoAutoClose);
      this.invalidId = true;
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
          let ValidStudent = this.Students.filter(student => student.StudentId == this.Id)
          if (ValidStudent.length > 0) {
            this.studentclassForm.patchValue({ StudentId: this.Id });
            this.GetStudentClass();
          }
          else {
            this.invalidId = true;
            this.alert.error("Invalid student Id", this.optionsNoAutoClose);
          }
        }
        else
          this.alert.error("Problem fetching students' data", this.optionsNoAutoClose);
      });

  }
  GetStudentClass() {
    if (this.Id == 0) {
      this.alert.error("Invalid StudentId", this.optionsNoAutoClose);

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
        else {
          this.studentclassForm.patchValue({
            StudentClassId: 0,
            StudentId: this.Id,
            ClassId: 0,
            Section: 0,
            RollNo: '',
            Batch: this.currentbatchId,
            FeeTypeId: 0,
            LanguageSubject: 0,
            Remarks: '',
            Active: 1
          });
          this.alert.info("No class defined for this student", this.optionsAutoClose);
        }
      });

  }
  back() {
    this.nav.navigate(['/admin/dashboardstudent']);
  }
  UpdateOrSave() {

    this.studentclassData.Active = 1;
    this.studentclassData.Batch = this.currentbatchId;
    this.studentclassData.ClassId = this.studentclassForm.get("ClassId").value;
    this.studentclassData.FeeTypeId = this.studentclassForm.get("FeeTypeId").value;
    this.studentclassData.LanguageSubject = this.studentclassForm.get("LanguageSubject").value;
    this.studentclassData.Remarks = this.studentclassForm.get("Remarks").value;
    this.studentclassData.RollNo = this.studentclassForm.get("RollNo").value;
    this.studentclassData.Section = this.studentclassForm.get("Section").value;
    
    this.studentclassData.StudentId = this.Id;
    if (this.studentclassForm.get("StudentClassId").value == 0)
      this.insert();
    else
    {
      this.studentclassData.StudentClassId = this.studentclassForm.get("StudentClassId").value;
      this.update();
    }
    
  }

  insert() {

    debugger;
    this.dataservice.postPatch('StudentClasses', this.studentclassData, 0, 'post')
      .subscribe(
        (data: any) => {

          this.alert.success("Data saved successfully", this.optionsAutoClose);
          //this.router.navigate(['/pages']);
        });

  }
  update() {

    this.dataservice.postPatch('StudentClasses', this.studentclassData, this.studentclassData.StudentClassId, 'patch')
      .subscribe(
        (data: any) => {
          this.alert.success("Data updated successfully", this.optionsAutoClose);
          //this.router.navigate(['/pages']);
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
