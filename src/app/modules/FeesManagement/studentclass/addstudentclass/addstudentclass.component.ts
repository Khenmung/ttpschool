import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';

@Component({
  selector: 'app-addstudentclass',
  templateUrl: './addstudentclass.component.html',
  styleUrls: ['./addstudentclass.component.scss']
})
export class AddstudentclassComponent implements OnInit {
  @Input() BatchId: number;

  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SaveDisable = false;
  Id = 0;
  StudentClassId = 0;
  invalidId = false;
  //BatchId = 0;
  allMasterData = [];
  Students = [];
  Classes = [];
  Batches = [];
  Sections = [];
  FeeType = [];
  LanguageSubjectUpper = [];
  LanguageSubjectLower = [];
  studentclassForm: FormGroup;

  studentclassData = {
    StudentClassId: 0,
    StudentId: 0,
    ClassId: 0,
    Section: 0,
    RollNo: '',
    Batch: 0,
    FeeTypeId: 0,
    LanguageSubject: 0,
    AdmissionDate: new Date(),
    Remarks: '',
    Active: 1,
  }
  constructor(private dataservice: NaomitsuService,
    private aRoute: ActivatedRoute,
    private alert: AlertService,
    private nav: Router,
    private fb: FormBuilder,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
    // this.aRoute.paramMap.subscribe(p=>{
    //   this.Id= +p.get('id');
    // });
    // this.aRoute.queryParamMap.subscribe(p=>{      
    //   this.StudentClassId = +p.get('scid');
    //   this.BatchId =+p.get('bid');
    //   let checkbatchid=this.Batches.filter(b=>b.MasterDataId==this.BatchId);
    //     if(checkbatchid.length==0)
    //     {
    //       this.alert.error('Invalid Batch Id',this.optionsNoAutoClose);
    //       return;
    //     }
    // })

    this.studentclassForm = this.fb.group({
      StudentClassId: [0],
      StudentId: [0, [Validators.required]],
      ClassId: [0, [Validators.required]],
      Section: [0, [Validators.required]],
      RollNo: ['', [Validators.required]],
      FeeTypeId: [0, [Validators.required]],
      LanguageSubject: [0, [Validators.required]],
      Remarks: [''],
      AdmissionDate: [new Date(), [Validators.required]],
      Active: [1],
    });
  }
  PageLoad() {
    
    this.shareddata.CurrentBatch.subscribe(t => (this.Batches = t));
    this.shareddata.currentFeeType.subscribe(t => (this.FeeType = t));
    this.shareddata.currentLanguageSubjectLower.subscribe(t => (this.LanguageSubjectLower = t));
    this.shareddata.currentLanguageSubjectUpper.subscribe(t => (this.LanguageSubjectUpper = t));
    this.shareddata.currentSection.subscribe(t => (this.Sections = t));
    this.shareddata.CurrentClasses.subscribe(cls => (this.Classes = cls));
    this.shareddata.CurrentStudentId.subscribe(id => (this.Id = id));
    this.shareddata.CurrentStudentClassId.subscribe(scid => (this.StudentClassId = scid));
    this.shareddata.CurrentBatchId.subscribe(bid => (this.BatchId = bid));
    
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
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.CLASSES);
        //debugger;
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.BATCH);
        this.FeeType = this.getDropDownData(globalconstants.MasterDefinitions.FEETYPE);
        this.LanguageSubjectLower = this.getDropDownData(globalconstants.MasterDefinitions.LANGUAGESUBJECTLOWERCLS);
        this.LanguageSubjectUpper = this.getDropDownData(globalconstants.MasterDefinitions.LANGUAGESUBJECTUPPERCLS);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.SECTION);
        // let currentBatch = globalconstants.getCurrentBatch();
        // let currentBatchObj = this.Batches.filter(item => item.MasterDataName == currentBatch);
        // if (currentBatchObj.length > 0) {
        //   this.currentbatchId = currentBatchObj[0].MasterDataId
        // }

        this.aRoute.paramMap.subscribe(param => {
          this.Id = +param.get("id");
          this.GetStudent();
        })
      });

  }
  StudentChange(event) {
    if (this.Id == event.value) {
      this.SaveDisable = false;
    }
    else
      this.SaveDisable = true;

    //this.Id = event.value;
    this.GetStudentClass();

  }
  GetStudent() {
    if (this.Id == 0) {
      this.alert.error("Invalid StudentId", this.optionsAutoClose);
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
            this.alert.error("Invalid student Id", this.optionsAutoClose);
          }
        }
        else
          this.alert.error("Problem fetching students' data", this.optionsNoAutoClose);
      });

  }
  GetStudentClass() {
    if (this.Id == 0 && this.StudentClassId == 0) {
      this.alert.error("Invalid Student Id", this.optionsAutoClose);
      return;
    }
    // let studentId = 0;
    // if (tempStudentClassId > 0)
    //   studentId = tempStudentId;
    // else
    //   studentId = this.Id;

    let list: List = new List();
    list.fields = ["StudentClassId", "ClassId", "StudentId", "RollNo", "Section", "Batch", "FeeTypeId", "LanguageSubject", "AdmissionDate", "Remarks", "Active"];
    list.PageName = "StudentClasses";
    list.filter = ["Active eq 1 and StudentClassId eq " + this.StudentClassId];

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
            AdmissionDate: data.value[0].AdmissionDate,
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
            Batch: this.BatchId,
            FeeTypeId: 0,
            LanguageSubject: 0,
            AdmissionDate: new Date(),
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
    debugger;
    let ErrorMessage = '';

    if (this.studentclassForm.get("ClassId").value == 0) {
      ErrorMessage += "Please select class.<br>";
    }
    if (this.studentclassForm.get("RollNo").value == 0) {
      ErrorMessage += "Roll no. is required.<br>";
    }
    if (this.studentclassForm.get("Section").value == 0) {
      ErrorMessage += "Please select Section.<br>";
    }
    if (this.studentclassForm.get("FeeTypeId").value == 0) {
      ErrorMessage += "Please select Fee Type.<br>";
    }
    if (this.studentclassForm.get("LanguageSubject").value == 0) {
      ErrorMessage += "Please select Language Subject.<br>";
    }
    if (this.studentclassForm.get("AdmissionDate").value == 0) {
      ErrorMessage += "Admission date is required.<br>";
    }
    if (ErrorMessage.length > 0) {
      this.alert.error(ErrorMessage, this.optionsNoAutoClose);
      return;
    }
    else {
      this.studentclassData.Active = 1;
      this.studentclassData.Batch = this.BatchId;

      this.studentclassData.ClassId = this.studentclassForm.value.ClassId;
      this.studentclassData.RollNo = this.studentclassForm.value.RollNo;
      this.studentclassData.Section = this.studentclassForm.value.Section;
      this.studentclassData.FeeTypeId = this.studentclassForm.value.FeeTypeId;
      this.studentclassData.LanguageSubject = this.studentclassForm.value.LanguageSubject;
      this.studentclassData.Remarks = this.studentclassForm.value.Remarks;
      this.studentclassData.AdmissionDate = this.studentclassForm.value.AdmissionDate;

      this.studentclassData.StudentId = this.Id;
      if (this.studentclassForm.value.StudentClassId == 0)
        this.insert();
      else {
        this.studentclassData.StudentClassId = this.studentclassForm.value.StudentClassId;
        this.update();
      }
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
