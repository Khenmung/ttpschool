import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NaomitsuService } from '../../../shared/databaseService';
import { List, IPage } from 'src/app/shared/interface';
import { SharedataService } from '../../../shared/sharedata.service';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
//import { FormsModule} from '@angular/forms';
@Component({

  selector: 'app-text-editor',

  templateUrl: './texteditor.component.html',

  styleUrls: ['./texteditor.component.scss']

})

export class TextEditorComponent implements OnInit {
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  PageDetail = {
    PageId: 0,
    PageTitle: '',
    ParentId: 0,
    CurrentVersion: 0,
    UpdateDate: new Date(),
    IsTemplate: 1,
    HasSubmenu: 1,
    label: '',
    link: '',
    Active: 1
  };
  PublishOrDraft: number = 0;
  PageDetailForm = new FormGroup({
    PageTitle: new FormControl('', [Validators.required, Validators.maxLength(25)]),
    ParentId: new FormControl(0),
    PageBody: new FormControl(""),
    PageHistoryId: new FormControl(0),
    Published: new FormControl(0),
    HasSubmenu: new FormControl(false),
    PageId: new FormControl(0),
    link: new FormControl('')
  });
  PageHistory = {
    PageHistoryId: 0,
    PageBody: '',
    Version: 0,
    ParentPageId: 0,
    Published: 0,
    UpdateDate: new Date(),
    CreatedDate: new Date()
  }
  selected: number = 0;
  PageGroups: any;
  Id: number = 0;
  PageHistoryId: number = 0;
  name = 'ng2-ckeditor';
  ckeConfig: any;
  mycontent: string = '';
  log: string = ''
  res: any;
  loading=false;
  constructor(private naomitsuService: NaomitsuService,
    private router: Router,
    private ar: ActivatedRoute,
    private shareddata: SharedataService,
    protected alert: AlertService,
    private tokenStorage: TokenStorageService) {
    //this.PageDetail =[];
  }

  get f() { return this.PageDetailForm.controls; }

  ngOnInit() {
    this.loading=true;
    this.checklogin();
    this.GetParentPage();
    debugger;
    this.ar.queryParamMap
      .subscribe((params) => {
        this.Id = this.ar.snapshot.params.id;

        if (this.Id != undefined) {
          this.GetLatestPage(this.Id);
        }
        this.ckeConfig = {
          allowedContent: false,
          extraPlugins: 'divarea',
          forcePasteAsPlainText: false,
          removeButtons : 'About',
          scayt_autoStartup:true,
          autoGrow_onStartup:true,
          autoGrow_minHeight: 500,
          autoGrow_maxHeight: 600
        };
      });
  }
  ngAfterViewInit(){
    this.loading=false;
  }
  dashboard() {
    this.router.navigate(['/pages']);
  }
 
  GetLatestPage(ppId: number) {

    let list: List = new List();
    list.fields = ["PageHistoryId", "PageBody", "Version", "Published", "Page/HasSubmenu", "Page/PageTitle", "Page/link"];
    list.PageName = "PageHistories";
    list.lookupFields = ["Page"];
    list.filter = ["ParentPageId eq " + ppId];
    list.orderBy = "PageHistoryId desc";
    list.limitTo = 1;
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.PageDetailForm.patchValue({
            PageTitle: data.value[0].Page.PageTitle,
            ParentId: +this.ar.snapshot.queryParams.pgid,
            PageBody: data.value[0].PageBody,
            PageHistoryId: data.value[0].PageHistoryId,
            Version: data.value[0].Version,
            Published: data.value[0].Published,
            HasSubmenu: data.value[0].Page.HasSubmenu,
            link: data.value[0].Page.link,
            PageId: ppId
          });
          //this.selected = this.ar.snapshot.queryParams.pgid;          
          //this.PageDetailForm.controls.PageGroupId.patchValue(this.ar.snapshot.queryParams.pgid);
        }
      });
  }
  checklogin() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    let token = this.tokenStorage.getToken();

    if (token == null) {
      this.alert.error("Access denied! login required.", options);
      this.router.navigate(['/']);
    }
  }
  onSaveAsDraft() {
    this.PublishOrDraft = 0;
    this.onSave();
  }
  onSubmit() {
    this.PublishOrDraft = 1;
    this.onSave();
  }
  onSave() {
    debugger;
    //console.log('to update', this.PageDetailForm.value)
    if (this.Id == undefined) {
      this.insert();
    }
    else {
      //if save as draft is clicked & the latest is published.
      if (this.PageDetailForm.get("Published").value == 1 && this.PublishOrDraft == 0)
        this.insert();
      else
        this.Update();
    }
  }
  insert() {
    let active = 1;
    let duplicate = [];
    if (this.Id == undefined) {
      duplicate = this.PageGroups.filter(ele => {
        return ele.ParentId == this.PageDetailForm.value.ParentId
          && ele.PageTitle == this.PageDetailForm.value.PageTitle
      })
      if (this.PublishOrDraft == 0)
        active = 0;
    }
    if (duplicate.length > 0) {
      this.alert.error('There is already a page named ' + this.PageDetailForm.value.PageTitle, this.options);
    }
    else {
      this.PageDetail.PageTitle = this.PageDetailForm.value.PageTitle;// .get("PageTitle").value;
      this.PageDetail.label = this.PageDetailForm.value.PageTitle;
      this.PageDetail.link = this.PageDetailForm.value.link;
      this.PageDetail.ParentId = this.PageDetailForm.value.ParentId;//").value;
      this.PageDetail.Active = active;
      this.PageDetail.CurrentVersion = 1;
      this.PageDetail.UpdateDate = new Date();
      this.PageDetail.HasSubmenu = this.PageDetailForm.value.HasSubmenu == true ? 1 : 0;
      let mode: 'patch' | 'post' = 'post';

      //if save as draft the Pages should be updated but histories to be inserted.
      if (this.Id != undefined) {
        mode = 'patch'
        this.PageDetail.PageId = this.Id;
      }
      else {
        mode = 'post';
        this.PageDetail.PageId = 0;
      }
      this.naomitsuService.postPatch('Pages', this.PageDetail, this.PageDetail.PageId, mode)
        .subscribe(
          (page: any) => {
            let pageId = page == null ? this.PageDetail.PageId : page.PageId;

            this.PageHistory.PageHistoryId = this.PageDetailForm.get("PageHistoryId").value;
            this.PageHistory.PageBody = this.PageDetailForm.get("PageBody").value;
            this.PageHistory.CreatedDate = new Date();
            this.PageHistory.UpdateDate = new Date();
            this.PageHistory.Published = this.PublishOrDraft;
            this.PageHistory.Version = 1;
            this.PageHistory.ParentPageId = pageId;
            this.naomitsuService.postPatch('PageHistories', this.PageHistory, 0, 'post')
              .subscribe(
                (history: any) => {
                  this.alert.success("Data saved successfully", this.options);
                  debugger;
                  if (this.PublishOrDraft == 1) {
                    if (this.PageDetailForm.value.PageTitle.toUpperCase().includes("NEWS"))
                      this.PageDetail.link = '/about/' + this.Id
                    else
                      this.PageDetail.link = '/display/' + history.PageHistoryId;

                    delete this.PageDetail.PageId;
                    this.naomitsuService.postPatch('Pages', this.PageDetail, pageId, 'patch')
                      .subscribe(
                        (data: any) => {

                        }, (error) => {
                          console.log(error);
                        })
                  }
                  this.router.navigate(['/pages']);
                }, (error) => {
                  console.log('update histories', error);
                });
          },
          (error) => {
            console.log('update pages', error);
          });
    }
  }
  Update() {
    let duplicate = this.PageGroups.filter(ele => {
      return ele.ParentId == this.PageDetailForm.value.ParentId
        && ele.PageTitle == this.PageDetailForm.value.PageTitle
        && ele.PageId != this.Id

    })
    if (duplicate.length > 0) {
      this.alert.error('There is already a page named ' + this.PageDetailForm.value.PageTitle, this.options);
    }
    else {
      this.PageDetailForm.patchValue(
        {
          PageLeft: "",
          PageRight: "",
          PageFooter: "",
          Published: this.PublishOrDraft
        });

      this.PageDetail.PageTitle = this.PageDetailForm.value.PageTitle;// .get("PageTitle").value;
      this.PageDetail.label = this.PageDetailForm.value.PageTitle;
      debugger;
      this.PageDetail.HasSubmenu = this.PageDetailForm.value.HasSubmenu == true ? 1 : 0;

      ///if it has no sub menu, link has to be defined only when it is published.
      if (this.PublishOrDraft == 1) {
        if (this.PageDetailForm.value.PageTitle.toUpperCase().includes("NEWS"))
          this.PageDetail.link = '/about/' + this.Id
        else
          this.PageDetail.link = '/display/' + this.PageDetailForm.get("PageHistoryId").value;
      }
      else
        this.PageDetail.link = this.PageDetailForm.value.link;

      this.PageDetail.ParentId = this.PageDetailForm.value.ParentId;//").value;

      // if (this.PageDetailForm.value.ParentId > 0)


      this.PageDetail.Active = 1;
      this.PageDetail.CurrentVersion = this.PageHistory.Version + 1;
      this.PageDetail.UpdateDate = new Date();
      delete this.PageDetail.PageId;
      this.naomitsuService.postPatch('Pages', this.PageDetail, this.Id, 'patch')
        .subscribe(
          (data: any) => {
            this.PageHistory.PageHistoryId = this.PageDetailForm.get("PageHistoryId").value;
            this.PageHistory.PageBody = this.PageDetailForm.get("PageBody").value;
            this.PageHistory.CreatedDate = new Date();
            this.PageHistory.UpdateDate = new Date();
            this.PageHistory.Published = this.PublishOrDraft;
            this.PageHistory.Version = this.PageHistory.Version + 1;
            this.PageHistory.ParentPageId = this.Id;

            this.naomitsuService.postPatch('PageHistories', this.PageHistory, this.PageHistory.PageHistoryId, 'patch')
              .subscribe(
                (data: any) => {
                  this.alert.success("Data updated Successfully", this.options);
                  this.router.navigate(['/pages']);
                });
          });
    }
  }
  GetParentPage() {
    let list: List = new List();
    list.fields = ["PageId", "PageTitle", "ParentId"];
    list.PageName = "Pages";
    list.filter = ["Active eq 1"];
    list.orderBy = "ParentId";

    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        this.PageGroups = data.value;
        //console.log(this.PageGroups);
      });

  }

}    