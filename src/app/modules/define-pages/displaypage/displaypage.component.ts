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
  Name={};
  loading: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 50;
  GroupId: number;
  pId: number;
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
    //console.log('window', window.location.href);
    this.loading = true;
    this.GroupId = 0;
    this.ar.queryParamMap.subscribe(params => {
      this.GroupId = +params.get("GroupId");
     
    });
    // this.ar.data.subscribe(data=>{
    //   this.Name = data;
    // })
    //console.log('name',this.Name);
    this.ar.paramMap.subscribe(params => {
      this.pId = +params.get("pid");
      this.GetLatestPage(params.get('phid'));
    })
  }
  back() {
    if (this.GroupId == 0)
      this.route.navigate(['/']);
    else
      this.route.navigate(['/about/' + this.GroupId]);
  }
  GetLatestPage(pHistoryId) {
    debugger;
    let IdtoDisplay = pHistoryId;
    let pages: any[];
    let filterstring = '';
    if (pHistoryId == 0)
      filterstring = "Active eq 1 and HomePage eq 1";
    else
      filterstring = "Active eq 1 and PageId eq " + this.pId;

    let list: List = new List();
    list.fields = [
      "link", "PageId", "ParentId",
      "PageTitle", "HomePage", "FullPath",
      "PageHistories/PageBody",
      "PageHistories/PageHistoryId",
      "PageHistories/ParentPageId"];
    list.lookupFields = ["PageHistories"];
    list.PageName = "Pages";
    list.filter = [filterstring];

    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          let pagetodisplay = [...data.value];
          if (IdtoDisplay == 0) {
            IdtoDisplay = +pagetodisplay[0].link.split('/')[2].split('?')[0];
          }

          this.PageBody = pagetodisplay[0].PageHistories.filter(h => h.PageHistoryId == IdtoDisplay)[0].PageBody;
          this.ParentPage = pagetodisplay[0].FullPath;
          this.Title = pagetodisplay[0].PageTitle;
          this.loading = false;
        }
      })

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
