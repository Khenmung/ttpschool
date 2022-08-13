import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-school-fee-types',
  templateUrl: './school-fee-types.component.html',
  styleUrls: ['./school-fee-types.component.scss']
})
export class SchoolFeeTypesComponent implements OnInit {
  PageLoading = true;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  FeeTypeListName = 'SchoolFeeTypes';
  Applications = [];
  loading = false;
  FeeTypeList: IFeeType[] = [];
  filteredOptions: Observable<IFeeType[]>;
  dataSource: MatTableDataSource<IFeeType>;
  Permission = 'deny';
  SelectedBatchId = 0;
  allMasterData = [];
  FeeCategories = [];
  FeeTypeData = {
    FeeTypeId: 0,
    FeeTypeName: '',
    Description: '',
    Formula: '',
    DefaultType: 0,
    Active: 0,
    OrgId: 0,
    BatchId: 0
  };
  displayedColumns = [
    'FeeTypeId',
    'FeeTypeName',
    'Description',
    'Formula',
    'DefaultType',
    'Active',
    'Action'
  ];
  Students = [];
  SelectedApplicationId = 0;
  searchForm: UntypedFormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchFeeTypeName: ['']
    });
    this.PageLoad();
  }

  PageLoad() {
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.CLASSCOURSE.FEETYPE);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      if (this.Permission == 'deny') {
        //this.nav.navigate(['/edu']);
      }
      else {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.GetMasterData();
        this.GetStudents();
        this.loading = false; this.PageLoading = false;
      }
    }
  }
  AddNew() {
    var newdata = {
      FeeTypeId: 0,
      FeeTypeName: '',
      Description: '',
      Formula: '',
      FeeCategory:'',
      FeeSubCategory:'',
      DefaultType: 0,
      Active: 0,
      Action: true
    };
    this.FeeTypeList = [];
    this.FeeTypeList.push(newdata);
    this.dataSource = new MatTableDataSource<IFeeType>(this.FeeTypeList);
  }
  GetStudents() {

    let list: List = new List();
    list.fields = [
      'PID',
      'StudentId',
      'FirstName',
      'LastName'
    ];

    list.PageName = "Students";
    //list.lookupFields = ["Student"]
    list.filter = ['Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.Students = data.value.map(student => {
            var _lastName = student.LastName == '' ? '' : '-' + student.LastName;
            return {
              StudentId: student.StudentId,
              Name: student.PID + '-' + student.FirstName + _lastName
            }
          })
        }
        this.loading = false; this.PageLoading = false;
      })
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  updateDefaultType(row, value) {
    row.Action = true;
    row.DefaultType = value.checked ? 1 : 0;
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    let checkFilterString = "OrgId eq " + this.LoginUserDetail[0]["orgId"] + " and FeeTypeName eq '" + row.FeeTypeName + "'";

    if (row.FeeTypeId > 0)
      checkFilterString += " and FeeTypeId ne " + row.FeeTypeId;
    let list: List = new List();
    list.fields = ["FeeTypeId"];
    list.PageName = this.FeeTypeListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {

          this.FeeTypeData.FeeTypeId = row.FeeTypeId;
          this.FeeTypeData.FeeTypeName = row.FeeTypeName;
          this.FeeTypeData.Active = row.Active;
          this.FeeTypeData.Description = row.Description;
          this.FeeTypeData.Formula = row.Formula;
          this.FeeTypeData.DefaultType = row.DefaultType;
          this.FeeTypeData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.FeeTypeData.BatchId = this.SelectedBatchId;
          if (this.FeeTypeData.FeeTypeId == 0) {
            this.FeeTypeData["CreatedDate"] = new Date();
            this.FeeTypeData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.FeeTypeData["UpdatedDate"] = new Date();
            delete this.FeeTypeData["UpdatedBy"];
            ////console.log('exam slot', this.SlotNClassSubjectData)
            this.insert(row);
          }
          else {
            delete this.FeeTypeData["CreatedDate"];
            delete this.FeeTypeData["CreatedBy"];
            this.FeeTypeData["UpdatedDate"] = new Date();
            this.FeeTypeData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      }
      );
  }
  loadingFalse() {
    this.loading = false; this.PageLoading = false;
  }
  insert(row) {

    debugger;
    this.dataservice.postPatch(this.FeeTypeListName, this.FeeTypeData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.FeeTypeId = data.FeeTypeId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.GetFeeTypes();
          this.loadingFalse()

        },
        err => {
          this.loading = false; 
          this.PageLoading = false;
          if (err.error) {
            var modelState = err.error.Errors;
            if (modelState == undefined)
              modelState = err.error.errors;
            var errorMessage = '';
            //THE CODE BLOCK below IS IMPORTANT WHEN EXTRACTING MODEL STATE IN JQUERY/JAVASCRIPT
            for (var key in modelState) {
              if (modelState.hasOwnProperty(key)) {
                errorMessage += (errorMessage == "" ? "" : errorMessage + "<br/>") + modelState[key];
              }
            }
            this.contentservice.openSnackBar(errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
          }
        });
  }
  update(row) {

    this.dataservice.postPatch(this.FeeTypeListName, this.FeeTypeData, this.FeeTypeData.FeeTypeId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.CreateInvoice();
        },
        err => {
          this.loading=false;
          if (err.error) {
            var modelState = err.error.Errors;
            if (modelState == undefined)
              modelState = err.error.errors;
            var errorMessage = '';
            //THE CODE BLOCK below IS IMPORTANT WHEN EXTRACTING MODEL STATE IN JQUERY/JAVASCRIPT
            for (var key in modelState) {
              if (modelState.hasOwnProperty(key)) {
                errorMessage += (errorMessage == "" ? "" : errorMessage + "<br/>") + modelState[key];
              }
            }
            this.contentservice.openSnackBar(errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
          }
        });
  }
  CreateInvoice() {
    debugger;
    this.loading = true;
    this.contentservice.GetClassFeeWithFeeDefinition(this.LoginUserDetail[0]["orgId"], 0, this.SelectedBatchId)
      .subscribe((datacls: any) => {

        var _clsfeeWithDefinitions = datacls.value.filter(m => m.FeeDefinition.Active == 1);

        this.contentservice.getStudentClassWithFeeType(this.LoginUserDetail[0]["orgId"], this.SelectedBatchId,0)
          .subscribe((data: any) => {
            var studentfeedetail = [];
            data.value.forEach(studcls => {
              var _feeName = '';
              var objClassFee = _clsfeeWithDefinitions.filter(def => def.ClassId == studcls.ClassId);
              objClassFee.forEach(clsfee => {
                var _category = '';
                var _subCategory = '';

                var objcat = this.FeeCategories.filter(f => f.MasterDataId == clsfee.FeeDefinition.FeeCategoryId);
                if (objcat.length > 0)
                  _category = objcat[0].MasterDataName;

                var objsubcat = this.FeeCategories.filter(f => f.MasterDataId == clsfee.FeeDefinition.FeeSubCategoryId);
                if (objsubcat.length > 0)
                  _subCategory = objsubcat[0].MasterDataName;

                var _formula = studcls.FeeType.Active == 1 ? studcls.FeeType.Formula : '';

                if (_formula.length > 0) {
                  _feeName = clsfee.FeeDefinition.FeeName;
                  studentfeedetail.push({
                    Month: clsfee.Month,
                    Amount: clsfee.Amount,
                    Formula: _formula,
                    FeeName: _feeName,
                    StudentClassId: studcls.StudentClassId,
                    FeeCategory: _category,
                    FeeSubCategory: _subCategory,
                    FeeTypeId: studcls.FeeTypeId,
                    SectionId: studcls.SectionId,
                    RollNo: studcls.RollNo
                  });
                }

              })
            })
            // console.log("studentfeedetailxxxx",studentfeedetail)
            this.contentservice.createInvoice(studentfeedetail, this.SelectedBatchId, this.LoginUserDetail[0]["orgId"])
              .subscribe((data: any) => {
                this.loading = false;
                this.contentservice.openSnackBar("Invoice created successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
              },
                error => {
                  this.loading = false;
                  console.log("create invoice error", error);
                  this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
                })
          })
      });

  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY)
        this.loading = false; this.PageLoading = false;
      });
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenstorage, this.allMasterData);
  }
  GetFeeTypes() {
    //debugger;
    // if (this.searchForm.get("searchFeeTypeName").value.length < 3)
    // {
    //   this.contentservice.openSnackBar("Please enter atleast 3 characters.",this.optionAutoClose);
    //   return;
    // }  
    this.loading = true;
    let filterStr = "OrgId eq " + this.LoginUserDetail[0]["orgId"];// 'BatchId eq '+ this.SelectedBatchId;
    if (this.searchForm.get("searchFeeTypeName").value.length != 0)
      filterStr += " and contains(FeeTypeName,'" + this.searchForm.get("searchFeeTypeName").value + "')";


    let list: List = new List();
    list.fields = [
      'FeeTypeId',
      'FeeTypeName',
      'Description',
      'Formula',
      'DefaultType',
      'Active'
    ];

    list.PageName = this.FeeTypeListName;
    list.filter = [filterStr];
    this.FeeTypeList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          this.FeeTypeList = [...data.value];
        }
        else {
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.dataSource = new MatTableDataSource<IFeeType>(this.FeeTypeList);
        this.loadingFalse();

      });

  }

  // getDropDownData(dropdowntype) {
  //   let Id = 0;
  //   let Ids = this.allMasterData.filter((item, indx) => {
  //     return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
  //   })
  //   if (Ids.length > 0) {
  //     Id = Ids[0].MasterDataId;
  //     return this.allMasterData.filter((item, index) => {
  //       return item.ParentId == Id
  //     })
  //   }
  //   else
  //     return [];

  // }
}
export interface IFeeType {
  FeeTypeId: number;
  FeeTypeName: string;
  Description: string;
  Formula: string;
  FeeCategory:string;
  FeeSubCategory:string;
  Active: number;
  Action: boolean;
}
