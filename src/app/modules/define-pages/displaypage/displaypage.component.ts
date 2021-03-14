import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
//import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { List } from 'src/app/shared/interface';
import { NaomitsuService } from '../../../shared/databaseService'

//@Pipe({ name: 'safeHtml' })
@Component({
  selector: 'app-displaypage',
  templateUrl: './displaypage.component.html',
  styleUrls: ['./displaypage.component.scss']
})
export class DisplaypageComponent implements OnInit {
  loading: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 50;
  GroupId: number;
  HomePageId: number;
  loop: number = 0;
  ParentPage = "";
  Title: string = "";
  PageBody: string = '';
  constructor(
    private naomitsuService: NaomitsuService,
    private ar: ActivatedRoute,
    private route: Router
    //private sanitized: DomSanitizer
  ) {

  }

  ngOnInit(): void {
    //this.GetLatestPage();
    this.loading = true;
    //this.ar.queryParamMap.
    this.GroupId = 0;
    this.GroupId = this.ar.snapshot.queryParamMap.get("GroupId") == undefined ? 0 : +this.ar.snapshot.queryParamMap.get("GroupId");
    // this.ar.queryParamMap.subscribe(params => {
    //   this.GroupId = +params.get("GroupId")
    //   if (this.GroupId == 0) {
    //     this.getHomePageId();
    //   }
    // },error=>console.log('queryparam',error)
    // );
    this.ar.paramMap.subscribe(params => {
      //this.GroupId = 0;
      this.GetLatestPage(params.get('phid'));
    })
  }
  back() {
    if (this.GroupId == 0)
      this.route.navigate(['/']);
    else
      this.route.navigate(['/about/' + this.GroupId]);
  }
  GetLatestPage(phid) {
    debugger;
    let IdtoDisplay = phid;
    if (IdtoDisplay == 0) {
      let list: List = new List();
      list.fields = ["link", "PageId"];
      //list.lookupFields = ["Page"];
      list.PageName = "Pages";
      list.filter = ["HomePage eq 1"];
      this.naomitsuService.get(list)
        .subscribe((data: any) => {
          if (data.value.length > 0) {
            IdtoDisplay = +data.value[0].link.split('/')[2];
            this.getPageFromHistory(IdtoDisplay);
          }
        })
    }
    else
      this.getPageFromHistory(IdtoDisplay);

  }
  getPageFromHistory(IdtoDisplay) {
    let list: List = new List();
    list.fields = ["PageHistoryId", "PageBody", "Page/PageTitle", "ParentPageId"];
    list.lookupFields = ["Page"];
    list.PageName = "PageHistories";
    list.filter = ["PageHistoryId eq " + IdtoDisplay];
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          //console.log(data.value[0])
          this.Title = data.value[0].Page.PageTitle;
          this.PageBody = data.value[0].PageBody
          if (this.GroupId > 0)
            this.GetParentPage(this.GroupId);
          else
            this.GetParentPage(data.value[0].ParentPageId);
          this.loop = 0;
        }
        this.loading = false;
      });
  }
  getHomePageId() {
    let list: List = new List();
    list.fields = ["PageId", "PageTitle", "ParentId"];
    list.PageName = "Pages";
    list.filter = ["Active eq 1 and HomePage eq 1"];
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0)
          this.GroupId = data.value[0].PageId;
      });
  }
  GetParentPage(parentId) {
    let list: List = new List();
    list.fields = ["PageId", "PageTitle", "ParentId"];
    list.PageName = "Pages";
    list.filter = ["Active eq 1 and PageId eq " + parentId];
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0)

          if (this.loop == 0 && data.value[0].ParentId > 0) {
            this.loop = 1
            this.GetParentPage(data.value[0].ParentId)
          }
          else
            this.ParentPage = data.value[0].PageTitle;
      });
  }
}
