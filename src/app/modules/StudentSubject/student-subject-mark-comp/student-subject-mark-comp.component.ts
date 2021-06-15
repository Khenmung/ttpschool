import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
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
  //@ViewChild(MatSort) sort: MatSort;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  loading = false;
  LoginUserDetail = [];
  StandardFilter = '';
  CurrentBatch = '';
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  Subjects = [];
  SubjectnComponents = [];
  ApplyToClasses = [];
  ClassGroups = [];
  MarkComponents = [];
  Batches = [];
  ELEMENT_DATA: ISubjectMarkComponent[] = [];
  dataSource: MatTableDataSource<ISubjectMarkComponent>;
  allMasterData = [];
  searchForm: any;
  classSubjectComponentData = {
    ClassSubjectComponentId: 0,
    SubjectId: 0,
    SubjectComponentId: 0,
    ApplyToClass: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 0
  };
  constructor(
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

    this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);

    this.searchForm = this.fb.group({
      SubjectId: [0],
      ApplyToClassId: [0],
      SubjectComponentId: [0],
    });
    debugger;
    this.GetMasterData();
    //this.GetClassFee();

  }

  //displayedColumns = ['position', 'name', 'weight', 'symbol'];
  displayedColumns = [ 'ApplyToClass','SubjectId', 'SubjectComponentId', 'FullMark', 'PassMark', 'Active', 'Action'];
  updateAlbum() {

  }
  getoldvalue() {

  }
  UpdateSelectedBatchId(value) {
    this.SelectedBatchId = value;
  }
  UpdateOrSave(row) {
    debugger;

    let checkFilterString = "1 eq 1 " +
      " and SubjectId eq " + row.SubjectId +
      " and SubjectComponentId eq " + row.SubjectComponentId +
      " and ApplyToClass eq " + row.ApplyToClass;
    //" and OrgId eq " + row.LocationId
    if (row.ClassSubjectComponentId > 0)
      checkFilterString += " and ClassSubjectComponentId ne " + row.ClassSubjectComponentId;

    let list: List = new List();
    list.fields = ["ClassSubjectComponentId"];
    list.PageName = "ClassSubjectMarkComponents";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.options);
        }
        else {
          this.classSubjectComponentData.Active = row.Active;// == true ? 1 : 0;
          this.classSubjectComponentData.SubjectId = row.SubjectId;
          this.classSubjectComponentData.SubjectComponentId = row.SubjectComponentId;
          this.classSubjectComponentData.BatchId = this.CurrentBatchId;
          this.classSubjectComponentData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.classSubjectComponentData.ApplyToClass = row.ApplyToClass;

          if (this.classSubjectComponentData.ClassSubjectComponentId == 0) {
            this.classSubjectComponentData["CreatedDate"] = new Date();
            this.classSubjectComponentData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.classSubjectComponentData["UpdatedDate"];
            delete this.classSubjectComponentData["UpdatedBy"];
            console.log('this', this.classSubjectComponentData);
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

    debugger;
    this.dataservice.postPatch('ClassSubjectMarkComponents', this.classSubjectComponentData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data saved successfully", this.options);
          //this.router.navigate(['/home/pages']);
        });

  }
  update(row) {

    this.dataservice.postPatch('ClassSubjectMarkComponents', this.classSubjectComponentData, this.classSubjectComponentData.ClassSubjectComponentId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully", this.options);
          //this.router.navigate(['/home/pages']);
        });

  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.ClassGroups = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASSGROUP);
        this.MarkComponents = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SUBJECTMARKCOMPONENT);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SUBJECT);
        this.ApplyToClasses = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASSGROUP);
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BATCH);
        this.shareddata.ChangeBatch(this.Batches);
        this.GetCurrentBatchIDnAssign();
        this.MergeSubjectnComponents();
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

    this.SubjectnComponents = this.Subjects.map(s => {
      return {
        "SubjectName": s.MasterDataName,
        "SubjectId": s.MasterDataId,
        "Components": this.MarkComponents
      }
    })
  }
  GetCurrentBatchIDnAssign() {
    let CurrentBatches = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
    if (CurrentBatches.length > 0) {
      this.CurrentBatchId = CurrentBatches[0].MasterDataId;
    }
  }
  GetClassSubjectComponent() {
    if (this.searchForm.get("ApplyToClassId").value == 0)
      return;
    // if (this.searchForm.get("Batch").value == 0)
    //   return;

    let filterstr = "1 eq 1 ";
    if (this.searchForm.get("SubjectId").value > 0)
      filterstr += " and SubjectId eq " + this.searchForm.get("SubjectId").value;
    if (this.searchForm.get("ApplyToClassId").value > 0)
      filterstr += " and ApplyToClass eq " + this.searchForm.get("ApplyToClassId").value;

    let list: List = new List();
    list.fields = [
      "ClassSubjectComponentId",
      "SubjectId",
      "SubjectComponentId",
      "ApplyToClass",
      "FullMark",
      "PassMark",
      "BatchId",
      "OrgId",
      "Active"];
    list.PageName = "ClassSubjectMarkComponents";
    list.filter = [filterstr + this.StandardFilter];
    //list.orderBy = "ParentId";
    this.ELEMENT_DATA =[]; 
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        
        //if all subject is selected.
        if (this.searchForm.get("SubjectId").value == 0) {
          if (data.value.length > 0) {

            this.SubjectnComponents.forEach((subj, indx) => {
              subj.Components.forEach(comp => {

                let existing = data.value.filter(fromdb => fromdb.SubjectId == subj.SubjectId && fromdb.SubjectComponentId == comp.MasterDataId)
                if (existing.length > 0) {
                  this.ELEMENT_DATA.push(existing[0]);
                }
                else {
                  let item = {
                    ClassSubjectComponentId: 0,
                    SubjectId: subj.SubjectId,
                    SubjectComponentId: comp.MasterDataId,
                    ApplyToClass: this.searchForm.get("ApplyToClassId").value,
                    FullMark: 0,
                    PassMark: 0,
                    BatchId: 0,
                    Active: 0
                  }
                  this.ELEMENT_DATA.push(item);
                }
              });

            })
          }
          else { //no existing data
            this.SubjectnComponents.forEach((subj, indx) => {
              subj.Components.forEach(comp => {
                let item = {
                  ClassSubjectComponentId: 0,
                  SubjectId: subj.SubjectId,
                  SubjectComponentId: comp.MasterDataId,
                  ApplyToClass: this.searchForm.get("ApplyToClassId").value,
                  FullMark: 0,
                  PassMark: 0,
                  BatchId: 0,
                  Active: 0
                }
                this.ELEMENT_DATA.push(item);
              }
              )
            });

          }
        }
        else {

            //this.ELEMENT_DATA = [...data.value];
            this.MarkComponents.map(m=>{
              let existing = data.value.filter(fromdb => fromdb.SubjectComponentId == m.MasterDataId)
              if (existing.length > 0) {
                this.ELEMENT_DATA.push(existing[0]);
              }
              else {
                let item = {
                  ClassSubjectComponentId: 0,
                  SubjectId: this.searchForm.get("SubjectId").value,
                  SubjectComponentId: m.MasterDataId,
                  ApplyToClass: this.searchForm.get("ApplyToClassId").value,
                  FullMark: 0,
                  PassMark: 0,
                  BatchId: 0,
                  Active: 0
                }
                this.ELEMENT_DATA.push(item);
              }

            })
        }
        if(this.ELEMENT_DATA.length==0)
        {
          this.alert.info("No record found!",this.options);
        }
        //console.log('this', this.ELEMENT_DATA);
        //this.ELEMENT_DATA=this.ELEMENT_DATA.sort((a,b)=>(a.PaymentOrder>b.PaymentOrder?1:-1))
        this.dataSource = new MatTableDataSource<ISubjectMarkComponent>(this.ELEMENT_DATA);
        //console.log("element data", this.ELEMENT_DATA)
      });
  }
  updateActive(row, value) {
    debugger;
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
  ClassSubjectComponentId: number;
  SubjectId: number;
  SubjectComponentId: number;
  ApplyToClass: number;
  BatchId: number;
  FullMark: number,
  PassMark: number,
  Active: number;
}

