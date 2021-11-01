import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PageDetail } from '../content';
import { globalconstants } from './globalconstant';
import { NaomitsuService } from './databaseService';
import { List } from './interface';
import { SharedataService } from './sharedata.service';
import { TokenStorageService } from '../_services/token-storage.service';
@Injectable({
  providedIn: 'root'
})
export class ContentService {

  url: any;
  constructor(
    private tokenService: TokenStorageService,
    private http: HttpClient,
    private dataservice: NaomitsuService,
    private shareddata: SharedataService) { }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  AddUpdateContent(pagecontent: any) {
    ////debugger  
    this.url = globalconstants.apiUrl + '/odata/Pages';
    //this.url ="/odata/Pages"; 
    return this.http.post(this.url, pagecontent);
  }
  GetEmployeeVariable() {
    let list = new List();
    list.fields = globalconstants.MasterDefinitions.EmployeeVariableName;
    list.PageName = "EmpEmployees";
    return this.dataservice.get(list);
  }
  GetClasses(orgId) {
    let list = new List();
    list.fields = ["*"];
    list.filter = ["Active eq 1 and OrgId eq " + orgId];
    list.PageName = "ClassMasters";
    return this.dataservice.get(list);
  }
  GetGrades(orgId) {
    let list = new List();
    list.fields = ["*"];
    list.filter = ["Active eq 1 and OrgId eq " + orgId];
    list.PageName = "EmpEmployeeGradeSalHistories";
    return this.dataservice.get(list);
  }
  getMasterText(arr, itemId) {
    var filtered = arr.filter(f => f.MasterDataId == itemId);
    if (filtered.length > 0)
      return filtered[0].MasterDataName;
    else
      return '';
  }
  GetSessionFormattedMonths() {
    var _sessionStartEnd = {
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
    debugger;
    _sessionStartEnd = JSON.parse(this.tokenService.getSelectedBatchStartEnd());

    var _StartYear = new Date(_sessionStartEnd["StartDate"]).getFullYear();
    var _EndYear = new Date(_sessionStartEnd["EndDate"]).getFullYear();
    var startMonth = new Date(_sessionStartEnd["StartDate"]).getMonth() + 1;

    for (var month = 0; month < 12; month++, startMonth++) {
      monthArray.push({
        MonthName: Months[startMonth] + " " + _StartYear,
        val: parseInt(_StartYear + startMonth.toString().padStart(2, "0"))
      })
      if (startMonth == 11) {
        startMonth = -1;
        _StartYear = _EndYear;
      }
    }
    return monthArray;
  }
  getDropDownData(obj, dropdowntype, appId) {
    let Id = 0;
    let Ids = obj.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase() && item.ApplicationId == appId;

    })
    if (Ids.length > 0) {
      Id = Ids[0].MasterDataId;
      return obj.filter((item, index) => {
        return item.ParentId == Id
      })
    }
    else
      return [];

  }
  Getcontent(title: string, query: string) {
    //debugger
    this.url = globalconstants.apiUrl + '/odata/' + title + '?' + query;
    //this.url = '/odata/' +title + '?' + query;  
    //console.log(this.url);
    return this.http.get(this.url);//.map(res=>res.json());
    //.pipe(map((res:Response) => res.json()));
    // .pipe(map((res:any)=>{
    //   var data = res.json();
    //   return new (data.PageId, data.PageHeader, data.PageType.PageName,data.Version);
  }

  GetPageTypes() {
    ////debugger  
    this.url = globalconstants.apiUrl + '/odata/PageTypes?$filter=Active eq true';
    //this.url = '/odata/PageTypes?$filter=Active eq true';  
    //var filter = ''
    return this.http.get(this.url);
  }
  GetcontentLatest(pageGroupId: number, pageName: string) {
    //debugger
    let filter = "PageName eq '" + pageName + "' and PageNameId eq " + pageGroupId;
    this.url = globalconstants.apiUrl + '/odata/Pages?$select=PageId,Version&$orderby=Version desc&$top=1&$filter=' + filter;
    //this.url = '/odata/Pages?$select=PageId,Version&$orderby=Version desc&$top=1&$filter=' + filter;  
    return this.http.get(this.url);
  }
  GetcontentById(Id: number) {
    //debugger
    this.url = globalconstants.apiUrl + '/odata/Pages?$filter=PageId eq ' + Id;
    //this.url = '/odata/Pages?$filter=PageId eq ' + Id;  
    return this.http.get(this.url);
  }

  UpdatecontentById(body: PageDetail, key: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    //headers=headers.append('Access-Control-Allow-Origin', '*')  
    this.url = globalconstants.apiUrl + '/odata/Pages/(' + key + ')';
    //this.url = '/odata/Pages/(' + key +')';  
    return this.http.patch(this.url, body, httpOptions)
  }
}
