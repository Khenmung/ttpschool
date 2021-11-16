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
export class ContentService implements OnInit {
  RoleFilter = '';
  Roles = [];
  allMasterData = [];
  Applications = [];
  UserDetail = [];
  url: any;
  constructor(
    private tokenService: TokenStorageService,
    private http: HttpClient,
    private dataservice: NaomitsuService,
    private shareddata: SharedataService) { }
  ngOnInit(): void {
    //debugger;
    //this.UserDetail = this.tokenService.getUserDetail();
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
  // getDropDownData(obj, dropdowntype, appId) {
  //   let Id = 0;
  //   let Ids = obj.filter((item, indx) => {
  //     return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase() && item.ApplicationId == appId;

  //   })
  //   if (Ids.length > 0) {
  //     Id = Ids[0].MasterDataId;
  //     return obj.filter((item, index) => {
  //       return item.ParentId == Id
  //     })
  //   }
  //   else
  //     return [];

  // }
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
  GetApplicationRoleUser(userdetail) {
    this.UserDetail =[...userdetail];
    let list: List = new List();
    list.fields = [
      'UserId',
      'RoleId',
      'OrgId',
      'Active'
    ];

    list.PageName = "RoleUsers";
    list.lookupFields = ["Org($select=OrganizationId,OrganizationName,LogoPath,Active)"];

    list.filter = ["Active eq 1 and UserId eq '" + userdetail[0]["userId"] + "'"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //console.log("data", data)
        if (data.value.length > 0) {
          if (data.value[0].Org.Active == 1)
            this.GetMasterData(data.value);
          else {
            console.log("User's Organization not active!, Please contact your administrator!");
          }
        }
      })
  }

  private GetMasterData(UserRole) {
    //debugger;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "Description", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["Active eq 1 and (ParentId eq 0 or OrgId eq 0 or OrgId eq " + localStorage.getItem("orgId") + ")"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        //this.shareddata.ChangeMasterData(data.value);
        this.allMasterData = [...data.value];

        this.Applications = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.bang);

        this.Roles = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.ROLE);
  
        this.RoleFilter = ' and (RoleId eq 0';
        var __organization = '';
        if (UserRole[0].OrgId != null)
          __organization = UserRole[0].Org.OrganizationName;

        this.UserDetail[0]["RoleUsers"] =
          UserRole.map(roleuser => {
            if (roleuser.Active == 1 && roleuser.RoleId != null) {
              this.RoleFilter += ' or RoleId eq ' + roleuser.RoleId
              var _role = '';
              if (this.Roles.length > 0 && roleuser.RoleId != null)
                _role = this.Roles.filter(a => a.MasterDataId == roleuser.RoleId)[0].MasterDataName;
              return {
                roleId: roleuser.RoleId,
                role: _role,
              }
            }
            else
              return false;
          })


        //login detail is save even though roles are not defined.
        //so that user can continue their settings.
        this.tokenService.saveUserdetail(this.UserDetail);
        if (this.RoleFilter.length > 0)
          this.RoleFilter += ')';
        this.tokenService.saveCheckEqualBatchId
        this.GetApplicationRolesPermission();
      }, error => {
        this.tokenService.signOut();
      });
  }

  private GetApplicationRolesPermission() {

    let list: List = new List();
    list.fields = [
      'ApplicationFeatureId',
      'RoleId',
      'PermissionId'
    ];

    list.PageName = "ApplicationFeatureRolesPerms";
    list.lookupFields = ["ApplicationFeature($select=PageTitle,label,link,faIcon,ApplicationId,ParentId)"]
    list.filter = ["Active eq 1 " + this.RoleFilter];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          var _applicationName = '';
          var _appShortName = '';
          this.UserDetail[0]["applicationRolePermission"] = [];
          data.value.forEach(item => {
            _applicationName = '';
            _appShortName = '';
            _applicationName = this.Applications.filter(f => f.MasterDataId == item.ApplicationFeature.ApplicationId)[0].Description;
            _appShortName = this.Applications.filter(f => f.MasterDataId == item.ApplicationFeature.ApplicationId)[0].MasterDataName

            var _permission = '';
            if (item.PermissionId != null)
              _permission = globalconstants.PERMISSIONTYPES.filter(a => a.val == item.PermissionId)[0].type
            debugger;

            this.UserDetail[0]["applicationRolePermission"].push({
              'applicationFeatureId': item.ApplicationFeatureId,
              'applicationFeature': item.ApplicationFeature.PageTitle,//_applicationFeature,
              'roleId': item.RoleId,
              'permissionId': item.PermissionId,
              'permission': _permission,
              'applicationName': _applicationName,
              'applicationId': item.ApplicationFeature.ApplicationId,
              'appShortName': _appShortName,
              'faIcon': item.ApplicationFeature.faIcon,
              'label': item.ApplicationFeature.label,
              'link': item.ApplicationFeature.link
            });

          });
          this.tokenService.saveUserdetail(this.UserDetail);
        }
      })
  }

}
