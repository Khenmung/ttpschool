import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-studentactivity',
  templateUrl: './studentactivity.component.html',
  styleUrls: ['./studentactivity.component.scss']
})
export class StudentactivityComponent implements OnInit {
  LoginUserDetail: any[] = [];
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
  StudentActivityList: IStudentActivity[] = [];
  SelectedBatchId = 0;
  Classes = [];
  Batches = [];
  Sections=[];
  Students: IStudent[] = [];
  filteredOptions: Observable<IStudent[]>;
  dataSource: MatTableDataSource<IStudentActivity>;
  allMasterData = [];

  ExamId = 0;
  StudentActivityData = {
    StudentActivityId: 0,
    StudentClassId: 0,
    Activity: '',
    ActivityDate: Date,
    OrgId: 0,
    BatchId: 0,
    Active: 0
  };
  displayedColumns = [
    'Student',
    'Activity',
    'ActivityDate',
    'Active',
    'Action'
  ];
  searchForm: FormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    debugger;
    this.searchForm = this.fb.group({
      searchStudentName: [0]
    });
    this.filteredOptions = this.searchForm.get("searchStudentName").valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(Name => Name ? this._filter(Name) : this.Students.slice())
      );
    //this.shareddata.CurrentSelectedBatchId.subscribe(s => this.SelectedBatchId = s);
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);

      this.GetMasterData();
    }
  }

  updateActive(row, value) {
    //if(!row.Action)
    //row.Action = !row.Action;
    row.Active = row.Active == 1 ? 0 : 1;
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

    debugger;
    this.loading = true;
    let checkFilterString = "StudentClassId eq " + row.StudentClassId +
      " and Activity eq '" + row.Activity + "'";


    if (row.StudentActivityId > 0)
      checkFilterString += " and StudentActivityId ne " + row.StudentActivityId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["StudentActivityId"];
    list.PageName = "StudentActivities";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();

          this.StudentActivityData.StudentActivityId = row.StudentActivityId;
          this.StudentActivityData.StudentClassId = row.StudentClassId;
          this.StudentActivityData.Active = row.Active;
          this.StudentActivityData.Activity = row.Activity;
          this.StudentActivityData.ActivityDate = row.ActivityDate;
          this.StudentActivityData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentActivityData.BatchId = this.SelectedBatchId;
          //console.log('data', this.ClassSubjectData);
          if (this.StudentActivityData.StudentActivityId == 0) {
            this.StudentActivityData["CreatedDate"] = new Date();
            this.StudentActivityData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.StudentActivityData["UpdatedDate"] = new Date();
            delete this.StudentActivityData["UpdatedBy"];
            //console.log('exam slot', this.SlotNClassSubjectData)
            this.insert(row);
          }
          else {
            delete this.StudentActivityData["CreatedDate"];
            delete this.StudentActivityData["CreatedBy"];
            this.StudentActivityData["UpdatedDate"] = new Date();
            this.StudentActivityData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
      this.loading = false;   
  }
  insert(row) {

    debugger;
    this.dataservice.postPatch('StudentActivities', this.StudentActivityData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.StudentActivityId = data.StudentActivityId;
          row.Action = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch('StudentActivities', this.StudentActivityData, this.StudentActivityData.StudentActivityId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
          this.loadingFalse();
        });
  }
  GetStudentActivity() {
    debugger;
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and StudentClassId eq ' + this.searchForm.get("searchStudentName").value.StudentClassId
    filterStr += ' and BatchId eq ' + this.SelectedBatchId;
    let list: List = new List();
    list.fields = [
      'StudentActivityId',
      'StudentClassId',
      'Activity',
      'ActivityDate',
      'Remarks',
      'Active'
    ];

    list.PageName = "StudentActivities";
    list.filter = [filterStr];
    this.StudentActivityList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.StudentActivityList = data.value.map(item => {
            return {
              StudentActivityId: item.StudentActivityId,
              Student: this.searchForm.get("searchStudentName").value.Name,
              StudentClassId: item.StudentClassId,
              Activity: item.Activity,
              ActivityDate: item.ActivityDate,
              Remark: '',
              Active: item.Active,
              Action: false
            }
          })
        }
        else {
          this.StudentActivityList.push({
            StudentActivityId: 0,
            Student: this.searchForm.get("searchStudentName").value.Name,
            StudentId: this.searchForm.get("searchStudentName").value.StudentClassId,
            StudentClassId: this.searchForm.get("searchStudentName").value.StudentClassId,
            Activity: '',
            Remark: '',
            ActivityDate: new Date(),
            Active: 0,
            Action: true
          })
        }
        this.dataSource = new MatTableDataSource<IStudentActivity>(this.StudentActivityList);
        this.loadingFalse();
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
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASS);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SECTION);
        //this.shareddata.ChangeBatch(this.Batches);
        this.GetStudents();
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
  GetStudents() {

    //console.log(this.LoginUserDetail);

    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'StudentId',
      'ClassId',
      'RollNo',
      'SectionId',
      'Student/Name'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student"]
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Students = data.value.map(student => {
            var _classNameobj = this.Classes.filter(c => c.MasterDataId == student.ClassId);
            var _className = '';
            if (_classNameobj.length > 0)
              _className = _classNameobj[0].MasterDataName;
            var _Section = this.Sections.filter(f=>f.MasterDataId == student.SectionId)[0].MasterDataName;
            var _RollNo = student.RollNo;
            var _name = student.Student.Name;
            var _fullDescription = _name + " - " + _className + " - " + _Section + " - " + _RollNo;
            return {
              StudentClassId: student.StudentClassId,
              StudentId: student.StudentId,
              Name: _fullDescription
            }
          })
        }
        this.loadingFalse();
      })
  }

}
export interface IStudentActivity {
  StudentActivityId: number;
  StudentClassId: number;
  StudentId: number;
  Student: string;
  Activity: string;
  ActivityDate: Date;
  Remark: string;
  Active: number;
  Action: boolean;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}


