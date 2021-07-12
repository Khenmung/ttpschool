import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
  selector: 'app-AssignStudentclassdashboard',
  templateUrl: './Assignstudentclassdashboard.component.html',
  styleUrls: ['./Assignstudentclassdashboard.component.scss']
})
export class AssignStudentclassdashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  PagePermission = '';
  PromotePermission = '';
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
  FeeTypes = [];
  Sections = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  PreviousBatchId = 0;
  NextBatchId = 0;
  Batches = [];
  StudentClassList: IStudentClass[] = [];
  dataSource: MatTableDataSource<IStudentClass>;
  allMasterData = [];
  searchForm: FormGroup;

  //ClassSubjectId = 0;
  checkBatchIdNSelectedIdEqual = 0;
  StudentClassData = {
    StudentClassId: 0,
    ClassId: 0,
    OrgId: 0,
    BatchId: 0,
    StudentId: 0,
    RollNo: 0,
    SectionId: 0,
    FeeTypeId: 0,
    Active: 1
  };
  displayedColumns = [
    'Student',
    'ClassName',
    'RollNo',
    'SectionId',
    'FeeTypeId',
    'Promote',
    'Action'
  ];
  Students: IStudent[] = [];
  filteredOptions: Observable<IStudent[]>;
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
      //searchStudentName: [0],
      searchSectionId: [0],
      searchClassId: [0],
      searchStudentFromClassId: [0],
    });
    // this.filteredOptions = this.searchForm.get("searchStudentName").valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => typeof value === 'string' ? value : value.Name),
    //     map(Name => Name ? this._filter(Name) : this.Students.slice())
    //   );
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
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.shareddata.CurrentBatchId.subscribe(c => this.CurrentBatchId = c);
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      this.NextBatchId = +this.tokenstorage.getNextBatchId();
      this.PreviousBatchId = +this.tokenstorage.getPreviousBatchId();
      this.PagePermission = globalconstants.getPermission(this.LoginUserDetail, this.tokenstorage, globalconstants.Pages[0].SUBJECT.ASSIGNSTUDENTCLASS);
      this.PromotePermission = globalconstants.getPermission(this.LoginUserDetail, this.tokenstorage, globalconstants.Pages[0].SUBJECT.STUDENTPROMOTE);
      this.checkBatchIdNSelectedIdEqual = +this.tokenstorage.getCheckEqualBatchId();
      console.log('selected batchid', this.SelectedBatchId);
      console.log('current batchid', this.CurrentBatchId)
      if (this.PromotePermission == 'read')
        this.displayedColumns = [
          'Student',
          'ClassName',
          'RollNo',
          'SectionId',
          'FeeTypeId',
          //'Promote',
          'Action'
        ];
      //console.log('log', this.CheckPermission)
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.shareddata.CurrentClasses.subscribe(a => this.Classes = a);
      //this.shareddata.CurrentSelectedBatchId.subscribe(a => this.SelectedBatchId = a);
      this.shareddata.CurrentPreviousBatchIdOfSelecteBatchId.subscribe(p => this.PreviousBatchId = p);
      this.shareddata.CurrentFeeType.subscribe(b => this.FeeTypes = b);
      this.shareddata.CurrentSection.subscribe(b => this.Sections = b);
      this.shareddata.CurrentBatch.subscribe(b => this.Batches = b);
      // console.log("pre", this.PreviousBatchId)
      // console.log("seelected", this.SelectedBatchId)
      // console.log("next", this.NextBatchId)
      //this.shareddata.CurrentNextBatchIdOfSelecteBatchId.subscribe(n => this.NextBatchId = n);
      //this.shareddata.CurrentBatch.subscribe(b => this.Batches = b);
      if (this.Classes.length == 0 || this.FeeTypes.length == 0 || this.Sections.length == 0) {
        this.GetMasterData();
      }
      else {

        //this.SelectedBatchId = this.Batches.filter(b => b.CurrentBatch==1)[0].BatchId;

        this.loading = false;
      }
    }
  }
  PromoteAll() {
    this.StudentClassList.forEach(s => {
      if (s.Promote == 1) {
        s.StudentClassId = 0;
        delete s.SectionId;
        s.RollNo = '';
        this.SelectedBatchId = this.CurrentBatchId;
        s.ClassId = this.Classes[this.Classes.findIndex(i => s.ClassId) + 1].MasterDataId;
        this.UpdateOrSave(s);
      }
    })
  }
  CheckPromoteAll(event) {
    debugger;
    var _promote = 0;
    if (event.checked) {
      _promote = 1;
    }

    this.StudentClassList.forEach(s => {
      s.Promote = _promote;
    })

  }
  Promote(row, control) {
    if (control.checked)
      row.Promote = 1;
    else
      row.Promote = 0;
  }
  promotePreviousBatch() {
    debugger;

    var previousBatchIndex = this.Batches.map(d => d.BatchId).indexOf(4) - 1;
    var previousBatchId = this.Batches[previousBatchIndex];
    if (previousBatchIndex > -1) {
      this.SelectedBatchId = previousBatchId;
      this.GetStudentClasses();

    }
  }
  UploadExcel() {

  }
  GetStudentClasses() {
    debugger;
    this.PagePermission = globalconstants.getPermission(this.LoginUserDetail, this.tokenstorage, globalconstants.Pages[0].SUBJECT.ASSIGNSTUDENTCLASS);
    let filterStr = ' OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    // if (this.searchForm.get("searchStudentName").value.StudentId == 0 && this.searchForm.get("searchClassId").value == 0) {
    //   this.alert.error("Please select class/stream", this.optionAutoClose);
    //   return;
    // }
    this.loading = true;
    if (this.searchForm.get("searchClassId").value > 0)
      filterStr += " and ClassId eq " + this.searchForm.get("searchClassId").value;
    
    if (this.searchForm.get("searchSectionId").value > 0)
      filterStr += " and SectionId eq " + this.searchForm.get("searchSectionId").value;
    filterStr += ' and BatchId eq ' + this.SelectedBatchId;

    if (filterStr.length == 0) {
      this.loading = false;
      this.alert.error("Please enter search criteria.", this.optionAutoClose);
      return;
    }

    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'StudentId',
      'FeeTypeId',
      'ClassId',
      'RollNo',
      'SectionId',
      'Active',
      'Student/Name'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student"];
    list.filter = [filterStr];
    this.StudentClassList = [];
    this.dataservice.get(list)
      .subscribe((StudentClassesdb: any) => {

        StudentClassesdb.value.forEach(s => {
          this.StudentClassList.push({
            StudentClassId: s.StudentClassId,
            ClassId: s.ClassId,
            StudentId: s.StudentId,
            Student: s.Student.Name,
            ClassName: this.Classes.filter(c => c.MasterDataId == s.ClassId)[0].MasterDataName,
            FeeTypeId: s.FeeTypeId,
            FeeType: this.FeeTypes.filter(t => t.MasterDataId == s.FeeTypeId)[0].MasterDataName,
            RollNo: s.RollNo,
            SectionId: s.SectionId,
            Section: s.SectionId > 0 ? this.Sections.filter(sc => sc.MasterDataId == s.SectionId)[0].MasterDataName : '',
            Active: s.Active,
            Promote: 0
          });
        })

        if (this.StudentClassList.length == 0)
          this.alert.info("No record found!", this.optionAutoClose);
        this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.loading = false;

      })

    //set current batch id back to the actual one.
    //this.shareddata.CurrentSelectedBatchId.subscribe(s => this.SelectedBatchId = s);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,

    });
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
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

    let checkFilterString = "ClassId eq " + row.ClassId +
      " and StudentId eq " + row.StudentId + ' and Active eq 1 and BatchId eq ' + this.SelectedBatchId
    // " and Active eq " + row.Active +
    this.StandardFilter;

    if (row.StudentClassId > 0)
      checkFilterString += " and StudentClassId ne " + row.StudentClassId;

    let list: List = new List();
    list.fields = ["StudentClassId"];
    list.PageName = "StudentClasses";
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
          //var _section= this.Sections.filter(s=>s.MasterDataId == row.Section)
          this.StudentClassData.Active = row.Active;
          this.StudentClassData.StudentClassId = row.StudentClassId;
          this.StudentClassData.StudentId = row.StudentId;
          this.StudentClassData.ClassId = row.ClassId;
          this.StudentClassData.FeeTypeId = row.FeeTypeId;
          this.StudentClassData.RollNo = row.RollNo;
          this.StudentClassData.SectionId = row.SectionId;
          this.StudentClassData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentClassData.BatchId = this.SelectedBatchId;
          if (this.StudentClassData.StudentClassId == 0) {
            this.StudentClassData["CreatedDate"] = new Date();
            this.StudentClassData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.StudentClassData["UpdatedDate"];
            delete this.StudentClassData["UpdatedBy"];
            console.log('to insert', this.StudentClassData)
            this.insert(row);
          }
          else {
            delete this.StudentClassData["CreatedDate"];
            delete this.StudentClassData["CreatedBy"];
            this.StudentClassData["UpdatedDate"] = new Date();
            this.StudentClassData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update();
          }
        }
      });

  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('StudentClasses', this.StudentClassData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.StudentClassId = data.StudentClassId;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {

    this.dataservice.postPatch('StudentClasses', this.StudentClassData, this.StudentClassData.StudentClassId, 'patch')
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

  GetStudents() {

    let list: List = new List();
    list.fields = [
      'StudentId',
      'Name'
    ];

    list.PageName = "Students";
    //list.lookupFields = ["Student"]
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Students = data.value.map(student => {
            return {
              StudentId: student.StudentId,
              Name: student.StudentId + ' - ' + student.Name
            }
          })
        }
        this.loading = false;
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

        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASS);
        this.FeeTypes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].FEETYPE);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SECTION);
        this.shareddata.ChangeFeeType(this.FeeTypes);
        this.shareddata.ChangeClasses(this.Classes);
        this.shareddata.ChangeBatch(this.Batches);
        //this.GetStudents();
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
export interface IStudentClass {
  StudentClassId: number;
  ClassId: number;
  ClassName: string;
  StudentId: number;
  Student: string;
  RollNo: string;
  SectionId: number;
  Section: string;
  FeeTypeId: number;
  FeeType: string;
  Promote: number;
  Active;
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}