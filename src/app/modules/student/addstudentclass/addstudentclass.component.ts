import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ContentService } from 'src/app/shared/content.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
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
  PageLoading = true;
  loading = false;
  breakpoint = 0;
  SaveDisable = false;
  StudentId = 0;
  StudentClassId = 0;
  SelectedBatchId = 0;
  invalidId = false;
  allMasterData = [];
  Students = [];
  Classes = [];
  Houses = [];
  Sections = [];
  FeeType = [];
  studentclassForm: FormGroup;
  StudentName = '';
  SelectedApplicationId = 0;
  LoginUserDetail = [];
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
    Promoted: 0,
    Active: 1,
    OrgId: 0
  }
  Permission = '';
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private aRoute: ActivatedRoute,
    private nav: Router,
    private fb: FormBuilder,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 3;
    var today = new Date();
    this.studentclassForm = this.fb.group({
      StudentName: [{ value: this.StudentName, disabled: true }],
      ClassId: [0, [Validators.required]],
      SectionId: [0],
      RollNo: [''],
      FeeTypeId: [0],
      Remarks: [''],
      AdmissionDate: [today],
      Active: [1],
    });
    this.PageLoad();
  }
  PageLoad() {
    debugger;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail.length == 0)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.SUBJECT.CLASSSUBJECTDETAIL);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission == 'deny') {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {

        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();

        this.shareddata.CurrentFeeType.subscribe(t => this.FeeType = t);
        if (this.FeeType.length == 0)
          this.GetFeeTypes();
        this.shareddata.CurrentSection.subscribe(t => this.Sections = t);
        this.shareddata.CurrentHouse.subscribe(t => this.Houses = t);
        this.StudentId = this.tokenstorage.getStudentId();
        this.StudentClassId = this.tokenstorage.getStudentClassId()
        this.shareddata.CurrentStudentName.subscribe(name => this.StudentName = name);
        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.GetMasterData();
        //this.GetStudentClass();
      }
    }
  }
  get f() { return this.studentclassForm.controls }

  GetMasterData() {
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
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
  GetFeeTypes() {
    debugger;
    this.loading = true;
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeType = [...data.value];
        this.shareddata.ChangeFeeType(this.FeeType);
        this.loading = false; this.PageLoading = false;
      })
  }
  GetStudent() {
    debugger;
    var filterOrgId = globalconstants.getStandardFilter(this.LoginUserDetail);
    if (this.StudentId == 0) {
      this.contentservice.openSnackBar("Invalid student Id", globalconstants.ActionText, globalconstants.RedBackground);
      this.invalidId = true;
      return;
    }
    let list: List = new List();
    list.fields = ["StudentId", "FirstName", "LastName", "FatherName", "MotherName"];
    list.PageName = "Students";
    list.filter = [filterOrgId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.Students = data.value.map(student => {
            var name = student.FirstName + " " + student.LastName;
            student.studentName = student.StudentId + "-" + name + "-" + student.FatherName + "-" + student.MotherName;
            return student;
          })
          let ValidStudent = this.Students.filter(student => student.StudentId == this.StudentId)
          if (ValidStudent.length > 0) {
            this.studentclassForm.patchValue({ StudentId: this.StudentId });
            this.GetStudentClass();
          }
          else {
            this.invalidId = true;
            this.contentservice.openSnackBar("Invalid student Id", globalconstants.ActionText, globalconstants.RedBackground);
          }
        }
        else
          this.contentservice.openSnackBar("Problem fetching students' data", globalconstants.ActionText, globalconstants.RedBackground);
      });

  }
  GetStudentClass() {
    debugger;
    var filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

    if (this.StudentId > 0 && this.StudentClassId > 0) {

      let list: List = new List();
      list.fields = [
        "StudentClassId", "ClassId",
        "StudentId", "RollNo", "SectionId",
        "BatchId", "FeeTypeId",
        "AdmissionDate", "Remarks", "Active"];
      list.PageName = "StudentClasses";
      list.filter = ["StudentClassId eq " + this.StudentClassId + " and " + filterOrgIdNBatchId];

      this.dataservice.get(list)
        .subscribe((data: any) => {
          if (data.value.length > 0) {
            var admissiondate = moment(data.value[0].AdmissionDate).isBefore("1970-01-01")
            this.studentclassForm.patchValue({
              StudentId: data.value[0].StudentId,
              ClassId: data.value[0].ClassId,
              SectionId: data.value[0].SectionId,
              RollNo: data.value[0].RollNo,
              BatchId: data.value[0].BatchId,
              FeeTypeId: data.value[0].FeeTypeId,
              AdmissionDate: admissiondate ? moment() : data.value[0].AdmissionDate,
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
              AdmissionDate: moment(),
              Remarks: '',
              Active: 1
            });
            this.contentservice.openSnackBar("Class yet to be defined for this student", globalconstants.ActionText, globalconstants.RedBackground);
          }
          this.loading = false;
          this.PageLoading = false;
        });
    }
    else {
      this.loading = false;
      this.PageLoading = false;
    }
  }
  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 3;
  }
  back() {
    this.nav.navigate(['/edu']);
  }
  UpdateOrSave() {
    debugger;
    let ErrorMessage = '';

    if (this.studentclassForm.get("ClassId").value == 0) {
      ErrorMessage += "Please select class.<br>";
    }
    // if (this.studentclassForm.get("RollNo").value == null) {
    //   ErrorMessage += "Roll no. is required.<br>";
    // }
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
      this.contentservice.openSnackBar(ErrorMessage, globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      this.loading = true;
      this.studentclassData.Active = 1;
      this.studentclassData.BatchId = this.SelectedBatchId;
      this.studentclassData.ClassId = this.studentclassForm.value.ClassId;
      this.studentclassData.RollNo = this.studentclassForm.value.RollNo;
      this.studentclassData.SectionId = this.studentclassForm.value.SectionId;
      this.studentclassData.FeeTypeId = this.studentclassForm.value.FeeTypeId;
      this.studentclassData.Remarks = this.studentclassForm.value.Remarks;
      this.studentclassData.AdmissionDate = this.studentclassForm.value.AdmissionDate;
      this.studentclassData.OrgId = this.LoginUserDetail[0]["orgId"];
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

    //debugger;
    this.dataservice.postPatch('StudentClasses', this.studentclassData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          this.StudentClassId = data.StudentClassId;
          this.tokenstorage.saveStudentClassId(this.StudentClassId + "")
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });

  }
  update() {

    this.dataservice.postPatch('StudentClasses', this.studentclassData, this.StudentClassId, 'patch')
      .subscribe(
        (data: any) => {

          this.contentservice.getInvoice(+this.LoginUserDetail[0]["orgId"], this.studentclassData.BatchId, this.StudentClassId)
            .subscribe((data: any) => {

              this.contentservice.createInvoice(data, this.SelectedBatchId, this.LoginUserDetail[0]["orgId"])
                .subscribe((data: any) => {
                  this.loading = false; this.PageLoading = false;
                  this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
                },
                  error => {
                    this.loading = false; this.PageLoading = false;
                    console.log("error in createInvoice", error);
                  })
            },
              error => {
                this.loading = false; this.PageLoading = false;
                console.log("error in getinvoice", error);
              })
        },
        error => {
          this.loading = false; this.PageLoading = false;
          console.log("error in StudentClasses", error);
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
