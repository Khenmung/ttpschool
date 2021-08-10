import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';

@Component({
  selector: 'app-addstudentclass',
  templateUrl: './addstudentclass.component.html',
  styleUrls: ['./addstudentclass.component.scss']
})
export class AddstudentclassComponent implements OnInit {
  loading=false;
  breakpoint = 0;
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
  //BatchId = 0;
  SelectedBatchId = 0;
  invalidId = false;
  //BatchId = 0;
  allMasterData = [];
  Students = [];
  Classes = [];
  Batches = [];
  Sections = [];
  FeeType = [];
  studentclassForm: FormGroup;
  StudentName = '';
  loginUserDetail =[];
  studentclassData = {
    StudentClassId: 0,
    StudentId: 0,
    ClassId: 0,
    SectionId: 0,
    RollNo: '',
    BatchId: 0,
    FeeTypeId: 0,
    AdmissionDate: new Date(),
    Remarks: '',
    Active: 1,
    OrgId:0
  }
  constructor(private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private aRoute: ActivatedRoute,
    private alert: AlertService,
    private nav: Router,
    private fb: FormBuilder,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 3;
    this.studentclassForm = this.fb.group({
      StudentName: [{ value: this.StudentName, disabled: true }],
      ClassId: [0, [Validators.required]],
      SectionId: [0, [Validators.required]],
      RollNo: ['', [Validators.required]],
      FeeTypeId: [0, [Validators.required]],
      Remarks: [''],
      AdmissionDate: [new Date(), [Validators.required]],
      Active: [1],
    });
  }
  PageLoad() {
    debugger;
    this.loginUserDetail = this.tokenstorage.getUserDetail();
    this.shareddata.CurrentBatch.subscribe(t => (this.Batches = t));
    this.shareddata.CurrentFeeType.subscribe(t => (this.FeeType = t));
    this.shareddata.CurrentSection.subscribe(t => (this.Sections = t));
    this.shareddata.CurrentClasses.subscribe(cls => (this.Classes = cls));
    this.shareddata.CurrentStudentId.subscribe(id => (this.StudentId = id));
    this.shareddata.CurrentStudentClassId.subscribe(scid => (this.StudentClassId = scid));
    this.shareddata.CurrentStudentName.subscribe(name => (this.StudentName = name));
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
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
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASS);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        //this.shareddata.CurrentSelectedBatchId.subscribe(c=>(this.BatchId=c));
        this.FeeType = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].FEETYPE);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SECTION);

        this.aRoute.paramMap.subscribe(param => {
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
    var filterOrgId = globalconstants.getStandardFilter(this.tokenstorage);
    if (this.StudentId == 0) {
      this.alert.error("Invalid StudentId", this.optionsAutoClose);
      this.invalidId = true;
      return;
    }
    let list: List = new List();
    list.fields = ["StudentId", "Name", "FatherName", "MotherName"];
    list.PageName = "Students";
    list.filter = ["Active eq 1 and " + filterOrgId];

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
    debugger;
    var filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
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
    list.fields = ["StudentClassId", "ClassId", "StudentId", "RollNo", "SectionId", "BatchId", "FeeTypeId", "AdmissionDate", "Remarks", "Active"];
    list.PageName = "StudentClasses";
    list.filter = ["Active eq 1 and StudentClassId eq " + this.StudentClassId + " and " + filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {

          this.studentclassForm.patchValue({
            StudentId: data.value[0].StudentId,
            ClassId: data.value[0].ClassId,
            SectionId: data.value[0].SectionId,
            RollNo: data.value[0].RollNo,
            BatchId: data.value[0].BatchId,
            FeeTypeId: data.value[0].FeeTypeId,
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
            SectionId: 0,
            RollNo: '',
            BatchId: this.SelectedBatchId,
            FeeTypeId: 0,
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
    if (this.studentclassForm.get("SectionId").value == 0) {
      ErrorMessage += "Please select Section.<br>";
    }
    if (this.studentclassForm.get("FeeTypeId").value == 0) {
      ErrorMessage += "Please select Fee Type.<br>";
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
      this.studentclassData.BatchId = this.SelectedBatchId;

      this.studentclassData.ClassId = this.studentclassForm.value.ClassId;
      this.studentclassData.RollNo = this.studentclassForm.value.RollNo;
      this.studentclassData.SectionId = this.studentclassForm.value.SectionId;
      this.studentclassData.FeeTypeId = this.studentclassForm.value.FeeTypeId;
      this.studentclassData.Remarks = this.studentclassForm.value.Remarks;
      this.studentclassData.AdmissionDate = this.studentclassForm.value.AdmissionDate;
      this.studentclassData.OrgId = this.loginUserDetail[0]["orgId"];
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
