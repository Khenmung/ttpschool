import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { _ } from 'ag-grid-community';
import { evaluate } from 'mathjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { TableUtil } from '../../../shared/TableUtil';

@Component({
  selector: 'app-getreport',
  templateUrl: './getreport.component.html',
  styleUrls: ['./getreport.component.scss']
})
export class GetreportComponent implements OnInit {

  @ViewChild("table") tableRef: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  BaseReportId = 0;
  ParentId = 0;
  Permission = '';
  DisplayColumns = [];
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
  ColumnsOfSelectedReports = [];
  StandardFilterWithBatchId = '';
  loading = false;
  ReportName = '';
  searchCondition1;
  searchConditionText = [];
  AvailableReportNames = [];
  MyAppReportNames = [];
  Applications = [];
  ReportNames = [];
  ReportConfigItemListName = "ReportConfigItems";

  ReportConfigItemList = [];
  dataSource: MatTableDataSource<IReportConfigItem>;
  allMasterData = [];
  PagePermission = '';
  FilterColumns = [];
  FilterConditions = [];
  FilterCriteria = [];
  ReportConfigItemData = {
    ReportConfigItemId: 0,
    ReportName: '',
    DisplayName: '',
    ParentId: 0,
    Formula: '',
    ColumnSequence: 0,
    ApplicationId: 0,
    TableNames: '',
    OrgId: 0,
    UserId: '',
    Active: 0
  };
  ApplicationName = '';
  searchForm: FormGroup;
  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private nav: Router,
    private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchApplicationId: [0],
      searchReportName: [0],
      searchFilterColumn: [0],
      searchCondition: [''],
      searchCriteria: [''],
      //searchConditionText:['']

    });
    this.FilterConditions = [
      { "text": "equal", "val": "eq" },
      { "text": "greater than", "val": "gt" },
      { "text": "less than", "val": "lt" },
      { "text": "greater than n equal", "val": "ge" },
      { "text": "less than n equal", "val": "le" },
      { "text": "like", "val": "substringof" }
    ];
    this.dataSource = new MatTableDataSource([]);
    this.Applications = this.tokenstorage.getPermittedApplications();

  }

  applyFilter(filterValue) {
    debugger;
    if (filterValue.target.value)
      return;

    var filterstr = filterValue.target.value.trim();
    filterstr = filterstr.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterstr;
  }


  PageLoad() {
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    this.ApplicationName = this.LoginUserDetail[0]["org"];

    this.GetBaseReportId();
  }
  updateActive(row, value) {
    debugger;
    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }

  UpdateOrSave(row) {

    //debugger;
    var AvailableReportId = this.searchForm.get("searchAvailableReportName").value;
    var ApplicationId = this.searchForm.get("searchApplicationId").value;
    var MyReportNameId = this.searchForm.get("searchReportName").value;
    if (ApplicationId == 0) {
      this.alert.error("Please select application name", this.optionAutoClose);
      return;
    }
    if (AvailableReportId == 0) {
      this.alert.error("Please select available report name", this.optionAutoClose);
      return;
    }
    if (MyReportNameId == 0) {
      this.alert.error("Please select my report name", this.optionAutoClose);
      return;
    }

    this.loading = true;
    let checkFilterString = "ReportName eq '" + row.ReportName + "'" +
      " and ApplicationId eq " + row.ApplicationId + " and OrgId eq " + this.LoginUserDetail[0]["orgId"] +
      " and ParentId eq " + MyReportNameId;

    if (row.ReportConfigItemId > 0)
      checkFilterString += " and ReportConfigItemId ne " + row.ReportConfigItemId;

    this.loading = true;
    let list: List = new List();
    list.fields = ["*"];
    list.PageName = this.ReportConfigItemListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {

          this.ReportConfigItemData.ReportConfigItemId = row.ReportConfigItemId;
          this.ReportConfigItemData.ApplicationId = row.ApplicationId;
          this.ReportConfigItemData.DisplayName = row.DisplayName;
          this.ReportConfigItemData.ColumnSequence = row.ColumnSequence;
          this.ReportConfigItemData.Formula = row.Formula;
          this.ReportConfigItemData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.ReportConfigItemData.ParentId = MyReportNameId;
          this.ReportConfigItemData.UserId = row.UserId;
          this.ReportConfigItemData.Active = row.Active;
          this.ReportConfigItemData.ReportName = row.ReportName;
          this.ReportConfigItemData.TableNames = row.TableNames;

          //console.log('data', this.ReportConfigItemData);

          if (this.ReportConfigItemData.ReportConfigItemId == 0) {
            this.ReportConfigItemData["CreatedDate"] = new Date();
            this.ReportConfigItemData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.ReportConfigItemData["UpdatedDate"] = new Date();
            delete this.ReportConfigItemData["UpdatedBy"];
            this.insert(row);
          }
          else {
            delete this.ReportConfigItemData["CreatedDate"];
            delete this.ReportConfigItemData["CreatedBy"];
            this.ReportConfigItemData["UpdatedDate"] = new Date();
            this.ReportConfigItemData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.ReportConfigItemListName, this.ReportConfigItemData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.ReportConfigItemId = data.ReportConfigItemId;
          row.Action = false;
          this.loading = false;
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.ReportConfigItemListName, this.ReportConfigItemData, this.ReportConfigItemData.ReportConfigItemId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  ReSequence(editedrow) {
    //debugger;
    var diff = 0;
    if (editedrow.Sequence != editedrow.OldSequence) {

      if (editedrow.Sequence > editedrow.OldSequence) {
        var filteredData = this.ReportConfigItemList.filter(currentrow => currentrow.MasterDataId != editedrow.MasterDataId
          && currentrow.Sequence > editedrow.OldSequence
          && currentrow.Sequence <= editedrow.Sequence)

        filteredData.forEach(currentrow => {

          currentrow.Sequence -= 1;
          currentrow.OldSequence -= 1;
          currentrow.Action = true;

        });
      }
      else if (editedrow.Sequence < editedrow.OldSequence) {
        var filteredData = this.ReportConfigItemList.filter(currentrow => currentrow.MasterDataId != editedrow.MasterDataId
          && currentrow.Sequence >= editedrow.Sequence
          && currentrow.Sequence < editedrow.OldSequence)

        filteredData.forEach(currentrow => {
          currentrow.Sequence += 1;
          currentrow.OldSequence += 1;
          currentrow.Action = true;
        })
      }
      editedrow.Action = true;
      editedrow.OldSequence = editedrow.Sequence;
      this.ReportConfigItemList.sort((a, b) => a.Sequence - b.Sequence);
      this.dataSource = new MatTableDataSource<IReportConfigItem>(this.ReportConfigItemList);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }
  get f() {
    return this.searchForm.controls;
  }

  GetBaseReportId() {

    let list: List = new List();
    list.fields = [
      "ReportConfigItemId"
    ]
    list.PageName = this.ReportConfigItemListName;
    list.filter = ["Active eq 1 and ReportName eq 'Reports' and OrgId eq 0"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.BaseReportId = data.value[0].ReportConfigItemId;
          this.GetReportNames();
        }
        else {
          this.alert.error("Base report Id not found!", this.optionAutoClose);
        }
        this.loading = false;
      });
  }
  GetReportNames() {

    let list: List = new List();
    list.fields = [
      "ReportConfigItemId",
      "ReportName",
      "DisplayName",
      "ParentId",
      "ApplicationId",
      "TableNames",
      "OrgId",
      "UserId",
      "Active"]
    list.PageName = this.ReportConfigItemListName;
    list.filter = ["Active eq 1 and (ParentId eq " + this.BaseReportId +
      " or OrgId eq 0 or OrgId eq " + this.LoginUserDetail[0]["orgId"] + ")"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ReportNames = [...data.value];
        this.loading = false;
      });
  }
  GetMyReportNames() {
    debugger;
    this.ReportConfigItemList = [];
    this.AvailableReportNames = this.ReportNames.filter(a => a.ApplicationId == this.searchForm.get("searchApplicationId").value
      && a.ParentId == this.BaseReportId);

    this.AvailableReportNames.forEach(r => {
      var temp = this.ReportNames.filter(p => p.ParentId == r.ReportConfigItemId && p.OrgId != 0)
      if (temp.length > 0) {
        temp.forEach(report => {
          this.MyAppReportNames.push(report)
        });
      }
    })
  }
  GetFilterColumn() {
    this.FilterColumns = this.ReportNames.filter(f => f.ParentId == this.searchForm.get("searchReportName").value);
  }
  getSelectedReportColumn() {

    debugger;
    var MyReportNameId = this.searchForm.get("searchReportName").value;

    if (MyReportNameId == 0) {
      this.alert.error("Please select report name", this.optionAutoClose);
      return;
    }

    let list: List = new List();
    list.fields = [
      "ReportConfigItemId",
      "ReportName",
      "DisplayName",
      "Formula",
      "ParentId",
      "ApplicationId",
      "ColumnSequence",
      "TableNames",
      "OrgId",
      "UserId",
      "Active"]
    list.PageName = this.ReportConfigItemListName;
    list.filter = ["Active eq 1 and ParentId eq " + MyReportNameId];

    this.dataservice.get(list)
      .subscribe((data: any) => {

        var SelectedReport = this.MyAppReportNames.filter(m => m.ReportConfigItemId == MyReportNameId);
        var _ParentId = 0;
        if (SelectedReport.length > 0) {
          this.ReportName = SelectedReport[0].ReportName;
          // to get table name of parent report;
          _ParentId = SelectedReport[0].ParentId;
        }

        var _tableNames = this.AvailableReportNames.filter(m => m.ReportConfigItemId == _ParentId)[0].TableNames.split(',');
        //var _baseColumns = this.ReportNames.filter(f=>f.ParentId == _ParentId && f.OrgId ==0)
        this.ColumnsOfSelectedReports = [...data.value];

        var list = new List();
        list.PageName = _tableNames[0];

        if (_tableNames.length == 0) {
          this.alert.error("Table name not present!", this.optionsNoAutoClose);
          return;
        }

        //lookup fields generation
        list.PageName = _tableNames[0];
        list.lookupFields = [];
        for (var i = 1; i < _tableNames.length; i++) {
          list.lookupFields.push(_tableNames[i])
        }

        // filter whose tablenames column not contains 1
        var fitleredNestedColumns = this.ColumnsOfSelectedReports.filter(f => f.TableNames != '1');
        list.fields = fitleredNestedColumns.map(m => {
          return m.ReportName;
        });

        console.log("");

        var filter = this.FilterCriteria.join(" and ")
        if (filter.length > 0)
          filter += " and ";
        console.log('filter str', filter);

        list.filter = [filter + "OrgId eq " + this.LoginUserDetail[0]["orgId"]];

        // this.FilterCriteria.forEach(f=>{
        //   list.filter.push(f);
        // })

        this.dataservice.get(list)
          .subscribe((data: any) => {
            var result = [...data.value];
            console.log('retus', result);
            if (result.length == 0) {
              this.alert.info("No record found.", this.optionAutoClose);
            }

            //var whereDisplayNameNotEmpty = this.ColumnsOfSelectedReports.filter(f => f.DisplayName.length > 0)
            var colTem = [];
            var testval = '';
            this.ColumnsOfSelectedReports.forEach(c => {
              if (c.DisplayName == null || c.DisplayName.length == 0)
                c.DisplayName = c.ReportName;

              this.ReportConfigItemList = result.map(m => {
                //testval = evaluate(m +".StudentClasses[0].RollNo")
                m[c.DisplayName] = this.traverse_it(m, c.ReportName)
                // if (m[c.ReportName] === undefined)
                //   m[c.DisplayName] = this.getnestedData(m, c.ReportName)
                // else
                //   m[c.DisplayName] = m[c.ReportName];
                var coldata = { "col": c.DisplayName, "sequence": c.ColumnSequence };
                //console.log("coldasta",coldata)
                if (!this.ItemExists(colTem, c.DisplayName))
                  colTem.push(coldata)
                return m;
              })
            })
            this.DisplayColumns = colTem.sort((a, b) => {
              return a.sequence - b.sequence;
            }).map(m => {
              return m.col
            });

            this.dataSource = new MatTableDataSource(this.ReportConfigItemList);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;

          })
        this.loading = false;
      });
  }
  traverse_it(obj, colName) {
    var result = '';
    for (var prop in obj) {
      if(Array.isArray(obj[prop])) {
        for (var i = 0; i < obj[prop].length; i++)
          this.traverse_it(obj[prop][i], colName);
      }
      else if(typeof obj[prop] === 'object') {
               
        this.traverse_it(obj[prop], colName);
      }
      else if (obj[colName] !== undefined) {
        result = obj[colName];
      }
    }
    return result;
  }

  ItemExists(obj, colname) {
    return obj.some((el) => {
      return el.col === colname;
    });
  }
  AddSearchFilter() {
    var columnName = this.searchForm.get("searchFilterColumn").value;
    var condition = this.searchForm.get("searchCondition").value;
    var value = this.searchForm.get("searchCriteria").value;

    var filtertext = columnName + " " + condition + " '" + value + "'";
    this.FilterCriteria.push(filtertext);

  }
  RemoveSearchFilter() {
    debugger;
    console.log('dd', this.searchCondition1);
  }
  onNgModelChange(event) {
    debugger;
    this.searchCondition1 = event.option[0].value;
    console.log('dd', this.searchCondition1);
  }
  ExportToExcel() {
    const datatoExport: Partial<any>[] = [...this.ReportConfigItemList];
    TableUtil.exportArrayToExcel(datatoExport, this.ReportName);
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
export interface IReportConfigItem {
  ReportConfigItemId: number;
  ReportName: string;
  DisplayName: string;
  ParentId: number;
  Formula: string;
  ColumnSequence: number;
  ApplicationId: number;
  TableNames: string;
  OrgId: number;
  UserId: string;
  Active: number;
  CreatedBy: string;
  CreatedDate: Date;
  UpdatedBy: string;
  UpdatedDate: Date;

}







