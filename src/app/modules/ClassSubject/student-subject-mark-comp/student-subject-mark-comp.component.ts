import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-student-subject-mark-comp',
  templateUrl: './student-subject-mark-comp.component.html',
  styleUrls: ['./student-subject-mark-comp.component.scss']
})
export class StudentSubjectMarkCompComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };

  loading = false;
  Permission = '';
  LoginUserDetail = [];
  StandardFilter = '';
  CurrentBatch = '';
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  Classes = [];
  Subjects = [];
  ClassSubjectnComponents = [];
  ClassSubjects = [];
  ClassGroups = [];
  MarkComponents = [];
  Batches = [];
  ELEMENT_DATA: ISubjectMarkComponent[] = [];
  dataSource: MatTableDataSource<ISubjectMarkComponent>;
  allMasterData = [];
  searchForm: any;
  classSubjectComponentData = {
    ClassSubjectMarkComponentId: 0,
    ClassSubjectId: 0,
    SubjectComponentId: 0,
    FullMark: 0,
    PassMark: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 0
  };
  constructor(
    private contentservice: ContentService,
    private token: TokenStorageService,
    private dataservice: NaomitsuService,
    private alert: AlertService,
    private route: Router,
    private fb: FormBuilder,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
    this.LoginUserDetail = this.token.getUserDetail();
    if (this.LoginUserDetail == null || this.LoginUserDetail.length == 0)
      this.route.navigate(['auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.token, globalconstants.Pages.edu.SUBJECT.SUBJECTMARKCOMPONENT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.searchForm = this.fb.group({
          SubjectId: [0],
          ClassId: [0]
        });
        //debugger;
        //this.GetClassFee();
        this.PageLoad();
      }
    }
  }
  PageLoad() {
    //this.shareddata.CurrentSelectedBatchId.subscribe(c=>this.SelectedBatchId=c);
    this.SelectedBatchId = +this.token.getSelectedBatchId();
    this.GetMasterData();
    if (this.Classes.length == 0) {
      this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
        this.Classes = [...data.value];

      });
    }
  }
  //displayedColumns = ['position', 'name', 'weight', 'symbol'];
  displayedColumns = ['ClassSubject', 'SubjectComponent', 'FullMark', 'PassMark', 'Active', 'Action'];
  updateAlbum() {

  }
  getoldvalue() {

  }
  UpdateSelectedBatchId(value) {
    this.SelectedBatchId = value;
  }
  onBlur(element) {
    element.Action = element.PassMark < 1000 && element.FullMark < 1000 ? true : false;
  }
  UpdateOrSave(row) {
    //debugger;
    this.loading = true;
    let checkFilterString = "1 eq 1 " +
      " and ClassSubjectId eq " + row.ClassSubjectId +
      " and SubjectComponentId eq " + row.SubjectComponentId

    if (row.ClassSubjectMarkComponentId > 0)
      checkFilterString += " and ClassSubjectMarkComponentId ne " + row.ClassSubjectMarkComponentId;

    let list: List = new List();
    list.fields = ["ClassSubjectMarkComponentId"];
    list.PageName = "ClassSubjectMarkComponents";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.options);
        }
        else {
          this.classSubjectComponentData.Active = row.Active;// == true ? 1 : 0;
          this.classSubjectComponentData.ClassSubjectMarkComponentId = row.ClassSubjectMarkComponentId;
          this.classSubjectComponentData.ClassSubjectId = row.ClassSubjectId;
          this.classSubjectComponentData.SubjectComponentId = row.SubjectComponentId;
          this.classSubjectComponentData.FullMark = row.FullMark;
          this.classSubjectComponentData.PassMark = row.PassMark;
          this.classSubjectComponentData.BatchId = this.SelectedBatchId;
          this.classSubjectComponentData.OrgId = this.LoginUserDetail[0]["orgId"];

          if (this.classSubjectComponentData.ClassSubjectMarkComponentId == 0) {
            this.classSubjectComponentData["CreatedDate"] = new Date();
            this.classSubjectComponentData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.classSubjectComponentData["UpdatedDate"];
            delete this.classSubjectComponentData["UpdatedBy"];
            //console.log('this', this.classSubjectComponentData);
            this.insert(row);
          }
          else {
            delete this.classSubjectComponentData["CreatedDate"];
            delete this.classSubjectComponentData["CreatedBy"];
            this.classSubjectComponentData["UpdatedDate"] = new Date();
            this.classSubjectComponentData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];

            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('ClassSubjectMarkComponents', this.classSubjectComponentData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          row.ClassSubjectMarkComponentId = data.ClassSubjectMarkComponentId;
          this.alert.success("Data saved successfully", this.options);
          //this.router.navigate(['/home/pages']);
        });

  }
  update(row) {

    this.dataservice.postPatch('ClassSubjectMarkComponents', this.classSubjectComponentData, this.classSubjectComponentData.ClassSubjectMarkComponentId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          this.alert.success("Data updated successfully", this.options);
          //this.router.navigate(['/home/pages']);
        });

  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSGROUP);
        this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECTMARKCOMPONENT);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));

        this.shareddata.ChangeBatch(this.Batches);

        this.GetClassSubject();
        this.loading = false;
      });
  }
  getDropDownData(dropdowntype) {
    let Id = 0;
    let Ids = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    })
    if (Ids.length > 0) {
      Id = Ids[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      })
    }
    else
      return [];

  }
  MergeSubjectnComponents() {

    this.ClassSubjectnComponents = this.ClassSubjects.map(s => {
      s.Components = this.MarkComponents;
      return s;
    })
  }
  // GetCurrentBatchIDnAssign() {
  //   let CurrentBatches = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
  //   if (CurrentBatches.length > 0) {
  //     this.SelectedBatchId = CurrentBatches[0].MasterDataId;
  //   }
  // }
  GetClassSubject() {


    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and BatchId eq ' + this.SelectedBatchId;

    let list: List = new List();
    list.fields = [
      "ClassSubjectId",
      "Active",
      "SubjectId",
      "ClassId"
    ];
    list.PageName = "ClassSubjects";
    list.filter = [filterStr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjects = data.value.map(cs => {
          var _class = '';
          var objclass = this.Classes.filter(c => c.ClassId == cs.ClassId)
          if (objclass.length > 0)
            _class = objclass[0].ClassName;

          var _subject = ''
          var objsubject = this.Subjects.filter(c => c.MasterDataId == cs.SubjectId)
          if (objsubject.length > 0)
            _subject = objsubject[0].MasterDataName;
          return {
            ClassSubjectId: cs.ClassSubjectId,
            Active: cs.Active,
            SubjectId: cs.SubjectId,
            ClassId: cs.ClassId,
            ClassSubject: _class + ' - ' + _subject
          }
        })
        this.MergeSubjectnComponents();
      })
  }
  GetClassSubjectComponent() {

    if (this.searchForm.get("ClassId").value == 0) {
      this.alert.error("Please select class.", this.options.autoClose);
      return;
    }
    this.loading = true;
    let list: List = new List();
    list.fields = [
      "ClassSubjectMarkComponentId",
      "ClassSubjectId",
      "SubjectComponentId",
      "FullMark",
      "PassMark",
      "BatchId",
      "OrgId",
      "Active"
    ];
    list.PageName = "ClassSubjectMarkComponents";
    list.lookupFields = ["ClassSubject($select=SubjectId,ClassId)"];
    list.filter = ["Active eq 1 and " + this.StandardFilter];
    //list.orderBy = "ParentId";
    this.ELEMENT_DATA = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        var clsSubjFiltered = [];
        //if all subject is selected.
        clsSubjFiltered = data.value.filter(item => item.ClassSubject.ClassId == this.searchForm.get("ClassId").value);
        var filteredClassSubjectnComponents = this.ClassSubjectnComponents.filter(clssubjcomponent =>
          clssubjcomponent.ClassId == this.searchForm.get("ClassId").value);
        if (this.searchForm.get("SubjectId").value > 0) {
          clsSubjFiltered = clsSubjFiltered.filter(item => item.ClassSubject.SubjectId == this.searchForm.get("SubjectId").value);
          filteredClassSubjectnComponents = filteredClassSubjectnComponents.filter(clssubjcomponent => clssubjcomponent.SubjectId == this.searchForm.get("SubjectId").value);
        }

        filteredClassSubjectnComponents.forEach((subj, indx) => {
          subj.Components.forEach(component => {

            let existing = clsSubjFiltered.filter(fromdb => fromdb.ClassSubject.SubjectId == subj.SubjectId
              && fromdb.SubjectComponentId == component.MasterDataId)
            if (existing.length > 0) {
              existing[0].ClassSubject = subj.ClassSubject;
              existing[0].SubjectComponent = this.MarkComponents.filter(m => m.MasterDataId == component.MasterDataId)[0].MasterDataName;
              this.ELEMENT_DATA.push(existing[0]);
            }
            else {
              let item = {
                ClassSubjectMarkComponentId: 0,
                ClassSubjectId: subj.ClassSubjectId,
                ClassSubject: subj.ClassSubject,
                SubjectComponentId: component.MasterDataId,
                SubjectComponent: this.MarkComponents.filter(m => m.MasterDataId == component.MasterDataId)[0].MasterDataName,
                FullMark: 0,
                PassMark: 0,
                BatchId: 0,
                Active: 0
              }
              this.ELEMENT_DATA.push(item);
            }
          });

        })

        if (this.ELEMENT_DATA.length == 0)
          this.alert.info("No record found!", this.options);

        //console.log('this', this.ELEMENT_DATA);
        //this.ELEMENT_DATA=this.ELEMENT_DATA.sort((a,b)=>(a.PaymentOrder>b.PaymentOrder?1:-1))
        this.dataSource = new MatTableDataSource<ISubjectMarkComponent>(this.ELEMENT_DATA);
        this.dataSource.sort = this.sort;
        this.loading = false;
        //console.log("element data", this.ELEMENT_DATA)
      });
  }
  updateActive(row) {
    row.Action = true;
    row.Active = row.Active == 1 ? 0 : 1;
  }
  updateAmount(row, value) {
    row.Action = true;
    row.Amount = value;
  }
  updatePaymentOrder(row, value) {
    row.Action = true;
    row.PaymentOrder = value;
  }
  enableAction(row, value) {
    row.Action = true;
    row.Active = !row.Active;
    //let amount = +value;
    if (value == NaN)
      value = 0;
    row.Amount = parseFloat(value);
    //console.log('from change', row);
  }
}
export interface ISubjectMarkComponent {
  ClassSubjectMarkComponentId: number;
  ClassSubjectId: number;
  SubjectComponentId: number;
  BatchId: number;
  FullMark: number,
  PassMark: number,
  Active: number;
}

