import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { NaomitsuService } from '../../databaseService';
import { SharedataService } from '../../sharedata.service'
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() deviceXs: boolean;
  NewsNEventPageId = 0;
  MenuData = [];
  toggle: boolean = false;
  userName: string = '';
  loggedIn: boolean;
  @Output() toggleSideBarForme: EventEmitter<any> = new EventEmitter();
  constructor(private route: Router,
    private tokenStorage: TokenStorageService,
    private naomitsuService: NaomitsuService,
    private shareddata: SharedataService
  ) {
    //console.log("token", tokenStorage.getToken())

  }

  ngOnInit(): void {
    //debugger;
    this.userName = this.tokenStorage.getUser();
    //console.log('screensize1',this.deviceXs)
    if (this.userName === undefined || this.userName === null || this.userName == '')
      this.loggedIn = false;
    else
      this.loggedIn = true;
    //    console.log("loggedin", this.loggedIn)
    this.shareddata.CurrentPagesData.subscribe(m=>(this.MenuData=m))
    this.shareddata.CurrentNewsNEventId.subscribe(n=>(this.NewsNEventPageId=n));
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
  addUser(){
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
}
