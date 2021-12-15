import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-promoteclass',
  templateUrl: './promoteclass.component.html',
  styleUrls: ['./promoteclass.component.scss']
})
export class PromoteclassComponent implements OnInit {
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;
  // @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  Conditions = [
    { text: 'and above', val: 'and above' },
    { text: 'and below', val: 'and below' }
  ];
  RowsToUpdate = -1;
  ClassGradeCondition = [];
  searchConditionText = '';
  RollNoGenerationSortBy = '';
  SearchSectionId = 0;
  Permission = '';
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
  SelectedApplicationId=0;
  StandardFilter = '';
  loading = false;
  RollNoGeneration = [];
  ClassPromotion = [];
  Genders = [];
  Classes = [];
  FeeTypes = [];
  Sections = [];
  StudentGrades = [];
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
    'Class',
    'Grade',
    'Condition',
    'Action'
  ];
  Students: IStudent[] = [];
  filteredOptions: Observable<IStudent[]>;
  constructor(
    private contentservice: ContentService,
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
      searchClassId: [0],
      searchCondition: [''],
      searchGradeId: ['']
    });
    this.PageLoad();
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  PageLoad() {
    //debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
        this.Classes = [...data.value];
      })
      this.shareddata.CurrentBatchId.subscribe(c => this.CurrentBatchId = c);
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      this.NextBatchId = +this.tokenstorage.getNextBatchId();
      this.PreviousBatchId = +this.tokenstorage.getPreviousBatchId();

      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.SUBJECT.CLASSSTUDENT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.SUBJECT.PROMOTESTUDENT);
      if (perObj.length > 0)
        this.PromotePermission = perObj[0].permission;

      this.checkBatchIdNSelectedIdEqual = +this.tokenstorage.getCheckEqualBatchId();
      ////console.log('selected batchid', this.SelectedBatchId);
      ////console.log('current batchid', this.CurrentBatchId)
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
      ////console.log('log', this.CheckPermission)
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);

      //this.shareddata.CurrentClasses.subscribe(a => this.Classes = a);
      //this.shareddata.CurrentSelectedBatchId.subscribe(a => this.SelectedBatchId = a);
      this.shareddata.CurrentPreviousBatchIdOfSelecteBatchId.subscribe(p => this.PreviousBatchId = p);
      //this.shareddata.CurrentFeeType.subscribe(b => this.FeeTypes = b);
      this.shareddata.CurrentSection.subscribe(b => this.Sections = b);
      this.shareddata.CurrentBatch.subscribe(b => this.Batches = b);
      if (this.Classes.length == 0 || this.FeeTypes.length == 0 || this.Sections.length == 0) {
        this.GetMasterData();
        this.GetFeeTypes();
      }
      else {

        //this.SelectedBatchId = this.Batches.filter(b => b.CurrentBatch==1)[0].BatchId;

        this.loading = false;
      }
    }
  }

  PromoteAll() {
    var _rowstoupdate = this.StudentClassList.filter(f => f.Promote == 1);
    this.RowsToUpdate = _rowstoupdate.length;
    _rowstoupdate.forEach(s => {
      this.RowsToUpdate--;
      s.StudentClassId = 0;
      delete s.SectionId;
      s.RollNo = '';
      this.SelectedBatchId = this.CurrentBatchId;
      s.ClassId = this.Classes[this.Classes.findIndex(i => s.ClassId) + 1].MasterDataId;
      this.UpdateOrSave(s);
    })
  }
  PromoteRow(row) {
    if (row.Promote == 1) {
      row.StudentClassId = 0;
      delete row.SectionId;
      row.RollNo = '';
      this.SelectedBatchId = this.CurrentBatchId;
      row.ClassId = this.Classes[this.Classes.findIndex(i => row.ClassId) + 1].MasterDataId;
      this.UpdateOrSave(row);
    }
  }
  CheckPromoteAll(event) {
    //debugger;
    var _promote = 0;
    if (event.checked) {
      _promote = 1;
    }

    this.StudentClassList.forEach(s => {
      s.Promote = _promote;
    })

  }
  EnablePromote(row, control) {
    if (control.checked) {
      row.Promote = 1;
      row.Action = true;
    }
    else {
      row.Promote = 0;
      row.Action = false;
    }

  }
  promotePreviousBatch() {
    //debugger;

    var previousBatchIndex = this.Batches.map(d => d.BatchId).indexOf(4) - 1;
    var previousBatchId = this.Batches[previousBatchIndex];
    if (previousBatchIndex > -1) {
      this.SelectedBatchId = previousBatchId;
      this.GetStudentClasses();

    }
  }
  onBlur(row) {
    row.Action = true;
  }
  UploadExcel() {

  }
  GetFeeTypes() {
    this.loading = true;
    var filter = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = [filter];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeTypes = [...data.value];
        this.shareddata.ChangeFeeType(this.FeeTypes);
        this.loading = false;
      })
  }
  GetStudentClasses() {

    //debugger;
    // var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages[0].SUBJECT.ASSIGNSTUDENTCLASS);
    // if (perObj.length > 0)
    //   this.Permission = perObj[0].permission;

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
      'Active'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student($select=FirstName,LastName,Gender)"];
    list.filter = [filterStr];
    this.StudentClassList = [];
    this.dataservice.get(list)
      .subscribe((StudentClassesdb: any) => {
        var result;
        // if (this.searchForm.get("searchGenderId").value > 0)
        //   result = StudentClassesdb.value.filter(f => f.Student.Gender == this.searchForm.get("searchGenderId").value);
        // else
        result = [...StudentClassesdb.value];

        result.forEach(s => {
          var feetype = this.FeeTypes.filter(t => t.FeeTypeId == s.FeeTypeId);
          var _feetype = ''
          if (feetype.length > 0)
            _feetype = feetype[0].FeeTypeName;

          this.StudentClassList.push({
            StudentClassId: s.StudentClassId,
            ClassId: s.ClassId,
            StudentId: s.StudentId,
            StudentName: s.Student.FirstName + " " + s.Student.LastName,
            ClassName: this.Classes.filter(c => c.ClassId == s.ClassId)[0].ClassName,
            FeeTypeId: s.FeeTypeId,
            FeeType: _feetype,
            RollNo: s.RollNo,
            SectionId: s.SectionId,
            Section: s.SectionId > 0 ? this.Sections.filter(sc => sc.MasterDataId == s.SectionId)[0].MasterDataName : '',
            Active: s.Active,
            Promote: 0,
            Action: false
          });
        })

        if (this.StudentClassList.length == 0)
          this.alert.info("No record found!", this.optionAutoClose);
        this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList);

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
  SaveAll() {
    var _toUpdate = this.StudentClassList.filter(f => f.Action);
    this.RowsToUpdate = _toUpdate.length;
    _toUpdate.forEach(e => {
      this.RowsToUpdate--;
      this.UpdateOrSave(e);
    })
  }
  SaveRow(row) {
    this.RowsToUpdate = 0;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    //debugger;
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
            //console.log('to insert', this.StudentClassData)
            this.insert(row);
          }
          else {
            delete this.StudentClassData["CreatedDate"];
            delete this.StudentClassData["CreatedBy"];
            this.StudentClassData["UpdatedDate"] = new Date();
            this.StudentClassData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('StudentClasses', this.StudentClassData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.StudentClassId = data.StudentClassId;
          row.Action = false;
          if (row.Promote == 1)
            this.StudentClassList.splice(this.StudentClassList.indexOf(row), 1);

          if (this.RowsToUpdate == 0) {
            if (row.Promote == 1) {
              this.alert.success("Student/s is promoted to next class without section and roll no.", this.optionsNoAutoClose);
            }
            else
              this.alert.success("Data saved successfully.", this.optionAutoClose);
            this.RowsToUpdate = -1;
          }

        });
  }
  update(row) {

    this.dataservice.postPatch('StudentClasses', this.StudentClassData, this.StudentClassData.StudentClassId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          if (this.RowsToUpdate == 0) {
            this.loading = false;
            this.alert.success("Data updated successfully.", this.optionAutoClose);
          }
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
      'FirstName',
      'LastName'
    ];

    list.PageName = "Students";
    //list.lookupFields = ["Student"]
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Students = data.value.map(student => {
            return {
              StudentId: student.StudentId,
              Name: student.StudentId + '-' + student.FirstName + '-' + student.LastName
            }
          })
        }
        this.loading = false;
      })
  }
  onNgModelChange(selected) {

  }
  addCondition() {
    var _className = 'All';
    var classobj = this.Classes.filter(f => f.ClassId == this.searchForm.get("searchClassId").value);
    if (classobj.length > 0)
      _className = classobj[0].ClassName;
    var _gradeName = 'All';
    var gradeobj = this.StudentGrades.filter(f => f.MasterDataId == this.searchForm.get("searchGradeId").value);
    if (gradeobj.length > 0)
      _gradeName = gradeobj[0].MasterDataName;

    var newItem = {
      "Condition": this.searchForm.get("searchCondition").value,
      "ClassId": this.searchForm.get("searchClassId").value,
      "GradeId": this.searchForm.get("searchGradeId").value,
      Class: _className,
      Grade: _gradeName
    };
    var indx = this.ClassGradeCondition.indexOf(newItem);
    if (indx == -1) {
      this.ClassGradeCondition.push(newItem)
    }
    else {
      this.alert.info("Item already exists.", this.optionsNoAutoClose);
    }
    this.dataSource = new MatTableDataSource(this.ClassGradeCondition);
  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        debugger;
        this.allMasterData = [...data.value];
        this.RollNoGeneration = this.getDropDownData(globalconstants.MasterDefinitions.school.ROLLNOGENERATION);
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
        this.ClassPromotion = this.getDropDownData(globalconstants.MasterDefinitions.school.CLASSPROMOTION);

        //this.shareddata.ChangeBatch(this.Batches);
        this.RollNoGenerationSortBy = "Sort by: " + this.RollNoGeneration.filter(f => f.MasterDataName.toLowerCase() == 'sort by')[0].Logic;
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
  StudentName: string;
  RollNo: string;
  SectionId: number;
  Section: string;
  FeeTypeId: number;
  FeeType: string;
  Promote: number;
  Active: number;
  Action: boolean
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}
