import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { List } from '../../../shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';

@Component({
  selector: 'app-homedashboard',
  templateUrl: './homedashboard.component.html',
  styleUrls: ['./homedashboard.component.scss']
})
export class HomeDashboardComponent implements OnInit {
  loading= false;
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

  constructor(
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private fb: FormBuilder,
    private route: Router,
    private aroute: ActivatedRoute,
    private dataservice: NaomitsuService,
    private http: HttpClient
    ) { }

  ngOnInit(): void {
    // var urlId = 0;
    // this.aroute.paramMap.subscribe(p => {
    //   urlId = +p.get('id');
    //   this.shareddata.ChangeApplicationId(urlId);
    // })
    
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
      this.loading=true;
      this.userName = this.tokenStorage.getUser();
      var PermittedApps = this.loginUserDetail[0]["applicationRolePermission"];
      if (PermittedApps.length == 0) {
        this.route.navigate(["/auth/apps"]);
      }
      else {
        var _UniquePermittedApplications = PermittedApps.filter((v, i, a) => a.findIndex(t => (t.applicationId === v.applicationId)) === i)
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
        //if (this.Batches.length == 0)
          this.getBatches();

        //this.searchForm.patchValue({ searchBatchId: this.SelectedBatchId });
        //this.searchForm.patchValue({ searchApplicationId: this.SelectedAppId });
      }
    }
  }
  ChangeApplication() {
    var SelectedAppId = this.searchForm.get("searchApplicationId").value;
    this.tokenStorage.saveSelectedAppId(SelectedAppId);
    var selectedApp = this.PermittedApplications.filter(a => a.applicationId == SelectedAppId);
    
    this.route.navigate(['/', selectedApp[0].appShortName])

  }
  ChangeCurrentBatchId(selected) {
    //debugger;
    var _SelectedBatch = this.Batches.filter(b => b.BatchId == selected)
    if (_SelectedBatch.length > 0) {
      this.shareddata.ChangeSelectedBatchStartEnd({ 'StartDate': _SelectedBatch[0].StartDate, 'EndDate': _SelectedBatch[0].EndDate });
    }
    //this is for enabling promote student purpose. if selected value is >= current, promote should not be enable 
    if (selected.value >= this.CurrentBatchId)
      this.tokenStorage.saveCheckEqualBatchId("0");
    else
      this.tokenStorage.saveCheckEqualBatchId("1");

    this.tokenStorage.saveSelectedBatchId(selected.value);
    //this.shareddata.ChangeSelectedBatchId(selected.value);

    this.generateBatchIds(selected.value);
    //this.route.navigated = false;
    //var currenturl = this.route.url;
    //window.location.href = currenturl;
    //this.route.navigate([currenturl]);
  }
  generateBatchIds(batchId) {
    var previousBatchIndex = this.Batches.map(d => d.BatchId).indexOf(batchId) - 1;
    var _previousBatchId = -1;
    if (previousBatchIndex > -1) {
      _previousBatchId = this.Batches[previousBatchIndex]["BatchId"];
      this.tokenStorage.savePreviousBatchId(_previousBatchId.toString())
      //this.shareddata.ChangePreviousBatchIdOfSelecteBatchId(_previousBatchId);
    }
    var nextBatchIndex = this.Batches.map(d => d.BatchId).indexOf(batchId) + 1;
    var _nextBatchId = -1;
    if (nextBatchIndex > -1) {
      _nextBatchId = this.Batches[nextBatchIndex]["BatchId"];
      this.tokenStorage.saveNextBatchId(_nextBatchId.toString());
      //this.shareddata.ChangeNextBatchIdOfSelecteBatchId(_nextBatchId);
    }
    //this.tokenStorage.saveSelectedBatchId(batchId)
    ////console.log("selected",batchId);
  }
  getBatches() {
    var list = new List();
    list.fields = [
      "BatchId",
      "BatchName",
      "StartDate",
      "EndDate",
      "CurrentBatch",
      "Active"];
    list.PageName = "Batches";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list).subscribe((data: any) => {
      this.Batches = [...data.value];
      this.shareddata.ChangeBatch(this.Batches);
      var _currentBatchStartEnd = {};
      var _currentBatch = this.Batches.filter(b => b.CurrentBatch == 1);
      if (_currentBatch.length > 0) {
        _currentBatchStartEnd = {
          'StartDate': _currentBatch[0].StartDate,
          'EndDate': _currentBatch[0].EndDate,
        };
        this.tokenStorage.saveCurrentBatchStartEnd(_currentBatchStartEnd)
        this.tokenStorage.saveSelectedBatchStartEnd(_currentBatchStartEnd)
        this.CurrentBatchId = _currentBatch[0].BatchId;
      }
      if (this.SelectedBatchId == 0) {
        this.tokenStorage.saveSelectedBatchId(this.CurrentBatchId.toString())
        this.SelectedBatchId = this.CurrentBatchId;
      }

      this.searchForm.patchValue({ searchBatchId: this.SelectedBatchId });
      this.searchForm.patchValue({ searchApplicationId: this.SelectedAppId });
      this.shareddata.ChangeCurrentBatchId(this.CurrentBatchId);
      this.generateBatchIds(this.CurrentBatchId);
      this.loading=false;
    });
  }
  sendmessage(){
    var api="https://api.chat-api.com/instance358541/sendMessage?token=sfhfmzsd9temr6ca";
    var data ={
      "phone": "918974098031",
    "body": "WhatsApp API on Chat API from TTP again"
    }
    this.http.post(api,data).subscribe((data:any)=>{
      //console.log("messagereturn",data);
    });      
  }
}
