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
  loading:false;
  searchForm: FormGroup
  NewsNEventPageId = 0;
  MenuData = [];
  toggle: boolean = false;
  userName: string = '';
  loggedIn: boolean;
  @Output() toggleSideBarForme: EventEmitter<any> = new EventEmitter();
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
  Batches = [];
  ngOnInit(): void {
    //debugger;

    this.searchForm = this.fb.group({
      searchBatchId: [0]
    })
    this.userName = this.tokenStorage.getUser();
    //console.log('screensize1',this.deviceXs)
    if (this.userName === undefined || this.userName === null || this.userName == '')
      this.loggedIn = false;
    else
      this.loggedIn = true;
    //    console.log("loggedin", this.loggedIn)
    this.shareddata.CurrentPagesData.subscribe(m => (this.MenuData = m))
    this.shareddata.CurrentNewsNEventId.subscribe(n => (this.NewsNEventPageId = n));
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    if (this.Batches.length == 0)
      this.getBatches();
    else {
      this.searchForm.patchValue({ searchBatchId: this.SelectedBatchId });

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
    switch (page) {
      case 'subject':
        this.route.navigate(['/subject']);
        break;
      case 'exam':
        this.route.navigate(['/exam']);
        break;
      case 'control':
        this.route.navigate(['/control']);
        break;
      case 'admin':
        this.route.navigate(['/admin']);
        break;
      default:
        this.route.navigate(['/admin']);
    }
  }

  ChangeCurrentBatchId(selected) {
    debugger;
    if (selected.value == this.CurrentBatchId)
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
    list.fields = ["BatchId", "BatchName", "CurrentBatch", "Active"];
    list.PageName = "Batches";
    list.filter = ["Active eq 1"];
    this.dataservice.get(list).subscribe((data: any) => {
      this.Batches = [...data.value];
      this.shareddata.ChangeBatch(this.Batches);
      this.CurrentBatchId = this.Batches.filter(b => b.CurrentBatch == 1)[0].BatchId;
      if (this.SelectedBatchId == 0) {
        this.tokenStorage.saveSelectedBatchId(this.CurrentBatchId.toString())
        //this.shareddata.ChangeSelectedBatchId(this.CurrentBatchId);
        this.SelectedBatchId = this.CurrentBatchId;
      }

      this.searchForm.patchValue({ searchBatchId: this.SelectedBatchId });
      this.shareddata.ChangeCurrentBatchId(this.CurrentBatchId);

      this.generateBatchIds(this.CurrentBatchId);
    });
  }
}
