import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
  SelectedBatchId = 0; SubOrgId = 0;
  FilterOrgSubOrgBatchId = '';
  filterOrgSubOrg='';
  invalidId = false;
  allMasterData = [];
  Students = [];
  Classes = [];
  Houses = [];
  Sections = [];
  FeeType = [];
  studentclassForm: UntypedFormGroup;
  StudentName = '';
  SelectedApplicationId = 0;
  LoginUserDetail = [];
  FeeCategories = [];
  studentclassData = {
    StudentClassId: 0,
    StudentId: 0,
    ClassId: 0,
    SectionId: 0,
    RollNo: '',
    BatchId: 0,
    FeeTypeId: 0,
    AdmissionNo: '',
    AdmissionDate: new Date(),
    Remarks: '',
    Promoted: 0,
    Active: 1,
    OrgId: 0,
    SubOrgId: 0
  }
  Permission = '';
  constructor(private servicework: SwUpdate,
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private aRoute: ActivatedRoute,
    private nav: Router,
    private fb: UntypedFormBuilder,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
    // this.servicework.activateUpdate().then(() => {
    //   this.servicework.checkForUpdate().then((value) => {
    //     if (value) {
    //       location.reload();
    //     }
    //   })
    // })
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 3;
    var today = new Date();
    this.studentclassForm = this.fb.group({
      AdmissionNo: [''],
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
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetail.length == 0)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.STUDENT.STUDENTCLASS);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission == 'deny') {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {
        this.FilterOrgSubOrgBatchId = globalconstants.getOrgSubOrgBatchIdFilter(this.tokenStorage);
        this.filterOrgSubOrg = globalconstants.getOrgSubOrgFilter(this.tokenStorage);
        this.contentservice.GetClasses(this.filterOrgSubOrg).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();

        this.shareddata.CurrentFeeType.subscribe(t => this.FeeType = t);
        if (this.FeeType.length == 0)
          this.GetFeeTypes();
        this.shareddata.CurrentSection.subscribe(t => this.Sections = t);
        this.shareddata.CurrentHouse.subscribe(t => this.Houses = t);
        this.StudentId = this.tokenStorage.getStudentId();
        this.StudentClassId = this.tokenStorage.getStudentClassId()
        this.shareddata.CurrentStudentName.subscribe(name => this.StudentName = name);
        this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
        this.SubOrgId = this.tokenStorage.getSubOrgId();
        this.GetMasterData();
        //this.GetStudentClass();
      }
    }
  }
  get f() { return this.studentclassForm.controls }

  GetMasterData() {
    this.allMasterData = this.tokenStorage.getMasterData();
    this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
    this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
    this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
    this.aRoute.paramMap.subscribe(param => {
      this.GetStudent();
    })
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
    list.filter = [this.filterOrgSubOrg + " and Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeType = [...data.value];
        this.shareddata.ChangeFeeType(this.FeeType);
        this.loading = false; this.PageLoading = false;
      })
  }
  GetStudent() {
    debugger;
    
    if (this.StudentId == 0) {
      this.contentservice.openSnackBar("Invalid student Id", globalconstants.ActionText, globalconstants.RedBackground);
      this.invalidId = true;
      return;
    }
    let list: List = new List();
    list.fields = ["StudentId", "FirstName", "LastName", "FatherName", "MotherName"];
    list.PageName = "Students";
    list.filter = [this.filterOrgSubOrg + " and StudentId eq " + this.StudentId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          // this.Students = data.value.map(student => {
          //   var _lastname = student.LastName == null ? '' : " " + student.LastName;
          //   var name = student.FirstName + _lastname;
          //   student.studentName = student.StudentId + "-" + name + "-" + student.FatherName + "-" + student.MotherName;
          //   return student;
          // })
          // let ValidStudent = this.Students.filter(student => student.StudentId == this.StudentId)
          // if (ValidStudent.length > 0) {
          this.studentclassForm.patchValue({ StudentId: this.StudentId });
          this.GetStudentClass();
        }
        else {
          this.invalidId = true;
          this.contentservice.openSnackBar("Invalid student Id", globalconstants.ActionText, globalconstants.RedBackground);
        }
        // }
        // else
        //   this.contentservice.openSnackBar("Problem fetching students' data", globalconstants.ActionText, globalconstants.RedBackground);
      });

  }
  GetStudentClass() {
    debugger;

    if (this.StudentId > 0 && this.StudentClassId > 0) {

      let list: List = new List();
      list.fields = [
        "StudentClassId", "ClassId",
        "StudentId", "RollNo", "SectionId", "AdmissionNo",
        "BatchId", "FeeTypeId",
        "AdmissionDate", "Remarks", "Active"];
      list.PageName = "StudentClasses";
      list.filter = [this.FilterOrgSubOrgBatchId + " and StudentClassId eq " + this.StudentClassId];

      this.dataservice.get(list)
        .subscribe((data: any) => {
          if (data.value.length > 0) {
            var admissiondate = moment(data.value[0].AdmissionDate).isBefore("1970-01-01")
            this.studentclassForm.patchValue({
              StudentId: data.value[0].StudentId,
              AdmissionNo: data.value[0].AdmissionNo,
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
              AdmissionNo: '',
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
      var _classId = this.studentclassForm.get("ClassId").value;
      var ClassStrength = 0;
      if (_classId > 0) {
        this.contentservice.GetStudentClassCount(this.LoginUserDetail[0]['orgId'], 0, 0, this.SelectedBatchId)
          .subscribe((data: any) => {
            ClassStrength = data.value.length;
            ClassStrength += 1;
            var _batchName = this.tokenStorage.getSelectedBatchName();
            var _admissionNo = this.studentclassForm.get("AdmissionNo").value;
            var _year = _batchName.split('-')[0].trim();
            this.loading = true;
            this.studentclassData.Active = this.studentclassForm.get("Active").value ? 1 : 0;
            this.studentclassData.BatchId = this.SelectedBatchId;
            this.studentclassData.ClassId = this.studentclassForm.value.ClassId;
            this.studentclassData.RollNo = this.studentclassForm.value.RollNo;
            this.studentclassData.SectionId = this.studentclassForm.value.SectionId;
            this.studentclassData.FeeTypeId = this.studentclassForm.value.FeeTypeId;
            this.studentclassData.AdmissionNo = _admissionNo;// ?_year + ClassStrength : _admissionNo;
            this.studentclassData.Remarks = this.studentclassForm.value.Remarks;
            this.studentclassData.AdmissionDate = this.studentclassForm.value.AdmissionDate;
            this.studentclassData.OrgId = this.LoginUserDetail[0]["orgId"];
            this.studentclassData.SubOrgId = this.SubOrgId;
            this.studentclassData.StudentId = this.StudentId;
            if (!this.StudentClassId || this.StudentClassId == 0) {
              this.StudentClassId = 0;
              this.studentclassData.AdmissionNo = _year + ClassStrength;
              this.insert();
            }
            else {
              this.studentclassData.StudentClassId = this.StudentClassId;
              this.update();
            }
          })
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
          this.studentclassForm.patchValue({ "AdmissionNo": this.studentclassData.AdmissionNo })
          this.tokenStorage.saveStudentClassId(this.StudentClassId + "")
          this.CreateInvoice();
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });

  }
  update() {

    this.dataservice.postPatch('StudentClasses', this.studentclassData, this.StudentClassId, 'patch')
      .subscribe(
        (data: any) => {
          this.CreateInvoice();
          this.studentclassForm.patchValue({ "AdmissionNo": this.studentclassData.AdmissionNo })
        }, error => {
          var msg = globalconstants.formatError(error);
          this.contentservice.openSnackBar(msg, globalconstants.ActionText, globalconstants.RedBackground);
          this.loading = false;
        });
  }
  CreateInvoice() {
    debugger;
    this.loading = true;

    this.contentservice.GetClassFeeWithFeeDefinition(this.FilterOrgSubOrgBatchId, 0)
      .subscribe((datacls: any) => {

        var _clsfeeWithDefinitions = datacls.value.filter(m => m.FeeDefinition.Active == 1);

        this.contentservice.getStudentClassWithFeeType(this.FilterOrgSubOrgBatchId, 0, this.StudentClassId, 0)
          .subscribe((data: any) => {
            var studentfeedetail = [];
            data.value.forEach(studcls => {
              var _feeName = '';
              var objClassFee = _clsfeeWithDefinitions.filter(def => def.ClassId == studcls.ClassId);
              objClassFee.forEach(clsfee => {
                var _category = '';
                var _subCategory = '';

                var objcat = this.FeeCategories.filter(f => f.MasterDataId == clsfee.FeeDefinition.FeeCategoryId);
                if (objcat.length > 0)
                  _category = objcat[0].MasterDataName;

                var objsubcat = this.FeeCategories.filter(f => f.MasterDataId == clsfee.FeeDefinition.FeeSubCategoryId);
                if (objsubcat.length > 0)
                  _subCategory = objsubcat[0].MasterDataName;

                var _formula = studcls.FeeType.Active == 1 ? studcls.FeeType.Formula : '';

                if (_formula.length > 0) {
                  _feeName = clsfee.FeeDefinition.FeeName;
                  studentfeedetail.push({
                    Month: clsfee.Month,
                    Amount: clsfee.Amount,
                    Formula: _formula,
                    FeeName: _feeName,
                    StudentClassId: studcls.StudentClassId,
                    FeeCategory: _category,
                    FeeSubCategory: _subCategory,
                    FeeTypeId: studcls.FeeTypeId,
                    SectionId: studcls.SectionId,
                    RollNo: studcls.RollNo
                  });
                }

              })
            })
            // console.log("studentfeedetailxxxx",studentfeedetail)
            this.contentservice.createInvoice(studentfeedetail, this.SelectedBatchId, this.LoginUserDetail[0]["orgId"],this.SubOrgId)
              .subscribe((data: any) => {
                this.loading = false;
                this.contentservice.openSnackBar("Invoice created successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
              },
                error => {
                  this.loading = false;
                  console.log("create invoice error", error);
                  this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
                })
          })
      });

  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenStorage, this.allMasterData);

    // let Id = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    // })[0].MasterDataId;
    // return this.allMasterData.filter((item, index) => {
    //   return item.ParentId == Id
    // });
  }
}
