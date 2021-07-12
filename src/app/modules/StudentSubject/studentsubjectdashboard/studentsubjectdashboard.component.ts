import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
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
  rowCount = 0;
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
  ClassSubjectList = [];
  Sections = [];
  Classes = [];
  Subjects = [];
  SelectedBatchId = 0;
  Batches = [];
  StudentSubjectList: IStudentSubject[] = [];
  dataSource: MatTableDataSource<IStudentSubject>;
  allMasterData = [];
  searchForm = this.fb.group({
    //searchBatchId: [0],
    searchClassId: [0],
    searchSubjectId: [0],
    searchSectionId: [0],
  });
  StoreForUpdate = [];
  StudentClassSubjectId = 0;
  StudentSubjectData = {
    StudentClassSubjectId: 0,
    StudentClassId: 0,
    ClassSubjectId: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 1
  };
  PagePermission='';
  displayedColumns = [
    'Student',
    // 'Subject',
    // 'SubjectType',
    //'Active',
    //'Action'
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
      //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      this.shareddata.CurrentSubjects.subscribe(r => this.Subjects = r);
      if (this.Classes.length == 0 || this.Subjects.length == 0)
        this.GetMasterData();
      else {


        this.loading = false;
      }
    }
  }
  GetClassSubjectId(event) {
    //this.ClassSubjectId = event;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
    this.GetStudentClassSubject();
  }
  SelectAll(){
    
  }
  GetStudentClassSubject() {
    debugger;

    if (this.searchForm.get("searchClassId").value == 0) {
      this.alert.info("Please select class", this.optionAutoClose);
      return;
    }
    if (this.searchForm.get("searchSectionId").value == 0) {
      this.alert.info("Please select section", this.optionAutoClose);
      return;
    }
    // if (this.searchForm.get("searchSubjectId").value == 0) {
    //   this.alert.info("Please select subject", this.optionAutoClose);
    //   return;
    // }
    let filterStr = ' OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
      ' and ClassId eq ' + this.searchForm.get("searchClassId").value;


    filterStr += ' and SectionId eq ' + this.searchForm.get("searchSectionId").value;
    filterStr += ' and BatchId eq ' + this.SelectedBatchId;


    if (filterStr.length == 0) {
      this.alert.error("Please enter search criteria.", this.optionAutoClose);
      return;
    }
    this.loading = true;
    let list: List = new List();
    list.fields = [
      'StudentClassSubjects/StudentClassSubjectId',
      'StudentClassSubjects/StudentClassId',
      'StudentClassSubjects/ClassSubjectId',
      'StudentClassSubjects/Active',
      'Student/Name',
      'StudentClassId',
      'RollNo',
      'SectionId',
      'ClassId',
      'Active'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student", "StudentClassSubjects"];
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((studentclassdb: any) => {
        debugger;
        //  console.log('data.value', data.value);
        this.StudentSubjectList = [];
        var _studentClassSubjectExisting = [];
        if (studentclassdb.value.length > 0) {

          studentclassdb.value.forEach(item => {
            item.StudentClassSubjects.forEach(clssubject => {
              _studentClassSubjectExisting.push({
                StudentClassSubjectId: clssubject.StudentClassSubjectId,
                StudentClassId: item.StudentClassId,
                ClassSubjectId: clssubject.ClassSubjectId,
                Active: item.Active,
                ClassId: item.ClassId,
                RollNo: item.RollNo,
                Student: item.Student.Name
              })
            })
          })
          var _filteredclasssubjectlist = this.ClassSubjectList.filter(c => c.ClassId == this.searchForm.get("searchClassId").value);
          var _studentDetail: any = {};
          var alreadyenteredsubject = false;
          //var _subjectName = '';
          //var alreadyenteredsubjects=[];
          _studentClassSubjectExisting.forEach(cs => {
            _studentDetail = {
              StudentClassSubjectId: cs.StudentClassSubjectId,
              StudentClassId: cs.StudentClassId,
              Student: cs.Student,
              //SectionId: cs.SectionId,
              RollNo: cs.RollNo,
            }
            _filteredclasssubjectlist.forEach(clssubject => {
              var _subjectName = this.Subjects.filter(s => s.MasterDataId == clssubject.SubjectId)[0].MasterDataName;
              alreadyenteredsubject = cs.ClassSubjectId == clssubject.ClassSubjectId;
              this.displayedColumns.push(_subjectName);
              if (!alreadyenteredsubject)
                _studentDetail.StudentClassSubjectId = 0;
              _studentDetail.SubjectTypeId = clssubject.SubjectTypeId;
              _studentDetail.SubjectType = clssubject.SubjectType.SubjectTypeName;
              _studentDetail.SelectHowMany = clssubject.SubjectType.SelectHowMany;
              _studentDetail[_subjectName] = alreadyenteredsubject;
              _studentDetail["Subject"] = _subjectName as string;
              _studentDetail.ClassSubjectId = clssubject.ClassSubjectId;
              _studentDetail.ClassId = clssubject.ClassId;
              _studentDetail.ClassName = this.Classes.filter(c => c.MasterDataId == clssubject.ClassId)[0].MasterDataName;
              _studentDetail.Action = false;
              _studentDetail.Active = alreadyenteredsubject ? cs.Active : 0;
              this.StoreForUpdate.push(_studentDetail);
            })
            console.log('this.StoreForUpdate',this.StoreForUpdate);
            this.StudentSubjectList.push(_studentDetail);
          })


        }
        else {
          var cls = this.Classes.filter(c => c.MasterDataId == this.searchForm.get("searchClassId").value)
          var _clsName = '';
          if (cls.length > 0)
            _clsName = cls[0].MasterDataName;

          this.alert.info("No student found for the selected class " + _clsName);
          this.loading = false;
          return;
        }
        this.displayedColumns.push("Action");
        //console.log("columns",this.StudentSubjectList)
        if (this.StudentSubjectList.length > 0)
          this.StudentDetailToDisplay = `${this.StudentSubjectList[0].Student} Class - ${this.StudentSubjectList[0].ClassName}, RollNo - ${this.StudentSubjectList[0].RollNo}`;
        this.dataSource = new MatTableDataSource<IStudentSubject>(this.StudentSubjectList);
        this.loading = false;
      });


    //this.changeDetectorRefs.detectChanges();
    //});
  }
  UpdateAll(){

  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSubjectId: 0,
      searchSubjectTypeId: 0,
      //searchBatchId: this.SelectedBatchId
    });
  }
  SelectAllInRow(element, event, colName) {
    //element.Action = true;
    debugger;
    //element.Active = event.checked == true ? 1 : 0;
    var columnexist = [];
    if (colName == 'Action') {
      for (var prop in element) {
        columnexist = this.displayedColumns.filter(f => f == prop)
        if (columnexist.length > 0 && event.checked && prop != 'Student' && prop != 'Action') {
          element[prop] = 1;
        }
        else if (columnexist.length > 0 && !event.checked && prop != 'Student' && prop != 'Action') {
          element[prop] = 0;
        }
      }
    }
    else {
      var currentrow = this.StoreForUpdate.filter(f => f.Subject == colName);
      if (event.checked) {
        currentrow[colName] = 1;
        element[colName] = 1;
      }
      else {
        currentrow[colName] = 0;
        element[colName] = 0;
      }
    }
  }
  SaveRow(element) {
    console.log("element", element)
    debugger;
    this.rowCount = 0;
    var columnexist;
    for (var prop in element) {
      columnexist = this.displayedColumns.filter(f => f == prop)
      

      if (columnexist.length > 0 && prop != 'Student' && prop != 'Action') {
        var row:any = this.StoreForUpdate.filter(s=>s.Subject == prop);
        var data = {
          Active: row.Active,
          StudentClassSubjectId: row.StudentClassSubjectId,
          StudentClassId: row.StudentClassId,
          ClassSubjectId: row.ClassSubjectId
        }

        this.UpdateOrSave(data);
      }

    }

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
      " and StudentClassId eq " + row.StudentClassId
    // " and Active eq " + row.Active +
    //this.StandardFilter;

    if (row.StudentClassSubjectId > 0)
      checkFilterString += " and StudentClassSubjectId ne " + row.StudentClassSubjectId;
    checkFilterString += " and " + this.StandardFilter
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
            this.update(row);
          }
          row.Action = false;
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('StudentClassSubjects', this.StudentSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.edited = false;
          this.rowCount++;
          row.StudentClassSubjectId = data.StudentClassSubjectId;
          if (this.rowCount == Object.keys(row).length - 3) {
            this.loading = false;
            this.alert.success("Data saved successfully", this.optionAutoClose);
          }

          //this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch('StudentClassSubjects', this.StudentSubjectData, this.StudentSubjectData.StudentClassSubjectId, 'patch')
      .subscribe(
        (data: any) => {
          this.edited = false;
          this.rowCount++;
          if (this.rowCount == Object.keys(row).length - 3) {
            this.loading = false;
            this.alert.success("Data saved successfully", this.optionAutoClose);
          }
          //this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  GetClassSubjects() {

    var orgIdSearchstr = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
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

    list.filter = ["Active eq 1 and " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassSubjectList = [...data.value];
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
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SUBJECT);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SECTION);
        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.shareddata.ChangeClasses(this.Classes);
        this.shareddata.ChangeSubjects(this.Subjects);
        //this.shareddata.ChangeBatch(this.Batches);
        this.GetClassSubjects();
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
  ClassId: number;
  ClassName: string;
  RollNo: string;
  Student: string;
  ClassSubjectId: number;
  SubjectTypeId: number;
  SubjectType: string;
  SelectHowMany: number;
  //SubjectId:number;
  Subject: string;
  Active: number;
  Action: boolean;
}

