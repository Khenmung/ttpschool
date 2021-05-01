import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
//import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { NaomitsuService } from '../../../shared/databaseService'

//@Pipe({ name: 'safeHtml' })
@Component({

  selector: 'app-displaypage',
  templateUrl: './displaypage.component.html',
  styleUrls: ['./displaypage.component.scss']
})
export class DisplaypageComponent implements OnInit {
  images = ["assets/images/notebook.jpg",
    "assets/images/schoolbuilding2018.jfif",
    "assets/images/karatedance.png",
    "assets/images/sportteam.jpg",
    "assets/images/aothtaking.jpg",
    "assets/images/safetycampaign.JPG",
    "assets/images/childrendance.jpg"
  ];
  Name = {};
  ImgUrl = '';
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
    private route: Router,
    private cdref: ChangeDetectorRef
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
    this.ImgUrl = this.images[Math.floor(Math.random() * this.images.length)];
    // this.ar.data.subscribe(data=>{
    //   this.Name = data;
    // })
    //console.log('name',this.Name);
    // this.images=["assets/images/notebook.jpg",
    //         "assets/images/schoolbuilding2018.jfif",
    //         "assets/images/25years.png"
    //       ];
    //      this.imgRand();
    this.ar.paramMap.subscribe(params => {
      this.pId = +params.get("pid");
      this.GetLatestPage(params.get('phid'));
    })
  }
  ngAfterContentChecked() {
    //this.imgRand();
    //this.cdref.detectChanges();
    //this.ImgUrl = this.images[Math.floor(Math.random() * this.images.length)];

  }
  imgRand() {
    this.ImgUrl = this.images[Math.floor(Math.random() * this.images.length)];
    //return img;
  }
  back() {
    if (this.GroupId == 0)
      this.route.navigate(['/home']);
    else
      this.route.navigate(['/home/about/' + this.GroupId]);
  }
  GetLatestPage(pHistoryId) {
    debugger;
    let IdtoDisplay = pHistoryId;
    //let pages: any[];
    let filterstring = '';
    if (pHistoryId == 0)
      filterstring = "Active eq 1 and HomePage eq 1";
    else
      filterstring = "Active eq 1 and PageId eq " + this.pId;

    let list: List = new List();
    list.fields = [
      "link", "PageId", "ParentId", "PhotoPath",
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
            ///home/display/44/87
            IdtoDisplay = +pagetodisplay[0].link.split('/')[3];
          }
          if (pagetodisplay[0].PhotoPath == "" || pagetodisplay[0].PhotoPath == null)
            this.ImgUrl = this.images[Math.floor(Math.random() * this.images.length)];
          else
            this.ImgUrl = globalconstants.apiUrl + "/Image/PagePhoto/" + pagetodisplay[0].PhotoPath;
          //console.log('imgurl',this.ImgUrl);

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
