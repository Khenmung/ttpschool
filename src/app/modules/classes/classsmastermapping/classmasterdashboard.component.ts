//import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
//import { ClasssubjectComponent } from '../classsubject/classsubject.component';

@Component({
  selector: 'app-classmasterdashboard',
  templateUrl: './classmasterdashboard.component.html',
  styleUrls: ['./classmasterdashboard.component.scss']
})
export class ClassmasterdashboardComponent implements OnInit { PageLoading=true;

  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  TeacherClassSubjectListName = 'StudTeacherClassMappings';
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
  PreviousBatchId = 0;
  SelectedApplicationId = 0;
  StandardFilterWithBatchId = '';
  StandardFilterWithPreviousBatchId = '';
  loading = false;
  Permission = '';
  Classes = [];
  Subjects = [];
  Sections = [];
  ClassSubjects = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  //CheckBatchIDForEdit = 1;
  Batches = [];
  WorkAccounts = [];
  Teachers = [];
  ClassSubjectTeacherList: IClassTeacher[] = [];
  dataSource: MatTableDataSource<IClassTeacher>;
  allMasterData = [];
  searchForm: FormGroup;
  //ClassSubjectId = 0;
  ClassSubjectTeacherData = {
    TeacherClassMappingId: 0,
    TeacherId: 0,
    ClassId: 0,
    SectionId: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 1
  };
  displayedColumns = [
    "Section",
    "TeacherId",
    "Active",
    "Action",
  ];
  filteredOptions: Observable<ITeachers[]>;
  //Students: any;

  constructor(
    private contentservice: ContentService,
    private fb: FormBuilder,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchTeacherId: [0],
      searchClassId: [0]
    });
    this.PageLoad();
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

    this.filteredOptions = this.searchForm.get("searchTeacherId").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.TeacherName),
        map(TeacherName => TeacherName ? this._filter(TeacherName) : this.Teachers.slice())
      );

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.CLASSCOURSE.CLASSTEACHER);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      if (this.Permission == 'deny') {

        //this.nav.navigate(['/edu']);

      }
      else {

        //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        //this.CheckPermission = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages[0].SUBJECT.CLASSSUBJECTMAPPING);
        ////console.log(this.CheckPermission);
        this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
        this.StandardFilterWithPreviousBatchId = globalconstants.getStandardFilterWithPreviousBatchId(this.tokenstorage);

        this.shareddata.CurrentSubjects.subscribe(r => this.Subjects = r);

        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
        })

        this.GetMasterData();
      }
    }
  }


  View(element) {
    // //debugger;
    // this.ClassSubjectId = element.ClassSubjectId;
    // this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    // setTimeout(() => {
    //   this.classSubjectAdd.PageLoad();
    // }, 50);
  }
  CopyFromPreviousBatch() {
    //console.log("here ", this.PreviousBatchId)
    this.PreviousBatchId = +this.tokenstorage.getPreviousBatchId();
    if (this.PreviousBatchId == -1)
      this.contentservice.openSnackBar("Previous batch not defined.",globalconstants.ActionText,globalconstants.RedBackground);
    else
      this.GetClassTeacher(1)
  }
  GetClassTeacher(previousbatch) {
    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //debugger;
    this.loading = true;
    var _teacherId = this.searchForm.get("searchTeacherId").value.TeacherId;
    var _classId = this.searchForm.get("searchClassId").value;
    if (_teacherId == undefined && _classId == 0) {
      this.loading = false; this.PageLoading=false;
      this.contentservice.openSnackBar("Please select atleast one of the options", globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }

    if (previousbatch == 1)
      filterStr = this.StandardFilterWithPreviousBatchId
    else
      filterStr = this.StandardFilterWithBatchId

    if (_teacherId != undefined)
      filterStr += " and TeacherId eq " + _teacherId;
    if (_classId != 0)
      filterStr += " and ClassId eq " + _classId;

    // else {
    //   this.loading = false; this.PageLoading=false;
    //   this.contentservice.openSnackBar("Please select teacher", globalconstants.ActionText,globalconstants.RedBackground);
    //   return;
    // }
    //filterStr += ' and ' + ;

    let list: List = new List();
    list.fields = [
      "TeacherClassMappingId",
      "TeacherId",
      "ClassId",
      "SectionId",
      "BatchId",
      "Active"
    ];

    list.PageName = this.TeacherClassSubjectListName;
    list.filter = [filterStr];
    this.ClassSubjectTeacherList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (_classId != 0 && _teacherId != undefined) {
          if (data.value.length > 0)
            data.value.forEach(element => {
              this.ClassSubjectTeacherList.push({
                "TeacherClassMappingId": previousbatch==1?0:element.TeacherClassMappingId,
                "TeacherId": element.TeacherId,
                "ClassId": element.ClassId,
                "SectionId": element.SectionId,
                "Section": this.Sections.filter(f => f.MasterDataId == element.SectionId)[0].MasterDataName,
                "Active": previousbatch==1?0:element.Active,
                "Action": false
              })
            });
          else
            this.Sections.forEach(s => {
              this.ClassSubjectTeacherList.push({
                "TeacherClassMappingId": 0,
                "TeacherId": 0,
                "ClassId": this.searchForm.get("searchClassId").value,
                "SectionId": s.MasterDataId,
                "Section": s.MasterDataName,
                "Active": 0,
                "Action": false
              })
            });

        }
        else {
          //var filteredClasses = ;
          this.Sections.forEach(s => {
            var existing = data.value.filter(f => f.SectionId == s.MasterDataId);
            if (existing.length > 0) {
              this.ClassSubjectTeacherList.push({
                "TeacherClassMappingId": previousbatch==1?0:existing[0].TeacherClassMappingId,
                "TeacherId": existing[0].TeacherId,
                "ClassId": existing[0].ClassId,
                "SectionId": existing[0].SectionId,
                "Section": this.Sections.filter(s => s.MasterDataId == existing[0].SectionId)[0].MasterDataName,
                "Active": previousbatch==1?0:existing[0].Active,
                "Action": false
              })
            }
            else {
              this.ClassSubjectTeacherList.push({
                "TeacherClassMappingId": 0,
                "TeacherId": 0,
                "ClassId": this.searchForm.get("searchClassId").value,
                "SectionId": s.MasterDataId,
                "Section": s.MasterDataName,
                "Active": 0,
                "Action": false
              })
            }

          })
        }
        this.dataSource = new MatTableDataSource<IClassTeacher>(this.ClassSubjectTeacherList);
        this.loading = false; this.PageLoading=false;
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
  //         this.contentservice.openSnackBar(globalconstants.DeletedMessage,globalconstants.ActionText,globalconstants.BlueBackground);

  //       });
  // }

  UpdateOrSave(row) {

    //debugger;
    this.loading = true;

    // var selectedSubjectType = this.ClassSubjectList.filter(c => c.SubjectTypeId == row.SubjectTypeId);
    // if (selectedSubjectType.length > row.SelectHowMany && row.SelectHowMany > 0) {
    //   this.contentservice.openSnackBar("Allowed no. subjects selected is exceeded for this subject type.",globalconstants.ActionText,globalconstants.RedBackground);
    //   this.loading = false; this.PageLoading=false;
    //   return;
    // }

    let checkFilterString = "TeacherId eq " + row.TeacherId +
      " and ClassId eq " + row.ClassId +
      " and SectionId eq " + row.SectionId +
      " and Active eq 1 ";

    if (row.TeacherClassMappingId > 0)
      checkFilterString += " and TeacherClassMappingId ne " + row.TeacherClassMappingId;

    checkFilterString += ' and ' + this.StandardFilterWithBatchId;

    let list: List = new List();
    list.fields = ["TeacherClassMappingId"];
    list.PageName = this.TeacherClassSubjectListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading=false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
          row.Ative = 0;
          return;
        }
        else {

          this.ClassSubjectTeacherData.Active = row.Active;
          this.ClassSubjectTeacherData.TeacherClassMappingId = row.TeacherClassMappingId;
          this.ClassSubjectTeacherData.ClassId = row.ClassId;
          this.ClassSubjectTeacherData.TeacherId = row.TeacherId;
          this.ClassSubjectTeacherData.SectionId = row.SectionId;
          this.ClassSubjectTeacherData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ClassSubjectTeacherData.BatchId = this.SelectedBatchId;
          if (row.TeacherClassMappingId == 0) {
            this.ClassSubjectTeacherData["CreatedDate"] = new Date();
            this.ClassSubjectTeacherData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.ClassSubjectTeacherData["UpdatedDate"];
            delete this.ClassSubjectTeacherData["UpdatedBy"];
            //console.log('to insert', this.ClassSubjectTeacherData)
            this.insert(row);
          }
          else {

            delete this.ClassSubjectTeacherData["CreatedDate"];
            delete this.ClassSubjectTeacherData["CreatedBy"];
            this.ClassSubjectTeacherData["UpdatedDate"] = new Date();
            this.ClassSubjectTeacherData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            //console.log('to update', this.ClassSubjectTeacherData)
            this.update(row);
          }
        }
      });

  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.TeacherClassSubjectListName, this.ClassSubjectTeacherData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading=false;
          row.TeacherClassMappingId = data.TeacherClassMappingId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.TeacherClassSubjectListName, this.ClassSubjectTeacherData, this.ClassSubjectTeacherData.TeacherClassMappingId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading=false;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
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

    list.fields = ["WorkAccountId"];
    list.PageName = "EmpEmployeeGradeSalHistories";
    list.lookupFields = ["Employee($select=EmpEmployeeId", "FirstName", "LastName)"]
    list.filter = [orgIdSearchstr + " and Active eq 1 and WorkAccountId eq " + _workAccountId];
    //list.orderBy = "ParentId";
    this.Teachers = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.filter(f => {
          this.Teachers.push({
            TeacherId: f.Employee.EmpEmployeeId,
            TeacherName: f.Employee.FirstName + " " + f.Employee.LastName
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
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.ClassSubjects = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        this.ClassSubjects = data.value.map(item => {
          var _classname = this.Classes.filter(f => f.ClassId == item.ClassId)[0].ClassName;
          var _subjectName = this.Subjects.filter(f => f.MasterDataId == item.SubjectId)[0].MasterDataName;

          return {
            ClassSubjectId: item.ClassSubjectId,
            ClassSubject: _classname + "-" + _subjectName
          }
        })
      })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        //this.Classes = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASS);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Batches = this.tokenstorage.getBatches()

        //this.shareddata.ChangeClasses(this.Classes);
        this.shareddata.ChangeSubjects(this.Subjects);
        //this.shareddata.ChangeBatch(this.Batches);
        this.GetTeachers();
        //this.GetClassSubject();
        this.loading = false; this.PageLoading=false;
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
export interface IClassTeacher {
  TeacherClassMappingId: number;
  TeacherId: number;
  ClassId: number;
  SectionId: number;
  Section: string;
  Active: number;
  Action: boolean
}
export interface ITeachers {
  TeacherId: number;
  TeacherName: string;
}
