import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NaomitsuService } from '../../../../shared/databaseService';
import { List } from '../../../../shared/interface';
import { SharedataService } from '../../../../shared/sharedata.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';

@Component({
  selector: 'FeeHeader',
  templateUrl: './feeheader.component.html',
  styleUrls: ['./feeheader.component.scss']
})
export class FeeHeaderComponent implements OnInit {
  //IsXS:boolean;
  Applications=[];  
  toggle:boolean=false;
  userName:string='';
  loggedIn: boolean;
  userapplications:FormGroup;
  @Output() toggleSideBarForme: EventEmitter<any> = new EventEmitter();
  constructor(
    private fb:FormBuilder,
    private route: Router, 
              private tokenStorage: TokenStorageService,
              private naomitsuService:NaomitsuService,
              private screensize:SharedataService) {
    //console.log("token", tokenStorage.getToken())

  }

  ngOnInit(): void {
   debugger;
    //this.IsXS = this.screensize.isXS();
    //console.log('isxs',this.IsXS);
    this.userapplications = this.fb.group({
      ApplicationId:[0]
    }) 
    this.userName = this.tokenStorage.getUser();
    this.Applications = this.tokenStorage.getUserDetail().ApplicationRoleUsers;
    if (this.userName === undefined || this.userName === null || this.userName=='')
      this.loggedIn = false;
    else
      this.loggedIn = true;
//    console.log("loggedin", this.loggedIn)
  }
  changeApplication(value){

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
    this.route.navigate(['/home']);
  }
  contactus() {
    this.route.navigate(["/home/addmessage"]);
  }
  home(){
    this.route.navigate(["/home/"]);
  }
  newsNEvents() {
    let list: List = new List();
    list.fields = ["PageId"];
    list.PageName = "Pages";
    list.filter = ["Active eq 1 and label eq 'News N Events'"];
    
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
         this.route.navigate(['/home/about/' + data.value[0].PageId]);        
      });

  }
}
