import { ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { DisplaypageComponent } from '../../define-pages/displaypage/displaypage.component';
import { NewsdashboardComponent } from '../../define-pages/newsdashboard/newsdashboard.component';
import { TextEditorComponent } from '../../define-pages/texteditor/texteditor.component';
import { AlbumsComponent } from '../albums/albums.component';
import { CarouselComponent } from '../carousel/carousel.component';
import { FiledragAndDropComponent } from '../filedrag-and-drop/filedrag-and-drop.component';
import { ImgDragAndDropComponent } from '../imgDragAndDrop/imgDragAndDrop';
import { PhotobrowserComponent } from '../photobrowser/photobrowser.component';
import { PhotosComponent } from '../photos/photos.component';

@Component({
  selector: 'app-photofileboard',
  templateUrl: './photofileboard.component.html',
  styleUrls: ['./photofileboard.component.scss']
})
export class PhotofileboardComponent implements OnInit {
    PageLoading = true;

  components = [
    AlbumsComponent,
    CarouselComponent,
    FiledragAndDropComponent,
    PhotosComponent,
    PhotobrowserComponent
  ];
  LoginUserDetail = [];
  tabNames = [
    { 'label': 'Plan', 'faIcon': '' },
    { 'label': 'Plan Feature', 'faIcon': '' },
    { 'label': 'Plan n Master', 'faIcon': '' },
    { 'label': 'Plan n Master', 'faIcon': '' },
    { 'label': 'Plan n Master', 'faIcon': '' },
  ];

  Permissions =
    {
      ParentPermission: '',
      PageViewPermission: '',
      PageDisplayPermission: '',
      PageEditorPermission: ''
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private contentservice: ContentService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }
  ngOnInit() { }
  public ngAfterViewInit(): void {
    debugger
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);

    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.website.website)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.website.album)
    var comindx = this.components.indexOf(AlbumsComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.website.carousel)
    var comindx = this.components.indexOf(CarouselComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.website.filedragAndDrop)
    var comindx = this.components.indexOf(FiledragAndDropComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.website.photobrowser)
    var comindx = this.components.indexOf(PhotobrowserComponent);
    this.GetComponents(perObj, comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.website.photo)
    var comindx = this.components.indexOf(PhotosComponent);
    this.GetComponents(perObj, comindx)
    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
    //if(1){ //(this.Permissions.ParentPermission != 'deny') {
    setTimeout(() => {
      this.renderComponent(0);
    }, 550);
    this.cdr.detectChanges();
    //}
  }
  GetComponents(perObj, comindx) {
    if (perObj.length > 0) {
      if (perObj[0].permission == 'deny') {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
      else {
        this.tabNames[comindx].faIcon = perObj[0].faIcon;
        this.tabNames[comindx].label = perObj[0].label;
      }
    }
    else {
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }
  }
  public tabChange(index: number) {
    //    //console.log("index", index)
    setTimeout(() => {
      this.renderComponent(index);
    }, 550);

  }
  selectedIndex = 0;


  private renderComponent(index: number): any {
    const factory = this.componentFactoryResolver.resolveComponentFactory<any>(this.components[index]);
    this.viewContainer.createComponent(factory);
    //ClassprerequisiteComponent this.componentFactoryResolver.resolveComponentFactory
  }
}



