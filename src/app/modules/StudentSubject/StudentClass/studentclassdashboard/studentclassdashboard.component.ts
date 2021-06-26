import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-studentclassdashboard',
  templateUrl: './studentclassdashboard.component.html',
  styleUrls: ['./studentclassdashboard.component.scss']
})
export class StudentclassdashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
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
  SelectedBatchId = 0;
  Batches = [];
  StudentClassList: IStudentClass[] = [];
  dataSource: MatTableDataSource<IStudentClass>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchBatchId: [0],
    searchClassId: [0],
    searchStudentFromClassId: [0],
  });
  //ClassSubjectId = 0;
  StudentClassData = {
    StudentClassId: 0,
    ClassId: 0,
    OrgId: 0,
    Batch: 0,
    StudentId: 0,
    RollNo: 0,
    Section: 0,
    FeeTypeId: 0,
    Active: 1
  };
  displayedColumns = [
    'Student',
    'ClassName',
    'RollNo',
    'Section',
    'FeeType',
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
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.shareddata.CurrentClasses.subscribe(a => this.Classes = a);
      this.shareddata.CurrentSelectedBatchId.subscribe(a => this.SelectedBatchId = a);
      this.shareddata.ChangeCurrentBatchId(this.SelectedBatchId);
        this.searchForm.patchValue({
          "searchBatchId": this.SelectedBatchId
        })
      if (this.Classes.length == 0) {
        this.GetMasterData();
      }
      else {
        this.shareddata.CurrentFeeType.subscribe(b => this.FeeTypes = b);
        this.shareddata.CurrentBatch.subscribe(b => this.Batches = b);
        this.SelectedBatchId = this.Batches.filter(b => b.CurrentBatch==1)[0].BatchId;
        
        this.loading = false;
      }
    }
  }
  PromoteAll() {
    this.StudentClassList.forEach(s=>{
      if(s.Promote ==1)
      {
        s.StudentClassId =0;
        s.ClassId = this.Classes[this.Classes.findIndex(i=>i.ClassId) -1];
        this.UpdateOrSave(s);
      }
    })
  }
  Promote(row, control) {
    if (control.checked)
      row.Promote = 1;
    else
      row.Promote = 0;
  }
  GetStudentClasses() {
    let filterStr = ' OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    if (this.searchForm.get("searchClassId").value == 0) {
      this.alert.error("Please select class/stream", this.optionAutoClose);
      return;
    }

    filterStr += " and ClassId eq " + this.searchForm.get("searchClassId").value;

    
    filterStr += ' and Batch eq ' + this.SelectedBatchId;
    

    if (filterStr.length == 0) {
      this.alert.error("Please enter search criteria.", this.optionAutoClose);
      return;
    }

    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'FeeTypeId',
      'ClassId',
      'RollNo',
      'Section',
      'Active',
      'Student/Name'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student"];
    list.filter = [filterStr];
    this.StudentClassList = [];
    this.dataservice.get(list)
      .subscribe((StudentClassesdb: any) => {

        // let _StudentClassesdb = StudentClassesdb.value.map(item => {
        //   return {
        //     StudentClassId: item.StudentClassId,
        //     RollNo: item.RollNo,
        //     Section: item.Section,
        //     FeeTypeId: item.FeeTypeId,
        //     ClassId: item.ClassId,
        //     StudentId:item
        //     Active: item.Active
        //   }
        // })

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
            Section: s.Section,
            Active: s.Active,
            Promote:0
          });
        })

        this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.loading = false;

      })

  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSubjectId: 0,

      searchBatchId: this.SelectedBatchId
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

    let checkFilterString = "ClassId eq " + row.ClassId +
      " and StudentId eq " + row.StudentId + ' and Active eq 1 and Batch eq ' + this.SelectedBatchId
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
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
          row.Ative = 0;
          return;
        }
        else {

          this.StudentClassData.Active = row.Active;
          this.StudentClassData.StudentClassId = row.StudentClassId;
          this.StudentClassData.ClassId = row.ClassId;
          this.StudentClassData.FeeTypeId = row.FeeTypeId;
          this.StudentClassData.RollNo = row.RollNo;
          this.StudentClassData.Section = row.Section;
          this.StudentClassData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentClassData.Batch = this.SelectedBatchId;
          if (this.StudentClassData.StudentClassId == 0) {
            this.StudentClassData["CreatedDate"] = new Date();
            this.StudentClassData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.StudentClassData["UpdatedDate"];
            delete this.StudentClassData["UpdatedBy"];
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
          row.StudentClassId = data.StudentClassId;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {

    this.dataservice.postPatch('StudentClasses', this.StudentClassData, this.StudentClassData.StudentClassId, 'patch')
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
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BATCH);
        this.FeeTypes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].FEETYPE);
        
        this.shareddata.ChangeFeeType(this.FeeTypes);
        this.shareddata.ChangeClasses(this.Classes);
        this.shareddata.ChangeBatch(this.Batches);
      
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
  Section: string;
  FeeTypeId: number;
  FeeType: string;
  Promote:number;
  Active;
}
