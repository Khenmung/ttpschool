import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ClasssubjectComponent } from '../classsubject/classsubject.component';

@Component({
  selector: 'app-classsubjectdashboard',
  templateUrl: './classsubjectdashboard.component.html',
  styleUrls: ['./classsubjectdashboard.component.scss']
})
export class ClasssubjectdashboardComponent implements OnInit {

  @ViewChild("table") mattable;
  @ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  StandardFilter = '';
  loading = false;
  Classes = [];
  Subjects = [];
  SubjectTypes = [];
  CurrentBatchId = 0;
  Batches = [];
  ClassSubjectList: IClassSubject[];
  dataSource: MatTableDataSource<IClassSubject>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchBatchId: [0],
    searchSubjectId: [0],
    searchSubjectTypeId: [0],
    searchClassId: [0],
  });
  ClassSubjectId = 0;
  ClassSubjectData = {
    ClassSubjectId: 0,
    ClassId: 0,
    OrgId: 0,
    BatchId: 0,
    SubjectId: 0,
    SubjectTypeId: 0,
    TheoryFullMark: 0,
    TheoryPassMark: 0,
    PracticalFullMark: 0,
    PracticalPassMark: 0,
    Active: 1
  };
  displayedColumns = [
    'ClassId',
    //'ClassName',
    'SubjectId',
    'SubjectTypeId',
    'TheoryFullMark',
    'TheoryPassMark',
    'PracticalFullMark',
    'PracticalPassMark',
    'Active',
    'Action'
  ];

  constructor(
    private fb: FormBuilder,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.shareddata.CurrentClasses.subscribe(a => this.Classes = a);
      if (this.Classes.length == 0)
        this.GetMasterData();
      else {
        this.shareddata.CurrentSubjects.subscribe(r => this.Subjects = r);
        this.shareddata.CurrentSubjectTypes.subscribe(a => this.SubjectTypes = a);
        this.shareddata.CurrentBatch.subscribe(b => this.Batches = b);
        this.CurrentBatchId = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch())[0].MasterDataId;

        this.GetCurrentBatchIDnAssign();
        this.loading = false;
      }
    }

  }
  PageLoad() {

  }
  GetCurrentBatchIDnAssign() {
    let CurrentBatches = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
    if (CurrentBatches.length > 0) {
      this.CurrentBatchId = CurrentBatches[0].MasterDataId;
      this.searchForm.patchValue({
        "searchBatchId": this.CurrentBatchId
      })
    }
  }
  GetClassSubjectId(event) {
    this.ClassSubjectId = event;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
    this.GetClassSubject();
  }

  View(element) {
    debugger;
    this.ClassSubjectId = element.ClassSubjectId;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    setTimeout(() => {
      this.classSubjectAdd.PageLoad();
    }, 50);
  }

  addnew() {
    this.ClassSubjectId = -1;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    setTimeout(() => {
      this.classSubjectAdd.PageLoad();
    }, 50);
  }

  GetClassSubject() {
    let filterStr = ' OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    if (this.searchForm.get("searchClassId").value != 0)
      filterStr += " and ClassId eq " + this.searchForm.get("searchClassId").value;
    if (this.searchForm.get("searchSubjectId").value != 0)
      filterStr += " and SubjectId eq " + this.searchForm.get("searchSubjectId").value;
    if (this.searchForm.get("searchSubjectTypeId").value != 0)
      filterStr += " and SubjectTypeId eq " + this.searchForm.get("searchSubjectTypeId").value;

    let batchIds = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
    let batchId = 0;
    if (batchIds.length > 0) {
      batchId = batchIds[0].MasterDataId;
      filterStr += ' and BatchId eq ' + batchId;
    }

    if (filterStr.length == 0) {
      this.alert.error("Please enter search criteria.", this.optionAutoClose);
      return;
    }

    filterStr += this.StandardFilter;

    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'SubjectTypeId',
      'TheoryFullMark',
      'TheoryPassMark',
      'PracticalFullMark',
      'PracticalPassMark',
      'Active'
    ];

    list.PageName = "ClassSubjects";
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  console.log('data.value', data.value);
        var classname = ''
        var subject = '';
        var subjecttype = '';
        let firstData = data.value.map(item => {
          classname = '';
          subject = '';
          subjecttype = '';

          let _classIds = item.ClassId == null ? '' : this.Classes.filter(p => p.MasterDataId == item.ClassId);
          if (_classIds.length > 0)
            classname = _classIds[0].MasterDataName;

          let _subjectId = item.SubjectId != null && this.Subjects.length == 0 ? '' : this.Subjects.filter(a => a.MasterDataId == item.SubjectId);
          if (_subjectId.length > 0)
            subject = _subjectId[0].MasterDataName;

          let _subjecttypeId = item.SubjectId != null && this.SubjectTypes.length == 0 ? '' : this.SubjectTypes.filter(a => a.MasterDataId == item.SubjectTypeId);
          if (_subjecttypeId.length > 0)
            subjecttype = _subjecttypeId[0].MasterDataName;

          return {
            ClassSubjectId: item.ClassSubjectId,
            SubjectId: item.SubjectId,
            SubjectTypeId: item.SubjectTypeId,
            ClassId: item.ClassId,
            Subject: subject,
            SubjectType: subjecttype,
            ClassName: classname,
            TheoryFullMark: item.TheoryFullMark,
            TheoryPassMark: item.TheoryPassMark,
            PracticalFullMark: item.PracticalFullMark,
            PracticalPassMark: item.PracticalPassMark,
            Active: item.Active
          }
        })
        
        this.ClassSubjectList = this.Subjects.map(s => {
          let existing = firstData.filter(e => e.SubjectId == s.MasterDataId);
          if (existing.length > 0) {
            return {
              ClassSubjectId: existing[0].ClassSubjectId,
              SubjectId: existing[0].SubjectId,
              SubjectTypeId: existing[0].SubjectTypeId,
              ClassId: existing[0].ClassId,
              TheoryFullMark: existing[0].TheoryFullMark,
              TheoryPassMark: existing[0].TheoryPassMark,
              PracticalFullMark: existing[0].PracticalFullMark,
              PracticalPassMark: existing[0].PracticalPassMark,
              Active: existing[0].Active
            }
          }
          else
            return {
              ClassSubjectId: 0,
              SubjectId: s.MasterDataId,
              SubjectTypeId: 0,
              ClassId: this.searchForm.get("searchClassId").value,
              TheoryFullMark: 70,
              TheoryPassMark: 33,
              PracticalFullMark: 30,
              PracticalPassMark: 13,
              Active: 0
            }

        })
        
        //this.shareddata.ChangeApplicationRoles(this.AppRoleList); 
        this.dataSource = new MatTableDataSource<IClassSubject>(this.ClassSubjectList);
        this.loading = false;
        //this.changeDetectorRefs.detectChanges();
      });
  }

  updateActive(element) {
    let toupdate = {
      //ApplicationId:element.ApplicationId,      
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'patch')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();
          this.alert.success("Data updated successfully.", this.optionAutoClose);

        });
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();
          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    let checkFilterString = "Active eq 1 " +
      " and ClassId eq " + row.ClassId +
      " and SubjectId eq " + row.SubjectId +
      " and SubjectTypeId eq " + row.SubjectTypeId +
      this.StandardFilter;

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

          this.ClassSubjectData.Active = row.Active;
          this.ClassSubjectData.ClassSubjectId = row.ClassSubjectId;
          this.ClassSubjectData.ClassId = row.ClassId;
          this.ClassSubjectData.SubjectId = row.SubjectId;
          this.ClassSubjectData.SubjectTypeId = row.SubjectTypeId;
          this.ClassSubjectData.TheoryFullMark = row.TheoryFullMark;
          this.ClassSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ClassSubjectData.TheoryPassMark = row.TheoryPassMark;
          this.ClassSubjectData.PracticalFullMark = row.PracticalFullMark;
          this.ClassSubjectData.PracticalPassMark = row.PracticalPassMark;
          this.ClassSubjectData.Active = 1;
          this.ClassSubjectData.BatchId = this.CurrentBatchId;
          console.log('data', this.ClassSubjectData);
          if (this.ClassSubjectData.ClassSubjectId == 0) {
            this.insert();
          }
          else {
            this.update();
          }
          // this.OutClassSubjectId.emit(0);
          // this.CallParentPageFunction.emit();
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
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
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

        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASS);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SUBJECT);
        this.SubjectTypes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SUBJECTTYPE);
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BATCH);

        this.shareddata.ChangeClasses(this.Classes);
        this.shareddata.ChangeSubjects(this.Subjects);
        this.shareddata.ChangeSubjectTypes(this.SubjectTypes);
        this.shareddata.ChangeBatch(this.Batches);
        this.GetCurrentBatchIDnAssign();
        this.GetClassSubject();
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

}
export interface IClassSubject {
  ClassSubjectId: number;
  ClassId: number;
  SubjectId: number;
  SubjectTypeId: string;
  TheoryFullMark: number;
  TheoryPassMark: number;
  PracticalFullMark: number;
  PracticalPassMark: number;
  Active;
}

