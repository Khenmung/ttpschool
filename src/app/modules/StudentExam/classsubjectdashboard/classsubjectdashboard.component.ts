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
  loading = false;
  Classes = [];
  Subjects = [];
  SubjectTypes = [];
  Batches = [];
  ClassSubjectList: IClassSubject[];
  dataSource: MatTableDataSource<IClassSubject>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchSubjectId: [0],
    searchSubjectTypeId: [0],
    searchClassId: [0],
  });
  ClassSubjectId = 0;
  ClassSubjectData = {
    ClassSubjectId: 0,
    ClassId: 0,
    SubjectId: 0,
    SubjectTypeId: 0,
    TheoryFullMark: 0,
    TheoryPassMark: 0,
    PracticalFullMark: 0,
    PracticalPassMark: 0,
    Active: 1
  };
  displayedColumns = [
    'Class',
    'Subject',
    'SubjectType',
    'TheoryFullMark',
    'TheoryPasswMark',
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
    private datepipe: DatePipe,
    private shareddata: SharedataService,
    private changeDetectorRefs: ChangeDetectorRef) { }

  ngOnInit(): void {

  }
  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.shareddata.CurrentClasses.subscribe(a => this.Classes = a);
      if (this.Classes.length == 0)
        this.GetMasterData();
      else {
        this.shareddata.CurrentSubjects.subscribe(r => this.Subjects = r);
        this.shareddata.CurrentSubjectTypes.subscribe(a => this.SubjectTypes = a);
        this.shareddata.CurrentBatch.subscribe(b => this.Batches = b);
        //this.GetClassSubject();
      }
    }

  }
  GetClassSubjectId(event) {
    this.ClassSubjectId = event;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
    this.GetClassSubject();
  }

  View(element) {
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
    let filterStr = '';

    if (this.searchForm.get("searchClassId").value != 0)
      filterStr = " and ClassId eq " + this.searchForm.get("searchClassId").value;
    if (this.searchForm.get("searchSubjectId").value != 0)
      filterStr += " and SubjectId eq " + this.searchForm.get("searchSubjectId").value;
    if (this.searchForm.get("searchSubjectTypeId").value != 0)
      filterStr += " and SubjectTypeId eq " + this.searchForm.get("searchSubjectTypeId").value;

    if(filterStr.length==0)
    {
      this.alert.error("Please enter search criteria.",this.optionAutoClose);
      return;
    }  
    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'SubjectTypeId',
      'TheoryFullMark',
      'TheoryPasswMark',
      'PracticalFullMark',
      'PracticalPassMark',
      'Active'
    ];

    list.PageName = "ClassSubjects";
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"] + filterStr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  console.log('data.value', data.value);
        var classname = ''
        var subject = '';
        var subjecttype = '';
        this.ClassSubjectList = data.value.map(item => {
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
            TheoryPasswMark: item.TheoryPasswMark,
            PracticalFullMark: item.PracticalFullMark,
            PracticalPassMark: item.PracticalPassMark,
            Active: item.Active
          }
        });

        //this.shareddata.ChangeApplicationRoles(this.AppRoleList); 
        this.dataSource = new MatTableDataSource<IClassSubject>(this.ClassSubjectList);
        this.loading = false;
        //this.changeDetectorRefs.detectChanges();
      });
  }

  update(element) {
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
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  GetMasterData() {

    var orgIdSearchstr = ' or OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 and (ParentId eq 0 " + orgIdSearchstr + ')'];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[0].school[0].CLASS);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions[0].school[0].SUBJECT);
        this.SubjectTypes = this.getDropDownData(globalconstants.MasterDefinitions[0].school[0].SUBJECTTYPE);
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[0].school[0].BATCH);

        this.shareddata.ChangeClasses(this.Classes);
        this.shareddata.ChangeSubjects(this.Subjects);
        this.shareddata.ChangeSubjectTypes(this.SubjectTypes);
        this.shareddata.ChangeBatch(this.Batches);

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
  Class: string;
  SubjectId: number;
  Suject: string;
  SubjectTypeId: string;
  SubjectType: string;
  TheoryFullMark: number;
  TheoryPassMark: number;
  PracticalFullMark: number;
  PracticalPassMark: number;
  Active;
}

