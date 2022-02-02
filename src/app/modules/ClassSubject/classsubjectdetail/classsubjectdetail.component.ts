import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-classsubjectdetail',
  templateUrl: './classsubjectdetail.component.html',
  styleUrls: ['./classsubjectdetail.component.scss']
})
export class ClassSubjectDetailComponent implements OnInit {

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
  ClassSubjectListName = "ClassSubjects";
  Permission = '';
  SelectedApplicationId = 0;
  StandardFilterWithBatchId = '';
  StandardFilterWithPreviousBatchId = '';
  PreviousBatchId = 0;
  loading = false;
  WorkAccounts = [];
  Teachers = [];
  Classes = [];
  Subjects = [];
  SubjectTypes = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  CheckBatchIDForEdit = 1;
  DataCountToSave = -1;
  Batches = [];
  //WorkAccounts = [];
  ClassSubjectList: IClassSubject[] = [];
  dataSource: MatTableDataSource<IClassSubject>;
  allMasterData = [];
  searchForm = this.fb.group({
    //searchBatchId: [0],
    //searchSubjectId: [0],
    //searchSubjectTypeId: [0],
    searchClassId: [0],
  });
  ClassSubjectId = 0;

  ClassSubjectData = {
    ClassSubjectId: 0,
    ClassId: 0,
    Credits: 0,
    OrgId: 0,
    BatchId: 0,
    TeacherId: 0,
    SubjectId: 0,
    SubjectTypeId: 0,
    Active: 1
  };
  displayedColumns = [
    'SubjectName',
    'SubjectTypeId',
    'Credits',
    'TeacherId',
    'Active',
    'Action'
  ];
  filteredOptions: any;
  Students: any;

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
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();

      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.SUBJECT.CLASSSUBJECTDETAIL);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      ////console.log(this.CheckPermission);
      this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
      this.StandardFilterWithPreviousBatchId = globalconstants.getStandardFilterWithPreviousBatchId(this.tokenstorage);
      //this.shareddata.CurrentClasses.subscribe(a => this.Classes = a);
      this.shareddata.CurrentSubjects.subscribe(r => this.Subjects = r);
      this.GetMasterData();
      this.GetSubjectTypes();
      if (this.Classes.length == 0) {
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];

        });
      }
    }
  }
  GetSessionFormattedMonths() {
    var _sessionStartEnd = {
      StartDate: new Date(),
      EndDate: new Date()
    };
    var Months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    var monthArray = [];
    //setTimeout(() => {

    this.shareddata.CurrentSelectedBatchStartEnd$.subscribe((b: any) => {

      if (b.length != 0) {
        _sessionStartEnd = { ...b };
        ////console.log('b',b)
        var _Year = new Date(_sessionStartEnd.StartDate).getFullYear();
        var startMonth = new Date(_sessionStartEnd.StartDate).getMonth();

        for (var month = 0; month < 12; month++, startMonth++) {
          monthArray.push({
            MonthName: Months[startMonth] + " " + _Year,
            val: _Year + startMonth.toString().padStart(2, "0")
          })
          if (startMonth == 11) {
            startMonth = -1;
            _Year++;
          }
        }
      }
    });
    return monthArray;
  }
  GetClassSubjectId(event) {
    this.ClassSubjectId = event;
    this.mattable._elementRef.nativeElement.style.backgroundColor = "";
    this.GetClassSubject(0);
  }

  View(element) {
    // //debugger;
    // this.ClassSubjectId = element.ClassSubjectId;
    // this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    // setTimeout(() => {
    //   this.classSubjectAdd.PageLoad();
    // }, 50);
  }

  addnew() {
    // this.ClassSubjectId = -1;
    // this.mattable._elementRef.nativeElement.style.backgroundColor = "grey";
    // setTimeout(() => {
    //   this.classSubjectAdd.PageLoad();
    // }, 50);
  }
  CopyFromPreviousBatch() {
    //console.log("here ", this.PreviousBatchId)
    this.PreviousBatchId = +this.tokenstorage.getPreviousBatchId();
    if (this.PreviousBatchId == -1)
      this.alert.info("Previous batch not defined.", this.optionsNoAutoClose);
    else
      this.GetClassSubject(1)
  }
  GetClassSubject(previousbatch) {
    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //debugger;
    this.loading = true;
    if (this.searchForm.get("searchClassId").value != 0)
      filterStr += "ClassId eq " + this.searchForm.get("searchClassId").value;
    else {
      this.loading = false;
      this.alert.error("Please select class/course", this.optionAutoClose);
      return;
    }

    if (previousbatch == 1)
      filterStr += ' and ' + this.StandardFilterWithPreviousBatchId;
    else
      filterStr += ' and ' + this.StandardFilterWithBatchId;

    if (filterStr.length == 0) {
      this.loading = false;
      this.alert.error("Please enter search criteria.", this.optionAutoClose);
      return;
    }

    let list: List = new List();
    list.fields = [
      'ClassSubjectId',
      'SubjectId',
      'ClassId',
      'Credits',
      'SubjectTypeId',
      'TeacherId',
      'Active',
    ];

    list.PageName = this.ClassSubjectListName;
    list.lookupFields = ["SubjectType($select=SelectHowMany)"];
    list.filter = [filterStr];
    this.ClassSubjectList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        let classSubjects = data.value.map(item => {

          return {
            ClassSubjectId: item.ClassSubjectId,
            SubjectId: item.SubjectId,
            SubjectTypeId: item.SubjectTypeId,
            ClassId: item.ClassId,
            Credits: item.Credits,
            TeacherId: item.TeacherId,
            SelectHowMany: item.SubjectType.SelectHowMany,
            Active: item.Active
          }
        })
        var filteredSubjects = [...this.Subjects];
        // if (this.searchForm.get("searchSubjectId").value > 0) {
        //   filteredSubjects = this.Subjects.filter(sf => sf.MasterDataId == this.searchForm.get("searchSubjectId").value)
        // }
        filteredSubjects.forEach(s => {
          //this.SubjectTypes.forEach(st => {

          let existing = classSubjects.filter(e => e.SubjectId == s.MasterDataId);
          if (existing.length > 0) {
            this.ClassSubjectList.push({
              ClassSubjectId: previousbatch==1?0:existing[0].ClassSubjectId,
              SubjectId: existing[0].SubjectId,
              SubjectName: this.Subjects.filter(c => c.MasterDataId == existing[0].SubjectId)[0].MasterDataName,
              SubjectTypeId: existing[0].SubjectTypeId,
              SelectHowMany: existing[0].SelectHowMany,
              TeacherId: existing[0].TeacherId,
              Credits: existing[0].Credits,
              ClassId: existing[0].ClassId,
              Active: previousbatch==1?0:existing[0].Active,
              Action: false
            });
          }
          else {

            this.ClassSubjectList.push({
              ClassSubjectId: 0,
              SubjectId: s.MasterDataId,
              SubjectTypeId: 0,
              SelectHowMany: 0,
              Credits: 0,
              ClassId: this.searchForm.get("searchClassId").value,
              SubjectName: s.MasterDataName,
              TeacherId: 0,
              Active: 0,
              Action: false
            });
          }
          //})
        })
        this.dataSource = new MatTableDataSource<IClassSubject>(this.ClassSubjectList);
        this.loading = false;
      });
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      //searchSubjectId: 0,

      //searchBatchId: this.SelectedBatchId
    });
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
    // let toupdate = {
    //   //ApplicationId:element.ApplicationId,      
    //   Active: element.Active == 1 ? 0 : 1
    // }
    // this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'patch')
    //   .subscribe(
    //     (data: any) => {
    //       // this.GetApplicationRoles();
    //       this.alert.success("Data updated successfully.", this.optionAutoClose);

    //     });
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
  updateSelectHowMany(row) {
    //debugger;
    row.SelectHowMany = this.SubjectTypes.filter(f => f.SubjectTypeId == row.SubjectTypeId)[0].SelectHowMany;
    row.Action = true;
  }
  SaveAll() {
    this.DataCountToSave = this.ClassSubjectList.length;
    var toUpdate = this.ClassSubjectList.filter(f => f.Action);
    toUpdate.forEach(row => {
      this.DataCountToSave--;
      this.UpdateOrSave(row);
    })
  }

  UpdateOrSave(row) {
    this.DataCountToSave = 0;
    //debugger;
    this.loading = true;
    if (row.SubjectTypeId == 0) {
      this.alert.error("Please select subject type.", this.optionsNoAutoClose);
      this.loading = false;
      return;
    }
    var selectedSubjectType = this.ClassSubjectList.filter(c => c.SubjectTypeId == row.SubjectTypeId);
    if (selectedSubjectType.length > row.SelectHowMany && row.SelectHowMany > 0) {
      this.alert.error("Allowed no. subjects selected is exceeded for this subject type.", this.optionsNoAutoClose);
      this.loading = false;
      return;
    }
    if (row.Credits > 100) {
      this.alert.error("Credits can not be greater than 100.", this.optionsNoAutoClose);
      this.loading = false;
      return;
    }
    ////console.log("row.TeacherId", row.TeacherId);
    if (row.TeacherId == 0) {
      this.alert.error("Please select teacher for the subject.", this.optionsNoAutoClose);
      this.loading = false;
      return;
    }
    let checkFilterString = "ClassId eq " + row.ClassId +
      " and SubjectId eq " + row.SubjectId + ' and Active eq 1 ';
    // " and Active eq " + row.Active +


    if (row.ClassSubjectId > 0)
      checkFilterString += " and ClassSubjectId ne " + row.ClassSubjectId;

    checkFilterString += ' and ' + this.StandardFilterWithBatchId;

    let list: List = new List();
    list.fields = ["ClassSubjectId"];
    list.PageName = this.ClassSubjectListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
          row.Ative = 0;
          return;
        }
        else {

          this.ClassSubjectData.Active = row.Active;
          this.ClassSubjectData.ClassSubjectId = row.ClassSubjectId;
          this.ClassSubjectData.ClassId = row.ClassId;
          this.ClassSubjectData.Credits = row.Credits;
          this.ClassSubjectData.SubjectId = row.SubjectId;
          this.ClassSubjectData.SubjectTypeId = row.SubjectTypeId;
          this.ClassSubjectData.TeacherId = row.TeacherId;
          this.ClassSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ClassSubjectData.BatchId = this.SelectedBatchId;
          if (this.ClassSubjectData.ClassSubjectId == 0) {
            this.ClassSubjectData["CreatedDate"] = new Date();
            this.ClassSubjectData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.ClassSubjectData["UpdatedDate"];
            delete this.ClassSubjectData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ClassSubjectData["CreatedDate"];
            delete this.ClassSubjectData["CreatedBy"];
            this.ClassSubjectData["UpdatedDate"] = new Date();
            this.ClassSubjectData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });

  }

  insert(row) {

    //console.log('this.ClassSubjectData', this.ClassSubjectData)
    //debugger;
    this.dataservice.postPatch('ClassSubjects', this.ClassSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {

          row.Action = false;
          row.ClassSubjectId = data.ClassSubjectId;
          if (this.DataCountToSave == 0) {
            this.loading = false;
            this.DataCountToSave = -1;
            this.alert.success("Data saved successfully.", this.optionAutoClose);
          }
        });
  }
  update(row) {

    this.dataservice.postPatch('ClassSubjects', this.ClassSubjectData, this.ClassSubjectData.ClassSubjectId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          if (this.DataCountToSave == 0) {
            this.loading = false;
            this.DataCountToSave = -1;
            this.alert.success("Data updated successfully.", this.optionAutoClose);
          }
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  GetSubjectTypes() {

    //var orgIdSearchstr = ' and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();

    list.fields = ["SubjectTypeId", "SubjectTypeName", "SelectHowMany"];
    list.PageName = "SubjectTypes";
    list.filter = [this.StandardFilterWithBatchId + " and Active eq 1 "];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.SubjectTypes = [...data.value];
        this.shareddata.ChangeSubjectTypes(this.SubjectTypes);

      })
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

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.WorkAccounts = this.getDropDownData(globalconstants.MasterDefinitions.employee.WORKACCOUNT);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));

        this.shareddata.ChangeSubjects(this.Subjects);
        this.shareddata.ChangeBatch(this.Batches);
        this.GetSubjectTypes();
        this.GetTeachers();

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
export interface IClassSubject {
  ClassSubjectId: number;
  ClassId: number;
  Credits: number;
  SubjectId: number;
  SubjectName: string;
  SubjectTypeId: number;
  SelectHowMany: number;
  TeacherId: number,
  Active;
  Action: false;
}
export interface ITeachers {
  TeacherId: number;
  TeacherName: string;
}
