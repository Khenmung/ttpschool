import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { NaomitsuService } from '../../databaseService';
import { List } from '../../interface';
import { SharedataService } from '../../sharedata.service'
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() deviceXs: boolean;
  @Output() toggleSideBarForme: EventEmitter<any> = new EventEmitter();

  loading: false;
  searchForm: FormGroup
  NewsNEventPageId = 0;
  MenuData = [];
  toggle: boolean = false;
  userName: string = '';
  loggedIn: boolean;
  loginUserDetail: any;

  constructor(
    private aroute: ActivatedRoute,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private shareddata: SharedataService,
    private fb: FormBuilder,

  ) {

    //console.log("token", tokenStorage.getToken())

  }
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  SelectedAppId = 0;
  Batches = [];
  PermittedApplications = [];
  ngOnInit(): void {
    debugger;
    var urlId = 0;
    this.aroute.paramMap.subscribe(p => {
      urlId = +p.get('id');
      this.shareddata.ChangeApplicationId(urlId);
    })
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
      this.userName = this.tokenStorage.getUser();
      var PermittedApps = this.loginUserDetail[0]["applicationRolePermission"];
      var _UniquePermittedApplications = PermittedApps.filter((v, i, a) => a.findIndex(t => (t.applicationId === v.applicationId)) === i)
      this.shareddata.ChangePermittedApplications(_UniquePermittedApplications);
      this.shareddata.CurrentPermittedApplications.subscribe(p => this.PermittedApplications = p);

      if (this.PermittedApplications.length == 0) {
        this.tokenStorage.signOut();
        this.route.navigate(['/auth/login']);
      }


      if (this.userName === undefined || this.userName === null || this.userName == '')
        this.loggedIn = false;
      else
        this.loggedIn = true;
      this.shareddata.CurrentPagesData.subscribe(m => (this.MenuData = m))
      this.shareddata.CurrentNewsNEventId.subscribe(n => (this.NewsNEventPageId = n));
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
      this.SelectedAppId = +this.tokenStorage.getSelectedAPPId();
      if (this.Batches.length == 0)
        this.getBatches();
      else {
        this.searchForm.patchValue({ searchBatchId: this.SelectedBatchId });
        this.searchForm.patchValue({ searchApplicationId: this.SelectedAppId });
      }
    }
  }
  toggleSideBar() {
    this.toggleSideBarForme.emit();
    this.toggle = !this.toggle;
  }
  changepassword() {
    this.route.navigate(["/auth/changepassword"]);
  }
  gotoLogin() {
    this.route.navigate(["/auth/login"]);
  }
  createlogin() {
    this.route.navigate(["/auth/createlogin"]);
  }
  addUser() {
    this.route.navigate(["/auth/signup"]);
  }
  logout() {
    debugger;
    this.tokenStorage.signOut();
    this.route.navigate(['/home']);
  }
  contactus() {
    this.route.navigate(["/home/addmessage"]);
  }
  home() {
    this.route.navigate(["/home/"]);
  }
  newsNEvents() {
    this.route.navigate(['/home/about/' + this.NewsNEventPageId]);
  }
  goto(page) {
    this.route.navigate(['/' + page]);
  }
  ChangeApplication(applicationId) {

    this.tokenStorage.saveSelectedAppId(applicationId.value);
    var selectedApp = this.PermittedApplications.filter(a => a.applicationId == applicationId.value);
    this.route.navigate(['/', selectedApp[0].appShortName, selectedApp[0].applicationId])

  }
  ChangeCurrentBatchId(selected) {
    debugger;
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
    var currenturl = this.route.url;
    window.location.href = currenturl;
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
    //console.log("selected",batchId);
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
        this.shareddata.ChangeCurrentBatchStartEnd(_currentBatchStartEnd);
        this.shareddata.ChangeSelectedBatchStartEnd(_currentBatchStartEnd);
        this.CurrentBatchId = _currentBatch[0].BatchId;
      }
      if (this.SelectedBatchId == 0) {
        this.tokenStorage.saveSelectedBatchId(this.CurrentBatchId.toString())
        //this.shareddata.ChangeSelectedBatchId(this.CurrentBatchId);
        this.SelectedBatchId = this.CurrentBatchId;
      }

      this.searchForm.patchValue({ searchBatchId: this.SelectedBatchId });
      this.searchForm.patchValue({ searchApplicationId: this.SelectedAppId });
      this.shareddata.ChangeCurrentBatchId(this.CurrentBatchId);
      this.generateBatchIds(this.CurrentBatchId);
    });
  }
}
