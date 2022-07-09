import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';

@Component({
  selector: 'app-homedashboard',
  templateUrl: './homedashboard.component.html',
  styleUrls: ['./homedashboard.component.scss']
})
export class HomeDashboardComponent implements OnInit {
  PageLoading = true;
  loading = false;
  searchForm: FormGroup;
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
  constructor(
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private fb: FormBuilder,
    private route: Router,
    private dataservice: NaomitsuService,
    private http: HttpClient,
    private contentservice: ContentService

  ) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchApplicationId: [0],
      searchBatchId: [0]
    })
    this.loginUserDetail = this.tokenStorage.getUserDetail();
    if (this.loginUserDetail.length == 0) {
      this.tokenStorage.signOut();
      this.route.navigate(['/auth/login']);
    }
    else {
      debugger;
      this.loading = true;
      this.userName = localStorage.getItem('userName');
      var PermittedApps = this.loginUserDetail[0]["applicationRolePermission"];
      var _roleName = this.loginUserDetail[0]['RoleUsers'][0].role;
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
          this.tokenStorage.signOut();
          this.route.navigate(['/auth/login']);
        }
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
        //console.log("this.SelectedAppName",this.SelectedAppName);
        this.getBatches();

        //this.searchForm.patchValue({ searchBatchId: this.SelectedBatchId });
        //this.searchForm.patchValue({ searchApplicationId: this.SelectedAppId });
      }
    }
  }

  
  ChangeApplication() {
    var SelectedAppId = this.searchForm.get("searchApplicationId").value;
    this.SelectedAppName = this.PermittedApplications.filter(f => f.applicationId == SelectedAppId)[0].applicationName
  }
  submit() {
    var selectedBatchId = this.searchForm.get("searchBatchId").value;
    var SelectedAppId = this.searchForm.get("searchApplicationId").value;
    if (selectedBatchId > 0)
      this.SaveBatchIds(selectedBatchId);
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
        var _batchName = this.Batches.filter(f => f.BatchId == selectedBatchId)[0].BatchName;
        this.tokenStorage.saveSelectedBatchName(_batchName)
      }
      else
        this.tokenStorage.saveSelectedBatchName('');

      this.tokenStorage.saveSelectedAppName(selectedApp[0].applicationName);
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
                'permission': globalconstants.PERMISSIONTYPES.filter(f=>f.val==item.PermissionId)[0].type,
                'applicationName': selectedApp[0].applicationName,
                'applicationId': item.ApplicationId,
                'appShortName': selectedApp[0].appShortName,
                'faIcon': '',
                'label': '',
                'link': ''
              })
            }
          });
          this.tokenStorage.saveUserdetail(this.loginUserDetail);
          this.tokenStorage.saveCustomFeature(data.value);
          this.SelectedAppName = selectedApp[0].applicationName;
          this.route.navigate(['/', selectedApp[0].appShortName])
        });
    }
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select application.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
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
    var list = new List();
    list.fields = [
      "BatchId",
      "BatchName",
      "StartDate",
      "EndDate",
      //"CurrentBatch",
      "Active"];
    list.PageName = "Batches";
    list.filter = ["Active eq 1 and OrgId eq " + this.loginUserDetail[0]["orgId"]];
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
  sendmessage() {
    var api = "https://api.chat-api.com/instance358541/sendMessage?token=sfhfmzsd9temr6ca";
    var data = {
      "phone": "918974098031",
      "body": "WhatsApp API on Chat API from TTP again"
    }
    this.http.post(api, data).subscribe((data: any) => {
      //console.log("messagereturn",data);
    });
  }
}
