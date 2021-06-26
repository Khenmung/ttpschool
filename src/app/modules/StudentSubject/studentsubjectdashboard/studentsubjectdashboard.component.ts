import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
//import { ClasssubjectComponent } from '../studentsubject/classsubject.component';

@Component({
  selector: 'app-studentsubjectdashboard',
  templateUrl: './studentsubjectdashboard.component.html',
  styleUrls: ['./studentsubjectdashboard.component.scss']
})
export class studentsubjectdashboardComponent implements OnInit {
  //@Input() StudentClassId:number;
  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  edited = false;
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
  StudentDetailToDisplay = '';
  StudentClassId = 0;
  StandardFilter = '';
  loading = false;
  Sections = [];
  Classes = [];
  Subjects = [];
  SelectedBatchId = 0;
  Batches = [];
  StudentSubjectList: IStudentSubject[];
  dataSource: MatTableDataSource<IStudentSubject>;
  allMasterData = [];
  searchForm = this.fb.group({
    //searchBatchId: [0],
    searchClassId: [0],
    searchSubjectId: [0],
    searchSection: [''],
  });
  StudentClassSubjectId = 0;
  StudentSubjectData = {
    StudentClassSubjectId: 0,
    StudentClassId: 0,
    ClassSubjectId: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 1
  };
  displayedColumns = [
    'Student',
    'Subject',
    'SubjectType',
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


  }
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.StudentClassId = 1;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.shareddata.CurrentClasses.subscribe(a => this.Classes = a);
      this.shareddata.CurrentSelectedBatchId.subscribe(b=>{
        this.SelectedBatchId == b
        // this.searchForm.patchValue({
        //   "searchBatchId": this.SelectedBatchId
        // })
      });
      if (this.Classes.length == 0)
        this.GetMasterData();
      else {
        this.shareddata.CurrentSubjects.subscribe(r => this.Subjects = r);
        
        this.loading = false;
      }
    }
  }
  GetClassSubjectId(event) {
    //this.ClassSubjectId = event;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
    this.GetStudentClassSubject();
  }

  GetStudentClassSubject() {

    let filterStr = ' OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
      ' and ClassId eq ' + this.searchForm.get("searchClassId").value;

    
      filterStr += ' and Batch eq ' + this.SelectedBatchId;
    

    if (filterStr.length == 0) {
      this.alert.error("Please enter search criteria.", this.optionAutoClose);
      return;
    }

    let list: List = new List();
    list.fields = [
      'StudentClassSubjects/StudentClassSubjectId',
      'StudentClassSubjects/StudentClassId',
      'StudentClassSubjects/ClassSubjectId',
      'StudentClassSubjects/Active',
      'Student/Name',
      'RollNo',
      'ClassId',
      'Active'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student", "StudentClassSubjects"];
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((studentclass: any) => {
        debugger;
        //  console.log('data.value', data.value);
        var _studentClassSubject = [];
        if (studentclass.value.length > 0) {
          _studentClassSubject = studentclass.value[0].StudentClassSubjects.map(item => {
            return {
              StudentClassSubjectId: item.StudentClassSubjectId,
              StudentClassId: item.StudentClassId,
              ClassSubjectId: item.ClassSubjectId,
              Active: item.Active,
              ClassId: studentclass.value[0].ClassId,
              RollNo: studentclass.value[0].RollNo,
              Student: studentclass.value[0].Student.Name
            }
          })
        }
        let list: List = new List();
        list.fields = ["ClassSubjectId",
          "ClassId",
          "SubjectId",
          "SubjectTypeId",
          "SubjectType/SubjectTypeName",
          "SubjectType/SelectHowMany"
        ];
        list.PageName = "ClassSubjects";
        list.lookupFields = ["SubjectType"];
        list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ' and ClassId eq ' + this.searchForm.get("searchClassId").value];
        this.dataservice.get(list)
          .subscribe((ClassSubjects: any) => {
            this.StudentSubjectList = ClassSubjects.value.map(cs => {
              let existing = _studentClassSubject.filter(e => e.ClassSubjectId == cs.ClassSubjectId)
              if (existing.length > 0) {
                return {
                  StudentClassSubjectId: existing[0].StudentClassSubjectId,
                  StudentClassId: existing[0].StudentClassId,
                  SubjectTypeId: cs.SubjectTypeId,
                  SubjectType: cs.SubjectType.SubjectTypeName,
                  SelectHowMany: cs.SubjectType.SelectHowMany,
                  Student: existing[0].Student,
                  Subject: this.Subjects.filter(s => s.MasterDataId == cs.SubjectId)[0].MasterDataName,
                  ClassSubjectId: existing[0].ClassSubjectId,
                  ClassId: existing[0].ClassId,
                  ClassName: this.Classes.filter(c => c.MasterDataId == existing[0].ClassId)[0].MasterDataName,
                  RollNo: existing[0].RollNo,
                  Active: existing[0].Active,
                  Action: false
                }
              }
              else {
                return {
                  StudentClassSubjectId: 0,
                  StudentClassId: this.StudentClassId,
                  SubjectTypeId: cs.SubjectTypeId,
                  SubjectType: cs.SubjectType.SubjectTypeName,
                  SelectHowMany: cs.SubjectType.SelectHowMany,
                  Student: studentclass.value[0].Student.Name,
                  Subject: this.Subjects.filter(s => s.MasterDataId == cs.SubjectId)[0].MasterDataName,
                  ClassSubjectId: cs.ClassSubjectId,
                  ClassId: studentclass.value[0].ClassId,
                  Active: 0,
                  Action: false
                }
              }
            })
            this.StudentDetailToDisplay = `${this.StudentSubjectList[0].Student} Class - ${this.StudentSubjectList[0].ClassName}, RollNo - ${this.StudentSubjectList[0].RollNo}`;
            this.dataSource = new MatTableDataSource<IStudentSubject>(this.StudentSubjectList);
            this.loading = false;
          });


        //this.changeDetectorRefs.detectChanges();
      });
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSubjectId: 0,
      searchSubjectTypeId: 0,
      //searchBatchId: this.SelectedBatchId
    });
  }
  UpdateActive(element, event) {
    element.Action = true;
    debugger;
    element.Active = event.checked == true ? 1 : 0;
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

    let checkFilterString = "ClassSubjectId eq " + row.ClassSubjectId +
      " and StudentClassId eq " + row.StudentClassId +
      // " and Active eq " + row.Active +
      this.StandardFilter;

    if (row.StudentClassSubjectId > 0)
      checkFilterString += " and StudentClassSubjectId ne " + row.StudentClassSubjectId;

    let list: List = new List();
    list.fields = ["ClassSubjectId"];
    list.PageName = "StudentClassSubjects";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionAutoClose);
          return;
        }
        else {
          let subjectSelectedCount = this.StudentSubjectList.filter(s => s.SubjectTypeId == row.SubjectTypeId && s.Active == 1);
          if (row.SelectHowMany > 0 && row.SelectHowMany < subjectSelectedCount.length) {
            var str = `Only ${row.SelectHowMany} Subjects can be selected for ${row.SubjectType}`;
            this.alert.warn(str, this.optionsNoAutoClose);
            return;
          }
          this.StudentSubjectData.Active = row.Active;
          this.StudentSubjectData.StudentClassSubjectId = row.StudentClassSubjectId;
          this.StudentSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentSubjectData.BatchId = this.SelectedBatchId;
          this.StudentSubjectData.StudentClassId = row.StudentClassId;
          this.StudentSubjectData.ClassSubjectId = row.ClassSubjectId;
          //console.log('data', this.StudentSubjectData);
          if (this.StudentSubjectData.StudentClassSubjectId == 0) {
            this.StudentSubjectData["CreatedDate"] = new Date();
            this.StudentSubjectData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.StudentSubjectData["UpdatedDate"];
            delete this.StudentSubjectData["UpdatedBy"];
            console.log('insert', this.StudentSubjectData);
            this.insert(row);
          }
          else {
            delete this.StudentSubjectData["CreatedDate"];
            delete this.StudentSubjectData["CreatedBy"];
            this.StudentSubjectData["UpdatedDate"] = new Date();
            this.StudentSubjectData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update();
          }
          row.Action = false;
          // this.OutClassSubjectId.emit(0);
          // this.CallParentPageFunction.emit();
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('StudentClassSubjects', this.StudentSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.edited = false;
          row.StudentClassSubjectId = data.StudentClassSubjectId;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {

    this.dataservice.postPatch('StudentClassSubjects', this.StudentSubjectData, this.StudentSubjectData.StudentClassSubjectId, 'patch')
      .subscribe(
        (data: any) => {
          this.edited = false;
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
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BATCH);
        this.shareddata.CurrentBatch.subscribe(c=>(this.Batches=c));
        this.shareddata.ChangeClasses(this.Classes);
        this.shareddata.ChangeSubjects(this.Subjects);
        this.shareddata.ChangeBatch(this.Batches);
        var _currentBatchId = this.Batches.filter(b=>b.CurrentBatch==1)[0].BatchId;
        this.GetStudentClassSubject();
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
export interface IStudentSubject {
  StudentClassSubjectId: number;
  StudentClassId: number;
  ClassName: string;
  RollNo: string;
  Student: string;
  ClassSubjectId: number;
  SubjectTypeId: number;
  Subject: string;
  Active: number;
}

