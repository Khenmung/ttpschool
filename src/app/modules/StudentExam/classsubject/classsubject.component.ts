import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-classsubject',
  templateUrl: './classsubject.component.html',
  styleUrls: ['./classsubject.component.scss']
})
export class ClasssubjectComponent implements OnInit {

  @Output() OutClassSubjectId = new EventEmitter();
  @Output() CallParentPageFunction = new EventEmitter();
  @Input("ClassSubjectId") ClassSubjectId: number;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  allMasterData = [];
  Classes = [];
  Subjects = [];
  SubjectTypes = [];
  Batches=[];
  ClassSubjectData = {
    ClassSubjectId: 0,
    ClassId: 0,
    SubjectId: 0,
    SubjectTypeId: 0,
    TheoryFullMark: 0,
    TheoryPassMark: 0,
    PracticalFullMark: 0,
    PracticalPassMark: 0,
    OrgId:0,
    BatchId:0,
    Active: 1
  };
  UserDetail = [];
  constructor(
    private shareddata: SharedataService,
    private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService,
    private fb: FormBuilder,
    private tokenstorage: TokenStorageService
  ) {

  }

  ClassSubjectForm = this.fb.group({
    ClassSubjectId: [0],
    ClassId: [0, Validators.required],
    SubjectId: [0, Validators.required],
    SubjectTypeId: [0, Validators.required],
    TheoryFullMark: [0, Validators.required],
    TheoryPassMark: [0, Validators.required],
    PracticalFullMark: [0, Validators.required],
    PracticalPassMark: [0, Validators.required],
    Active: [1, Validators.required]
  })

  ngOnInit(): void {

  }
  PageLoad() {
    this.UserDetail = this.tokenstorage.getUserDetail();
    if (this.UserDetail == null) {
      this.route.navigate(['auth/login']);
      //return;
    }
    this.shareddata.CurrentClasses.subscribe(c=>this.Classes=c);
    this.shareddata.CurrentSubjects.subscribe(s=>this.Subjects=s);
    this.shareddata.CurrentSubjectTypes.subscribe(t=>this.SubjectTypes=t);
    this.shareddata.CurrentBatch.subscribe(b=>this.Batches=b);

    this.GetClassSubject();
  }

  back() {
    this.OutClassSubjectId.emit(0);
  }
  get f() {
    return this.ClassSubjectForm.controls;
  }

  GetClassSubject() {

    let list: List = new List();
    list.fields = ["*"];
    list.PageName = "ClassSubjects";
    list.filter = ["Active eq 1 and ClassSubjectId eq " + this.ClassSubjectId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //  console.log('roleuser', data);
        data.value.forEach(element => {
          this.ClassSubjectForm.patchValue({
            ClassSubjectId: element.ClassSubjectId,
            ClassId: element.ClassId,
            SubjectId: element.SubjectId,
            SubjectTypeId: element.SubjectTypeId,
            TheoryFullMark: element.TheoryFullMark,
            TheoryPassMark: element.TheoryPassMark,
            PracticalFullMark: element.PracticalFullMark,
            PracticalPassMark: element.PracticalPassMark,
            Active: element.Active
          })
        });
      });
  }

  UpdateOrSave() {

    let checkFilterString = "Active eq 1 " +
      " and ClassId eq " + this.ClassSubjectForm.get("ClassId").value +
      " and SubjectId eq " + this.ClassSubjectForm.get("SubjectId").value +
      " and SubjectTypeId eq " + this.ClassSubjectForm.get("SubjectTypeId").value;

    if (this.ClassSubjectData.ClassSubjectId > 0)
      checkFilterString += " and ClassSubjectId ne " + this.ClassSubjectData.ClassSubjectId;

    let list: List = new List();
    list.fields = ["ClassSubjectId"];
    list.PageName = "ClassSubjects";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          //console.log(this.UserDetail);
          this.ClassSubjectData.Active = this.ClassSubjectForm.get("Active").value == true ? 1 : 0;
          this.ClassSubjectData.ClassSubjectId = this.ClassSubjectForm.get("ClassSubjectId").value;
          this.ClassSubjectData.SubjectId = this.ClassSubjectForm.get("SubjectId").value;
          this.ClassSubjectData.SubjectTypeId = this.ClassSubjectForm.get("SubjectTypeId").value;
          this.ClassSubjectData.TheoryFullMark = this.ClassSubjectForm.get("TheoryFullMark").value;
          this.ClassSubjectData.OrgId = this.UserDetail[0]["orgId"];
          this.ClassSubjectData.TheoryPassMark = this.ClassSubjectForm.get("TheoryPassMark").value;
          this.ClassSubjectData.PracticalFullMark = this.ClassSubjectForm.get("PracticalFullMark").value;
          this.ClassSubjectData.PracticalPassMark = this.ClassSubjectForm.get("PracticalPassMark").value;
          this.ClassSubjectData.Active =1;  
          //console.log('data', this.AppRoleData);
          if (this.ClassSubjectData.ClassSubjectId == 0) {
            this.insert();
          }
          else {
            this.update();
          }
          this.OutClassSubjectId.emit(0);
          this.CallParentPageFunction.emit();
        }
      });
  }

  insert() {

    debugger;
    this.dataservice.postPatch('ClassSubjects', this.ClassSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {

    this.dataservice.postPatch('ClassSubjects', this.ClassSubjectData, this.ClassSubjectData.ClassSubjectId, 'patch')
      .subscribe(
        (data: any) => {
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
}
