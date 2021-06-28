import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../../shared/components/alert/alert.service';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
import { SharedataService } from '../../../../shared/sharedata.service';

@Component({
  selector: 'app-addstudentclass',
  templateUrl: './addstudentclass.component.html',
  styleUrls: ['./addstudentclass.component.scss']
})
export class AddstudentclassComponent implements OnInit {
  breakpoint=0;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SaveDisable = false;
  StudentId = 0;
  StudentClassId = 0;
  BatchId=0;
  SelectedBatchId=0;
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
  StudentName='';
  studentclassData = {
    StudentClassId: 0,
    StudentId: 0,
    ClassId: 0,
    Section: 0,
    RollNo: '',
    BatchId: 0,
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
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 3;
    //console.log('breakpoint',this.breakpoint);
    this.studentclassForm = this.fb.group({      
      StudentName: [{value:this.StudentName,disabled:true}],
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
    debugger;
    this.shareddata.CurrentBatch.subscribe(t => (this.Batches = t));
    this.shareddata.CurrentFeeType.subscribe(t => (this.FeeType = t));
    this.shareddata.CurrentLanguageSubjectLower.subscribe(t => (this.LanguageSubjectLower = t));
    this.shareddata.CurrentLanguageSubjectUpper.subscribe(t => (this.LanguageSubjectUpper = t));
    this.shareddata.CurrentSection.subscribe(t => (this.Sections = t));
    this.shareddata.CurrentClasses.subscribe(cls => (this.Classes = cls));
    this.shareddata.CurrentStudentId.subscribe(id => (this.StudentId = id));
    this.shareddata.CurrentStudentClassId.subscribe(scid => (this.StudentClassId = scid));
    this.shareddata.CurrentSelectedBatchId.subscribe(bid => (this.BatchId = bid));
    this.shareddata.CurrentStudentName.subscribe(name=>(this.StudentName=name));
    this.shareddata.CurrentSelectedBatchId.subscribe(Id=>(this.SelectedBatchId=Id));

    this.GetStudentClass();
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
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[0].school[0].CLASS);
        //debugger;
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[0].school[0].BATCH);
        this.shareddata.CurrentBatch.subscribe(c=>(this.Batches=c));
        this.shareddata.CurrentSelectedBatchId.subscribe(c=>(this.BatchId=c));
        this.FeeType = this.getDropDownData(globalconstants.MasterDefinitions[0].school[0].FEETYPE);
        this.LanguageSubjectLower = this.getDropDownData(globalconstants.MasterDefinitions[0].school[0].LANGUAGESUBJECTLOWERCLS);
        this.LanguageSubjectUpper = this.getDropDownData(globalconstants.MasterDefinitions[0].school[0].LANGUAGESUBJECTUPPERCLS);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions[0].school[0].SECTION);
        // let currentBatch = globalconstants.getCurrentBatch();
        // let currentBatchObj = this.Batches.filter(item => item.MasterDataName == currentBatch);
        // if (currentBatchObj.length > 0) {
        //   this.SelectedBatchId = currentBatchObj[0].MasterDataId
        // }

        this.aRoute.paramMap.subscribe(param => {
          //this.Id = +param.get("id");
          this.GetStudent();
        })
      });

  }
  StudentChange(event) {
    if (this.StudentId == event.value) {
      this.SaveDisable = false;
    }
    else
      this.SaveDisable = true;

    //this.Id = event.value;
    this.GetStudentClass();

  }
  GetStudent() {
    if (this.StudentId == 0) {
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
          let ValidStudent = this.Students.filter(student => student.StudentId == this.StudentId)
          if (ValidStudent.length > 0) {
            this.studentclassForm.patchValue({ StudentId: this.StudentId });
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
    if (this.StudentId == 0 && this.StudentClassId == 0) {
      this.alert.error("Invalid Student Id", this.optionsAutoClose);
      return;
    }
    // let studentId = 0;
    // if (tempStudentClassId > 0)
    //   studentId = tempStudentId;
    // else
    //   studentId = this.Id;

    let list: List = new List();
    list.fields = ["StudentClassId", "ClassId", "StudentId", "RollNo", "Section", "BatchId", "FeeTypeId", "LanguageSubject", "AdmissionDate", "Remarks", "Active"];
    list.PageName = "StudentClasses";
    list.filter = ["Active eq 1 and StudentClassId eq " + this.StudentClassId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
           
          this.studentclassForm.patchValue({
            StudentId: data.value[0].StudentId,
            ClassId: data.value[0].ClassId,
            Section: data.value[0].Section,
            RollNo: data.value[0].RollNo,
            BatchId: data.value[0].BatchId,
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
            StudentName: this.StudentName,
            ClassId: 0,
            Section: 0,
            RollNo: '',
            BatchId: this.SelectedBatchId,
            FeeTypeId: 0,
            LanguageSubject: 0,
            AdmissionDate: new Date(),
            Remarks: '',
            Active: 1
          });
          this.alert.info("Class yet to be defined for this student", this.optionsAutoClose);
        }
      });

  }
  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 3;
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
      this.studentclassData.BatchId = this.SelectedBatchId==0?this.BatchId:this.SelectedBatchId;

      this.studentclassData.ClassId = this.studentclassForm.value.ClassId;
      this.studentclassData.RollNo = this.studentclassForm.value.RollNo;
      this.studentclassData.Section = this.studentclassForm.value.Section;
      this.studentclassData.FeeTypeId = this.studentclassForm.value.FeeTypeId;
      this.studentclassData.LanguageSubject = this.studentclassForm.value.LanguageSubject;
      this.studentclassData.Remarks = this.studentclassForm.value.Remarks;
      this.studentclassData.AdmissionDate = this.studentclassForm.value.AdmissionDate;

      this.studentclassData.StudentId = this.StudentId;
      if (this.StudentClassId == 0)
        this.insert();
      else {
        this.studentclassData.StudentClassId = this.StudentClassId;
        this.update();
      }
    }
  }

  insert() {

    debugger;
    this.dataservice.postPatch('StudentClasses', this.studentclassData, 0, 'post')
      .subscribe(
        (data: any) => {
          //console.log('before',this.StudentClassId);
          this.StudentClassId = data.StudentClassId;
          this.shareddata.ChangeStudentClassId(this.StudentClassId);
          //console.log('after',this.StudentClassId);
          
          this.alert.success("Data saved successfully", this.optionsAutoClose);
          //this.router.navigate(['/home/pages']);
        });

  }
  update() {

    this.dataservice.postPatch('StudentClasses', this.studentclassData, this.StudentClassId, 'patch')
      .subscribe(
        (data: any) => {
          this.alert.success("Data updated successfully", this.optionsAutoClose);
          //this.router.navigate(['/home/pages']);
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
