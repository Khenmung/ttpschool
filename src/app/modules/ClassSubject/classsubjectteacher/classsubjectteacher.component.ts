import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-classsubjectteacher',
  templateUrl: './classsubjectteacher.component.html',
  styleUrls: ['./classsubjectteacher.component.scss']
})
export class ClasssubjectteacherComponent implements OnInit {

  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  ClassSubjectTeacherListName = 'ClassSubjectTeachers';
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
  CheckPermission = '';
  StandardFilterWithBatchId = '';
  loading = false;
  Classes = [];
  Subjects = [];
  ClassSubjects = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  Batches = [];
  WorkAccounts = [];
  Teachers = [];
  ClassSubjectTeacherList: IClassSubjectTeacher[] = [];
  dataSource: MatTableDataSource<IClassSubjectTeacher>;
  allMasterData = [];
  searchForm: FormGroup;
  //ClassSubjectId = 0;
  ClassSubjectTeacherData = {
    ClassSubjectTeacherId: 0,
    TeacherId: 0,
    ClassSubjectId: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 1
  };

  displayedColumns = [
    "ClassSubject",
    "TeacherId",
    "Active",
    "Action",
  ];
  filteredOptions: Observable<ITeachers[]>;
  //Students: any;

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
    this.searchForm = this.fb.group({
      searchSubjectTeacherId: [0],
      searchClassId: [0]
    });
    //        this.GetTeachers();
  }
  private _filter(name: string): ITeachers[] {

    const filterValue = name.toLowerCase();
    return this.Teachers.filter(option => option.TeacherName.toLowerCase().includes(filterValue));

  }
  displayFn(teacher: ITeachers): string {
    return teacher && teacher.TeacherName ? teacher.TeacherName : '';
  }

  PageLoad() {

    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    this.filteredOptions = this.searchForm.get("searchSubjectTeacherId").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.TeacherName),
        map(TeacherName => TeacherName ? this._filter(TeacherName) : this.Teachers.slice())
      );

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      this.CheckPermission = globalconstants.getPermission(this.LoginUserDetail, this.tokenstorage, globalconstants.Pages[0].SUBJECT.CLASSSUBJECTMAPPING);
      this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
      this.shareddata.CurrentClasses.subscribe(a => this.Classes = a);
      this.GetMasterData();

    }
  }


  View(element) {
    // debugger;
    // this.ClassSubjectId = element.ClassSubjectId;
    // this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    // setTimeout(() => {
    //   this.classSubjectAdd.PageLoad();
    // }, 50);
  }

  // addnew() {
  //   var newdata = {
  //     ClassSubjectTeacherId: 0,
  //     TeacherId: this.searchForm.get("searchTeacherId").value.TeacherId,
  //     Teacher: this.searchForm.get("searchTeacherId").value.TeacherName,
  //     ClassSubjectId: 0,
  //     SectionId: 0,
  //     Active: 0,
  //     Action: true
  //   }
  //   this.ClassSubjectTeacherList.push(newdata);
  //   this.dataSource = new MatTableDataSource<IClassTeacher>(this.ClassSubjectTeacherList);
  // }

  GetClassSubjectTeacher() {
    let filterStr = this.StandardFilterWithBatchId;//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    debugger;
    this.loading = true;
    var _teacherId = this.searchForm.get("searchSubjectTeacherId").value.TeacherId;
    var _ClassId = this.searchForm.get("searchClassId").value;
    if (_teacherId != undefined)
      filterStr += " and TeacherId eq " + _teacherId;
    // if (_ClassId != 0)
    //   filterStr += " and ClassId eq " + _ClassId;

    let list: List = new List();
    list.fields = [
      "ClassSubjectTeacherId",
      "TeacherId",
      "ClassSubjectId",
      "ClassSubject/ClassId",
      "Active"
    ];

    list.PageName = this.ClassSubjectTeacherListName;
    list.lookupFields = ["ClassSubject"];
    list.filter = [filterStr];
    this.ClassSubjectTeacherList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        var filteredResult;
        if (_ClassId > 0)
          filteredResult = data.value.filter(f => f.ClassSubject.ClassId == _ClassId)
        else
          filteredResult = [...data.value];

        //  console.log('data.value', data.value);
        if (_teacherId != undefined) {
          filteredResult.forEach(element => {
            this.ClassSubjectTeacherList.push({
              "ClassSubjectTeacherId": element.ClassSubjectTeacherId,
              "TeacherId": element.TeacherId,
              "Teacher": this.Teachers.filter(f => f.TeacherId == element.TeacherId)[0].TeacherName,
              "ClassSubjectId": element.ClassSubjectId,
              "ClassSubject": element.SectionId,
              "Active": element.Active,
              "Action": false
            })
          });
        }
        else {
          var filterClassSubjects = this.ClassSubjects.filter(f => f.ClassId == _ClassId);
          if (filterClassSubjects.length == 0) {
            this.alert.info("No Subjects defined for this class!", this.optionsNoAutoClose);

          }
          else {
            filterClassSubjects.forEach(t => {
              var existing = filteredResult.filter(f => f.ClassSubjectId == t.ClassSubjectId);
              if (existing.length > 0) {
                this.ClassSubjectTeacherList.push({
                  "ClassSubjectTeacherId": existing[0].ClassSubjectTeacherId,
                  "TeacherId": existing[0].TeacherId,
                  "Teacher": t.TeacherName,
                  "ClassSubjectId": existing[0].ClassSubjectId,
                  "ClassSubject": this.ClassSubjects.filter(f => f.ClassSubjectId == existing[0].ClassSubjectId)[0].ClassSubject,
                  "Active": existing[0].Active,
                  "Action": false
                })
              }
              else {
                this.ClassSubjectTeacherList.push({
                  "ClassSubjectTeacherId": 0,
                  "TeacherId": 0,
                  "Teacher": '',
                  "ClassSubjectId": t.ClassSubjectId,
                  "ClassSubject": t.ClassSubject,
                  "Active": 0,
                  "Action": false
                })
              }

            })
          }
        }
        if (this.ClassSubjectTeacherList.length == 0)
          this.alert.info("No record found!", this.optionAutoClose);

        this.dataSource = new MatTableDataSource<IClassSubjectTeacher>(this.ClassSubjectTeacherList);
        this.loading = false;
        //this.changeDetectorRefs.detectChanges();
      });
  }
  onBlur(row) {
    row.Action = true;
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
  }
  // delete(element) {
  //   let toupdate = {
  //     Active: element.Active == 1 ? 0 : 1
  //   }
  //   this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
  //     .subscribe(
  //       (data: any) => {
  //         // this.GetApplicationRoles();
  //         this.alert.success("Data deleted successfully.", this.optionAutoClose);

  //       });
  // }

  UpdateOrSave(row) {

    debugger;
    this.loading = true;

    // var selectedSubjectType = this.ClassSubjectList.filter(c => c.SubjectTypeId == row.SubjectTypeId);
    // if (selectedSubjectType.length > row.SelectHowMany && row.SelectHowMany > 0) {
    //   this.alert.error("Allowed no. subjects selected is exceeded for this subject type.", this.optionsNoAutoClose);
    //   this.loading = false;
    //   return;
    // }

    let checkFilterString = "TeacherId eq " + row.TeacherId +
      " and ClassSubjectId eq " + row.ClassSubjectId;

    if (row.ClassSubjectTeacherId > 0)
      checkFilterString += " and ClassSubjectTeacherId ne " + row.ClassSubjectTeacherId;

    checkFilterString += ' and ' + this.StandardFilterWithBatchId;

    let list: List = new List();
    list.fields = ["ClassSubjectTeacherId"];
    list.PageName = this.ClassSubjectTeacherListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
          row.Ative = 0;
          return;
        }
        else {

          this.ClassSubjectTeacherData.Active = row.Active;
          this.ClassSubjectTeacherData.ClassSubjectTeacherId = row.ClassSubjectTeacherId;
          this.ClassSubjectTeacherData.ClassSubjectId = row.ClassSubjectId;
          this.ClassSubjectTeacherData.TeacherId = row.TeacherId;
          this.ClassSubjectTeacherData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ClassSubjectTeacherData.BatchId = this.SelectedBatchId;
          if (row.ClassSubjectTeacherId == 0) {
            this.ClassSubjectTeacherData["CreatedDate"] = new Date();
            this.ClassSubjectTeacherData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.ClassSubjectTeacherData["UpdatedDate"];
            delete this.ClassSubjectTeacherData["UpdatedBy"];
            console.log('to insert', this.ClassSubjectTeacherData)
            this.insert(row);
          }
          else {

            delete this.ClassSubjectTeacherData["CreatedDate"];
            delete this.ClassSubjectTeacherData["CreatedBy"];
            this.ClassSubjectTeacherData["UpdatedDate"] = new Date();
            this.ClassSubjectTeacherData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            console.log('to update', this.ClassSubjectTeacherData)
            this.update(row);
          }
        }
      });

  }

  insert(row) {

    debugger;
    this.dataservice.postPatch(this.ClassSubjectTeacherListName, this.ClassSubjectTeacherData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.ClassSubjectTeacherId = data.ClassSubjectTeacherId;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ClassSubjectTeacherListName, this.ClassSubjectTeacherData, this.ClassSubjectTeacherData.ClassSubjectTeacherId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

  GetTeachers() {

    var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _WorkAccount = this.WorkAccounts.filter(f => f.MasterDataName.toLowerCase() == "teaching");
    var _workAccountId = 0;
    if (_WorkAccount.length > 0)
      _workAccountId = _WorkAccount[0].MasterDataId;

    let list: List = new List();

    list.fields = ["EmpEmployee/EmpEmployeeId", "EmpEmployee/FirstName", "EmpEmployee/LastName", "WorkAccountId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["EmpEmployee"]
    list.filter = [orgIdSearchstr + " and Active eq 1 and WorkAccountId eq " + _workAccountId];
    //list.orderBy = "ParentId";
    this.Teachers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.filter(f => {
          this.Teachers.push({
            TeacherId: f.EmpEmployee.EmpEmployeeId,
            TeacherName: f.EmpEmployee.FirstName + " " + f.EmpEmployee.LastName
          })
        })

      })
  }
  GetClassSubject() {

    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
    ];

    list.PageName = "ClassSubjects";
    list.filter = ["Active eq 1 and BatchId eq " + this.SelectedBatchId];
    this.ClassSubjects = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  console.log('data.value', data.value);
        this.ClassSubjects = data.value.map(item => {
          var _classname = this.Classes.filter(f => f.MasterDataId == item.ClassId)[0].MasterDataName;
          var _subjectName = this.Subjects.filter(f => f.MasterDataId == item.SubjectId)[0].MasterDataName;

          return {
            ClassSubjectId: item.ClassSubjectId,
            ClassSubject: _classname + "-" + _subjectName,
            ClassId: item.ClassId
          }
        })
      })
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
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASS);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));

        this.shareddata.ChangeClasses(this.Classes);
        this.shareddata.ChangeBatch(this.Batches);
        this.GetTeachers();
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

}
export interface IClassSubjectTeacher {
  ClassSubjectTeacherId: number;
  TeacherId: number;
  Teacher: string;
  ClassSubjectId: number;
  ClassSubject: string;
  Active: number;
  Action: boolean
}
export interface ITeachers {
  TeacherId: number;
  TeacherName: string;
}
