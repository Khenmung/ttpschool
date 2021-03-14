import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'FeeHeader',
  templateUrl: './feeheader.component.html',
  styleUrls: ['./feeheader.component.scss']
})
export class FeeHeaderComponent implements OnInit {
  //IsXS:boolean;
  toggle:boolean=false;
  userName:string='';
  loggedIn: boolean;
  @Output() toggleSideBarForme: EventEmitter<any> = new EventEmitter();
  constructor(private route: Router, 
              private tokenStorage: TokenStorageService,
              private naomitsuService:NaomitsuService,
              private screensize:SharedataService) {
    //console.log("token", tokenStorage.getToken())

  }

  ngOnInit(): void {
   debugger;
    //this.IsXS = this.screensize.isXS();
    //console.log('isxs',this.IsXS);
    this.userName = this.tokenStorage.getUser();

    if (this.userName === undefined || this.userName === null || this.userName=='')
      this.loggedIn = false;
    else
      this.loggedIn = true;
//    console.log("loggedin", this.loggedIn)
  }
  toggleSideBar() {
    this.toggleSideBarForme.emit();
    this.toggle = !this.toggle;
  }
  changepassword(){
    this.route.navigate(["/auth/changepassword"]);
  }
  gotoLogin() {
    this.route.navigate(["/auth/login"]);
  }
  createlogin(){
    this.route.navigate(["/auth/createlogin"]);
  }
  logout() {
    debugger;
    this.tokenStorage.signOut();
    this.route.navigate(['/']);
  }
  contactus() {
    this.route.navigate(["/addmessage"]);
  }
  home(){
    this.route.navigate(["/"]);
  }
  newsNEvents() {
    let list: List = new List();
    list.fields = ["PageId"];
    list.PageName = "Pages";
    list.filter = ["Active eq 1 and label eq 'News N Events'"];
    
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
         this.route.navigate(['/about/' + data.value[0].PageId]);        
      });

  }
}
