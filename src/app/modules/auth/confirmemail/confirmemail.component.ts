import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-confirmemail',
  templateUrl: './confirmemail.component.html',
  styleUrls: ['./confirmemail.component.scss']
})
export class ConfirmemailComponent implements OnInit {
  userId = '';
  code = '';
  constructor(
    private route: Router,
    private aroute: ActivatedRoute,
    private authservice: AuthService,
    private contentservice: ContentService
  ) {

  }

  ngOnInit(): void {
    this.aroute.queryParamMap.subscribe(qparam => {
      this.code = qparam.get("token");

      this.aroute.paramMap.subscribe(params => {
        this.userId = params.get("id");
        var payload = { "code": this.code,"userId": this.userId };
        this.authservice.CallAPI(payload, 'ConfirmEmail').subscribe((data: any) => {
          localStorage.setItem("orgId", data.OrgId);
          localStorage.setItem("userId", data.Id);
          this.contentservice.openSnackBar("Email confirmation success! Please login and select your plan.", globalconstants.ActionText, globalconstants.BlueBackground);
          this.route.navigate(['/auth/selectplan']);
        },
          err => {
            this.contentservice.openSnackBar("Email confirmation fail", globalconstants.ActionText, globalconstants.RedBackground);
          });
      })
    })
  }
}
