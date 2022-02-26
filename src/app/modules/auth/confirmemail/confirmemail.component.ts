import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { List } from 'src/app/shared/interface';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-confirmemail',
  templateUrl: './confirmemail.component.html',
  styleUrls: ['./confirmemail.component.scss']
})
export class ConfirmemailComponent implements OnInit {
userId='';
optionsNoAutoClose = {
  autoClose: false,
  keepAfterRouteChange: true
};
optionAutoClose = {
  autoClose: true,
  keepAfterRouteChange: true
};
  constructor(
    private route:Router,
    private aroute:ActivatedRoute,
    private authservice:AuthService,
    private alert:AlertService
  ) {
    
   }

  ngOnInit(): void {
    this.aroute.paramMap.subscribe(params => {
      this.userId = params.get("id");
      var payload={"UserId":this.userId};
      this.authservice.CallAPI(payload,'ConfirmEmail').subscribe((data:any)=>{
        localStorage.setItem("orgId",data.OrgId);
        this.alert.success("Email confirmation success! Please login and select your plan.",this.optionsNoAutoClose);
        this.route.navigate(['/auth/selectplan']);
      },
      err=>{
        this.alert.error("Email confirmation fail",this.optionsNoAutoClose);
      });  
    })
  }
}
