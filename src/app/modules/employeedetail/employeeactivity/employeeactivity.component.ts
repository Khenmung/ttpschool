import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IStudent } from '../../ClassSubject/AssignStudentClass/Assignstudentclassdashboard.component';

@Component({
  selector: 'app-employeeactivity',
  templateUrl: './employeeactivity.component.html',
  styleUrls: ['./employeeactivity.component.scss']
})
export class EmployeeactivityComponent implements OnInit {
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
  SelectedApplicationId = 0;
  EmployeeId = 0;
  Permission = '';
  StandardFilter = '';
  loading = false;
  EmployeeActivityList: IEmployeeActivity[] = [];
  SelectedBatchId = 0;
  EmployeeActivityCategories = [];
  EmployeeActivitySubCategories = [];
  Classes = [];
  Batches = [];
  Employees: IEmployee[] = [];
  filteredOptions: Observable<IEmployee[]>;
  dataSource: MatTableDataSource<IEmployeeActivity>;
  allMasterData = [];

  EmployeeActivityData = {
    EmployeeActivityId: 0,
    Activity: '',
    EmployeeActivityCategoryId: 0,
    EmployeeActivitySubCategoryId: 0,
    ActivityDate: new Date(),
    EmployeeId: 0,
    Active: 0
  };
  EmployeeActivityForUpdate = [];
  displayedColumns = [
    "EmployeeActivityId",
    "EmployeeActivityCategoryId",
    "EmployeeActivitySubCategoryId",    
    "Activity",
    "ActivityDate",
    "Active",
    'Action'
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe: DatePipe,
  ) { }

  ngOnInit(): void {
    //debugger;
    // this.searchForm = this.fb.group({
    //   searchStudentName: [0]
    // });
    // this.filteredOptions = this.searchForm.get("searchStudentName").valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => typeof value === 'string' ? value : value.Name),
    //     map(Name => Name ? this._filter(Name) : this.Students.slice())
    //   );
    this.EmployeeId = this.tokenstorage.getEmployeeId();
    this.PageLoad();
  }
  private _filter(name: string): IEmployee[] {

    const filterValue = name.toLowerCase();
    return this.Employees.filter(option => option.Name.toLowerCase().includes(filterValue));

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
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.emp.employee.EMPLOYEEPROFILE)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.GetMasterData();
        if (this.Classes.length == 0) {
          this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
            this.Classes = [...data.value];

          });

        }

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
  AddNew() {
    var newItem = {
      EmployeeActivityId: 0,
      Activity: '',
      EmployeeActivityCategoryId: 0,
      EmployeeActivitySubCategoryId: 0,
      ActivityDate: new Date(),
      EmployeeId: 0,
      Active: 0,
      Action: false
    }
    this.EmployeeActivityList = [];
    this.EmployeeActivityList.push(newItem);
    this.dataSource = new MatTableDataSource(this.EmployeeActivityList);
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;
    let checkFilterString = "EmployeeActivityCategoryId eq " + row.EmployeeActivityCategoryId +
    " and EmployeeActivitySubCategoryId eq " + row.EmployeeActivitySubCategoryId;
    " and EmployeeId eq " + row.EmployeeId +     
    " and ActivityDate eq " + this.datepipe.transform(row.ActivityDate,'yyyy-MM-dd');


    if (row.EmployeeActivityId > 0)
      checkFilterString += " and EmployeeActivityId ne " + row.EmployeeActivityId;
    checkFilterString += " and " + this.StandardFilter;
    let list: List = new List();
    list.fields = ["EmployeeActivityId"];
    list.PageName = "EmployeeActivities";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          //this.shareddata.CurrentSelectedBatchId.subscribe(c => this.SelectedBatchId = c);
          this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
          this.EmployeeActivityForUpdate = [];;
          //console.log("inserting-1",this.EmployeeActivityForUpdate);
          this.EmployeeActivityForUpdate.push(
            {
              EmployeeActivityId: row.EmployeeActivityId,
              Activity: row.Activity,
              EmployeeActivityCategoryId: row.EmployeeActivityCategoryId,
              EmployeeActivitySubCategoryId: row.EmployeeActivitySubCategoryId,
              ActivityDate: row.ActivityDate,
              EmployeeId: this.EmployeeId,
              OrgId: this.LoginUserDetail[0]["orgId"],
              Active: row.Active
            });

          if (this.EmployeeActivityForUpdate[0].EmployeeActivityId == 0) {
            this.EmployeeActivityForUpdate[0]["CreatedDate"] = new Date();
            this.EmployeeActivityForUpdate[0]["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.EmployeeActivityForUpdate[0]["UpdatedDate"] = new Date();
            delete this.EmployeeActivityForUpdate[0]["UpdatedBy"];
            //delete this.EmployeeActivityForUpdate[0]["SubCategories"];
            //console.log("inserting2",this.EmployeeActivityForUpdate);
            this.insert(row, this.EmployeeActivityForUpdate[0]);
          }
          else {
            this.EmployeeActivityForUpdate[0]["CreatedDate"] = new Date(row.CreatedDate);
            this.EmployeeActivityForUpdate[0]["CreatedBy"] = row.CreatedBy;
            this.EmployeeActivityForUpdate[0]["UpdatedDate"] = new Date();
            //delete this.EmployeeActivityForUpdate[0]["EmployeeSubCategories"];
            delete this.EmployeeActivityForUpdate[0]["UpdatedBy"];
            //this.EmployeeActivityForUpdate[0]["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
            //this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row, toinsert) {
    //console.log("inserting",this.EmployeeActivityForUpdate);

    //debugger;
    this.dataservice.postPatch('EmployeeActivities', toinsert, 0, 'post')
      .subscribe(
        (data: any) => {
          row.EmployeeActivityId = data.EmployeeActivityId;
          row.Action = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
          this.loadingFalse()
          this.GetEmployeeActivity();
        });
  }
  update(row) {
    //console.log("updating",this.EmployeeActivityForUpdate);
    this.dataservice.postPatch('EmployeeActivities', this.EmployeeActivityForUpdate[0], this.EmployeeActivityForUpdate[0].EmployeeActivityId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
          this.loadingFalse();
        });
  }
  GetEmployeeActivity() {
    //debugger;
    this.loading = true;
    //this.shareddata.CurrentSelectedBatchId.subscribe(b => this.SelectedBatchId = b);
    this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
    let filterStr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    filterStr += ' and EmployeeId eq ' + this.EmployeeId
    let list: List = new List();
    list.fields = [
      'EmployeeActivityId',
      'EmployeeId',
      'EmployeeActivityCategoryId',
      'EmployeeActivitySubCategoryId',
      'Activity',
      'ActivityDate',
      'Remarks',
      'Active'
    ];

    list.PageName = "EmployeeActivities";
    list.lookupFields = ["Employee($select=FirstName,LastName,EmployeeCode)"];
    list.filter = [filterStr];
    this.EmployeeActivityList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.EmployeeActivityList = data.value.map(item => {
            return {
              EmployeeActivityId: item.EmployeeActivityId,
              EmployeeId: item.EmployeeId,
              Activity: item.Activity,
              EmployeeActivityCategoryId: item.EmployeeActivityCategoryId,
              ActivitySubCategory: this.allMasterData.filter(f => f.ParentId == item.EmployeeActivityCategoryId),
              EmployeeActivitySubCategoryId: item.EmployeeActivitySubCategoryId,
              ActivityDate: item.ActivityDate,
              Remark: item.Remarks,
              Active: item.Active,
              Action: false
            }
          })
        }

        //console.log('EmployeeActivity', this.EmployeeActivityList)
        this.dataSource = new MatTableDataSource<IEmployeeActivity>(this.EmployeeActivityList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.EmployeeActivityCategories = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEPROFILECATEGORY);
        //this.EmployeeActivitySubCategories = this.getDropDownData(globalconstants.MasterDefinitions.employee.EMPLOYEEACTIVITYSUBCATEGORY);
        this.GetEmployees();
        this.GetEmployeeActivity();
      });
  }
  onBlur(row) {
    row.Action = true;
  }
  CategoryChanged(row) {
    debugger;
    row.Action = true;
    //row.SubCategories = this.Categories.filter(f=>f.MasterDataId == row.CategoryId);
    var item = this.EmployeeActivityList.filter(f => f.EmployeeActivityId == row.EmployeeActivityId);
    //item[0].SubCategories = this.allMasterData.filter(f => f.ParentId == row.CategoryId);

    ////console.log("dat", this.EmployeeActivityList);
    this.dataSource = new MatTableDataSource(this.EmployeeActivityList);


  }
  UpdateActive(row, event) {
    row.Active = event.checked ? 1 : 0;
    row.Action = true;
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
  GetEmployees() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["EmpEmployeeId", "EmployeeCode", "FirstName", "LastName", "ContactNo"];
    list.PageName = "EmpEmployees";
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Employees = data.value.map(Employee => {

            var _name = Employee.FirstName + " " + Employee.LastName;
            var _fullDescription = _name + "-" + Employee.ContactNo;
            return {
              EmployeeId: Employee.EmpEmployeeId,
              EmployeeCode: Employee.EmployeeCode,
              Name: _fullDescription
            }
          })
        }
        this.loading = false;
      })
  }
}
export interface IEmployeeActivity {
  EmployeeActivityId: number;
  Activity: string;
  EmployeeActivityCategoryId: number;
  EmployeeActivitySubCategoryId: number;
  ActivityDate: Date;
  EmployeeId: number;
  Active: number;
  Action: boolean;
}
export interface IEmployee {
  EmployeeId: number;
  EmployeeCode: number;
  Name: string;
}



