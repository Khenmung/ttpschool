import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import * as moment from 'moment';

@Component({
  selector: 'app-homedashboard',
  templateUrl: './homedashboard.component.html',
  styleUrls: ['./homedashboard.component.scss']
})
export class HomeDashboardComponent implements OnInit {
  PageLoading = true;
  loading = false;
  searchForm: UntypedFormGroup;
  NewsNEventPageId = 0;
  MenuData = [];
  toggle: boolean = false;
  userName: string = '';
  loggedIn: boolean;
  loginUserDetail: any;
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  SelectedAppId = 0;
  Batches = [];
  PermittedApplications = [];
  SelectedAppName = '';
  CustomFeatures = [];
  constructor(private servicework: SwUpdate,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private fb: UntypedFormBuilder,
    private route: Router,
    private dataservice: NaomitsuService,
    private http: HttpClient,
    private contentservice: ContentService

  ) { }
  Role = '';
  Submitted = false;
  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    this.searchForm = this.fb.group({
      searchApplicationId: [0],
      searchBatchId: [0]
    })
    this.loginUserDetail = this.tokenStorage.getUserDetail();
    console.log("HOme dashboard init")
    //console.log('role',this.Role);
    if (this.loginUserDetail.length == 0) {
      this.tokenStorage.signOut();
      this.route.navigate(['/auth/login']);
    }
    else {
      this.Role = this.loginUserDetail[0]['RoleUsers'][0]['role'];
      this.CheckLocalStorage();
      this.GetOrganization()
        .subscribe((data: any) => {
          if (data.value.length > 0) {
            var _validTo = new Date(data.value[0].ValidTo);//
            _validTo.setHours(0, 0, 0, 0);
            var _today = new Date();//
            _today.setHours(0, 0, 0, 0);
            var _roleName = this.loginUserDetail[0]['RoleUsers'][0].role;
            const diffTime = Math.abs(_validTo.getTime() - _today.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            //console.log("diffDays", diffDays)
            var alertDate = localStorage.getItem("alertdate");
            var todaystring = moment(new Date()).format('DD-MM-YYYY')

            // var days = new Date(_validTo) - new Date(_today);
            if (diffDays < 0) {
              this.tokenStorage.signOut();
              this.contentservice.openSnackBar("Login expired! Please contact administrator.", globalconstants.ActionText, globalconstants.RedBackground);
              //setTimeout(() => {
              this.route.navigate(['/auth/login'])
              //}, 3000);
            }
            else if (diffDays < 6 && alertDate != todaystring && _roleName.toLowerCase() == 'admin') {
              localStorage.setItem("alertdate", todaystring);
              var msg = '';
              if (diffDays == 0)
                msg = "Your plan is expiring today";
              else if (diffDays == 1)
                msg = "Your plan is expiring tommorrow.";
              else
                msg = "Your plan is expiring within " + diffDays + " days. i.e on " + moment(_validTo).format('DD/MM/YYYY');
              this.contentservice.openSnackBar(msg, globalconstants.ActionText, globalconstants.GreenBackground);
            }
            //else {
            debugger;
            this.loading = true;
            this.userName = localStorage.getItem('userName');
            var PermittedApps = this.loginUserDetail[0]["applicationRolePermission"];

            if (PermittedApps.length == 0 && _roleName.toLowerCase() == 'admin') {
              this.route.navigate(["/auth/selectplan"]);
            }
            else {
              var _UniquePermittedApplications = PermittedApps.filter((v, i, a) => a.findIndex(t => (t.applicationId === v.applicationId)) === i)
              if (_roleName.toLowerCase() != 'admin')
                this.PermittedApplications = _UniquePermittedApplications.filter(f => f.applicationName.toLowerCase() != 'common panel');
              else
                this.PermittedApplications = [..._UniquePermittedApplications];

              if (this.PermittedApplications.length == 0) {
                this.contentservice.openSnackBar("No permitted application found.", globalconstants.ActionText, globalconstants.RedBackground);
                this.tokenStorage.signOut();
                //this.route.navigate(['/auth/login']);
              }
              else {
                this.tokenStorage.savePermittedApplications(_UniquePermittedApplications);
                if (this.userName === undefined || this.userName === null || this.userName == '')
                  this.loggedIn = false;
                else
                  this.loggedIn = true;
                //this.shareddata.CurrentPagesData.subscribe(m => (this.MenuData = m))
                this.shareddata.CurrentNewsNEventId.subscribe(n => (this.NewsNEventPageId = n));
                this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
                this.SelectedAppId = +this.tokenStorage.getSelectedAPPId();
                this.SelectedAppName = this.tokenStorage.getSelectedAppName();
                this.getBatches();
                //console.log("this.SelectedAppName.toLowerCase()",this.SelectedAppName.toLowerCase())
                if (this.SelectedAppName != null && this.SelectedAppName.toLowerCase() == 'education management') {
                  let obj = { appShortName: 'edu', applicationName: this.SelectedAppName };
                  this.GetStudentClass(this.SelectedAppId, obj);
                }
                if (this.SelectedAppId > 0) {
                  this.contentservice.GetCommonMasterData(this.loginUserDetail[0]['orgId'], this.SelectedAppId)
                    .subscribe((data: any) => {
                      this.tokenStorage.saveMasterData(data.value);
                    })
                  this.GetMenuData(this.SelectedAppId);
                }
              }
            }
            //}
          }
          this.loading = false;
          this.PageLoading = false;
        });

    }

  }
  /* 
 * function body that test if storage is available
 * returns true if localStorage is available and false if it's not
 */
  lsTest() {
    var test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* 
  * execute Test and run our custom script 
  */
  CheckLocalStorage() {
    if (this.lsTest()) {
      console.log('localStorage where used'); // log
    } else {
      this.contentservice.openSnackBar("Browser does not support this application.", globalconstants.ActionText, globalconstants.RedBackground);
      document.cookie = "name=1; expires=Mon, 28 Mar 2016 12:00:00 UTC";
      console.log('Cookie where used'); // log
    }
  }
  sideMenu = [];
  GetMenuData(pSelectedAppId) {
    debugger;
    //let containAdmin = window.location.href.toLowerCase().indexOf('admin');
    let strFilter = '';
    //console.log("in dashboard")
    strFilter = "PlanId eq " + this.loginUserDetail[0]["planId"] + " and Active eq 1 and ApplicationId eq " + pSelectedAppId;

    let list: List = new List();
    list.fields = [
      "PlanFeatureId",
      "PlanId",
      "PageId",
      "ApplicationId"
    ];

    list.PageName = "PlanFeatures";
    list.lookupFields = ["Page($select=PageId,PageTitle,label,faIcon,link,ParentId,HasSubmenu,UpdateDate,DisplayOrder)"];
    //list.orderBy = "DisplayOrder";
    list.filter = [strFilter];
    var permission;
    this.dataservice.get(list).subscribe((data: any) => {
      this.sideMenu = [];
      data.value.forEach(m => {
        permission = this.loginUserDetail[0]["applicationRolePermission"].filter(r => r.applicationFeature.toLowerCase().trim() == m.Page.PageTitle.toLowerCase().trim() && m.Page.ParentId == 0)
        if (permission.length > 0 && permission[0].permission != 'deny') {
          m.PageId = m.Page.PageId;
          m.PageTitle = m.Page.PageTitle;
          m.label = m.Page.label;
          m.faIcon = m.Page.faIcon;
          m.link = m.Page.link;
          m.ParentId = m.Page.ParentId;
          m.HasSubmenu = m.Page.HasSubmenu;
          m.DisplayOrder = m.Page.DisplayOrder;
          this.sideMenu.push(m);
        }
      })

      this.sideMenu = this.sideMenu.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
      this.tokenStorage.saveMenuData(this.sideMenu);

      let NewsNEvents = this.sideMenu.filter(item => {
        return item.label.toUpperCase() == 'NEWS N EVENTS'
      })
      if (NewsNEvents.length > 0) {
        this.shareddata.ChangeNewsNEventId(NewsNEvents[0].PageId);
      }

      var appName = location.pathname.split('/')[1];
      if (appName.length > 0) {


        //this.shareddata.ChangePageData(this.sideMenu);
        // this.tokenStorage.saveMenuData(this.sideMenu) 
      }
      // this.tokenStorage.saveMenuData(this.sideMenu) 

    });


  }
  GetOrganization() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["OrganizationId", "OrganizationName", "ValidTo", "ValidFrom"];
    list.PageName = "Organizations";
    list.filter = ["Active eq 1 and OrganizationId eq " + this.loginUserDetail[0]["orgId"]];
    //debugger;
    return this.dataservice.get(list)

  }
  ValueChanged = false;
  ChangeApplication() {
    var SelectedAppId = this.searchForm.get("searchApplicationId").value;
    this.SelectedAppName = this.PermittedApplications.filter(f => f.applicationId == SelectedAppId)[0].applicationName
    this.ValueChanged = true;
  }
  changebatch() {
    this.ValueChanged = true;
  }
  submit() {
    this.Submitted=true;
    this.SelectedBatchId = this.searchForm.get("searchBatchId").value;
    var SelectedAppId = this.searchForm.get("searchApplicationId").value;
    if (this.SelectedBatchId > 0)
      this.SaveBatchIds(this.SelectedBatchId);
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select batch.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (SelectedAppId > 0) {
      this.loading = true;
      this.tokenStorage.saveSelectedAppId(SelectedAppId);
      var selectedApp = this.PermittedApplications.filter(a => a.applicationId == SelectedAppId);

      //this line is added because when batch is not defined for new user, selected batch name is null.
      if (this.Batches.length > 0) {
        var _batchName = this.Batches.filter(f => f.BatchId == this.SelectedBatchId)[0].BatchName;
        this.tokenStorage.saveSelectedBatchName(_batchName)
      }
      else
        this.tokenStorage.saveSelectedBatchName('');
      //////for local storage

      this.GetMenuData(SelectedAppId);
      if (selectedApp[0].applicationName.toLowerCase() == 'education management')
        this.GetStudentClass(SelectedAppId, selectedApp[0]);
      else
        this.GetMasterData(SelectedAppId, selectedApp[0]);

    }
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select application.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
  }
  GetMasterData(SelectedAppId, selectedApp) {
    this.contentservice.GetCommonMasterData(this.loginUserDetail[0]['orgId'], SelectedAppId)
      .subscribe((data: any) => {
        this.tokenStorage.saveMasterData([...data.value]);

        this.tokenStorage.saveSelectedAppName(selectedApp.applicationName);
        this.contentservice.GetCustomFeature(SelectedAppId, this.loginUserDetail[0]["RoleUsers"][0].roleId)
          .subscribe((data: any) => {
            data.value.forEach(item => {
              var feature = this.loginUserDetail[0]['applicationRolePermission'].filter(f => f.applicationFeature == item.CustomFeature.CustomFeatureName)
              if (feature.length == 0) {
                this.loginUserDetail[0]['applicationRolePermission'].push({
                  'planFeatureId': 0,
                  'applicationFeature': item.CustomFeature.CustomFeatureName,//_applicationFeature,
                  'roleId': item.RoleId,
                  'permissionId': item.PermissionId,
                  'permission': globalconstants.PERMISSIONTYPES.filter(f => f.val == item.PermissionId)[0].type,
                  'applicationName': selectedApp.applicationName,
                  'applicationId': item.ApplicationId,
                  'appShortName': selectedApp.appShortName,
                  'faIcon': '',
                  'label': '',
                  'link': ''
                })
              }
            });
            this.tokenStorage.saveUserdetail(this.loginUserDetail);
            this.tokenStorage.saveCustomFeature(data.value);
            this.SelectedAppName = selectedApp.applicationName;
            if (this.Submitted)
              this.route.navigate(['/', selectedApp.appShortName]);
          });
      })
  }
  SaveBatchIds(selectedBatchId) {
    debugger;
    var _SelectedBatch = this.Batches.filter(b => b.BatchId == selectedBatchId);
    var SelectedBatchName = ''
    if (_SelectedBatch.length > 0) {
      SelectedBatchName = _SelectedBatch[0].BatchName;
    }

    if (_SelectedBatch.length > 0) {
      //this.shareddata.ChangeSelectedBatchStartEnd({ 'StartDate': _SelectedBatch[0].StartDate, 'EndDate': _SelectedBatch[0].EndDate });
      this.tokenStorage.saveSelectedBatchStartEnd(
        { 'StartDate': _SelectedBatch[0].StartDate, 'EndDate': _SelectedBatch[0].EndDate });
    }
    //this is for enabling promote student purpose. if selected value is >= current, promote should not be enable 
    if (selectedBatchId >= this.CurrentBatchId)
      this.tokenStorage.saveCheckEqualBatchId("1");
    else
      this.tokenStorage.saveCheckEqualBatchId("0");

    this.tokenStorage.saveSelectedBatchId(selectedBatchId);
    this.tokenStorage.saveSelectedBatchName(SelectedBatchName);

    this.generateBatchIds(selectedBatchId);
  }
  generateBatchIds(SelectedbatchId) {
    debugger;
    var previousBatchIndex = this.Batches.map(d => d.BatchId).indexOf(SelectedbatchId) - 1;
    var _previousBatchId = -1;
    if (previousBatchIndex > -1) {
      _previousBatchId = this.Batches[previousBatchIndex]["BatchId"];
    }

    this.tokenStorage.savePreviousBatchId(_previousBatchId.toString())
    var nextBatchIndex = this.Batches.map(d => d.BatchId).indexOf(SelectedbatchId) + 1;
    var _nextBatchId = -1;
    if (this.Batches.length > nextBatchIndex) {
      _nextBatchId = this.Batches[nextBatchIndex]["BatchId"];
    }
    this.tokenStorage.saveNextBatchId(_nextBatchId.toString());
  }
  getBatches() {
    var currentbatchfilter = '';
    if (this.Role != 'Admin')
      currentbatchfilter = ' and CurrentBatch eq 1';

    var list = new List();
    list.fields = [
      "BatchId",
      "BatchName",
      "StartDate",
      "EndDate",
      "CurrentBatch",
      "Active"];
    list.PageName = "Batches";
    list.filter = ["Active eq 1 and OrgId eq " + this.loginUserDetail[0]["orgId"] + currentbatchfilter];
    this.dataservice.get(list).subscribe((data: any) => {
      this.Batches = [...data.value];
      this.tokenStorage.saveBatches(this.Batches)
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
      this.tokenStorage.saveCurrentBatchId(this.SelectedBatchId + "");

      this.searchForm.patchValue({ searchBatchId: this.SelectedBatchId });
      this.searchForm.patchValue({ searchApplicationId: this.SelectedAppId });
      this.shareddata.ChangeCurrentBatchId(this.CurrentBatchId);
      if (this.SelectedBatchId > 0)
        this.generateBatchIds(this.SelectedBatchId);
      this.loading = false; this.PageLoading = false;
    });
  }
  Students = [];
  StudentClasses = [];
  GetStudentClass(SelectedAppId, selectedApp) {
    var standardfilter = "OrgId eq " + this.loginUserDetail[0]["orgId"] + " and BatchId eq " + this.SelectedBatchId;
    let list: List = new List();
    list.fields = [
      "StudentClassId,StudentId,ClassId,SectionId,RollNo,FeeTypeId,Remarks"
    ];
    if (this.loginUserDetail[0]['RoleUsers'][0].role.toLowerCase() == 'student') {
      standardfilter += " and StudentId eq " + localStorage.getItem("studentId");
    }
    list.PageName = "StudentClasses";
    //list.lookupFields=["StudentClasses($filter=BatchId eq "+ this.SelectedBatchId +";$select=)"]


    list.filter = [standardfilter];
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClasses = [...data.value];
        this.GetStudents(SelectedAppId, selectedApp);
      })
  }

  GetStudents(SelectedAppId, selectedApp) {
    let list: List = new List();
    list.fields = [
      'StudentId',
      'FirstName',
      'LastName',
      'FatherName',
      'MotherName',
      'PersonalNo',
      'FatherContactNo',
      'MotherContactNo',
      "PID",
      "Active",
      "RemarkId",
      "GenderId",
      "HouseId",
      "EmailAddress",
      "UserId",
      "ReasonForLeavingId",
      "AdmissionStatusId"
    ];
    list.PageName = "Students";
    //list.lookupFields=["StudentClasses($filter=BatchId eq "+ this.SelectedBatchId +";$select=StudentClassId,StudentId,ClassId,SectionId,RollNo)"]
    var standardfilter = 'OrgId eq ' + this.loginUserDetail[0]["orgId"];
    if (this.loginUserDetail[0]['RoleUsers'][0].role.toLowerCase() == 'student') {
      standardfilter += " and StudentId eq " + localStorage.getItem("studentId");
    }
    list.filter = [standardfilter];
    this.loading = true;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.loading = true;
        this.Students = data.value.map(d => {
          d.StudentClasses = this.StudentClasses.filter(f => f.StudentId == d.StudentId);
          return d;
        })
        this.tokenStorage.saveStudents(this.Students);
        this.GetMasterData(SelectedAppId, selectedApp);
        this.loading = false;
        this.PageLoading = false;
      })
  }
  sendmessage() {
    var api = "https://graph.facebook.com/v15.0/107273275514184/messages";
    var data={ "messaging_product": "whatsapp", "to": "918974098031", "type": "template", "template": { "name": "hello_world", "language": { "code": "en_US" } } }
    
    // var data = {
    //   "phone": "918974098031",
    //   "body": "WhatsApp API on Chat API from TTP again"
    // }
    this.http.post(api, data).subscribe((data: any) => {
      //console.log("messagereturn",data);
    });
  }
}
