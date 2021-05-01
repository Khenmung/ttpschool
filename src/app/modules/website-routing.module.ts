import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../shared/components/home/home.component';
import { NewsdashboardComponent } from './newsdashboard/newsdashboard.component';
import { ContactComponent } from './contact/addMessage/contact.component';
import { ContactdashboardComponent } from './contact/contactdashboard/contactdashboard.component';
import { DisplaypageComponent } from './define-pages/displaypage/displaypage.component';
import { MenuConfigComponent } from './define-pages/menu-config/menu-config.component';
import { pageDashboardComponent } from './define-pages/pageDashboard/pageDashboard.component';
import { pageViewComponent } from './define-pages/pageView/pageView.component';
import { TextEditorComponent } from './define-pages/texteditor/texteditor.component';
import { FiledragAndDropComponent } from './files/filedrag-and-drop/filedrag-and-drop.component';
import { AlbumsComponent } from './photogallery/albums/albums.component';
import { CarouselComponent } from './photogallery/carousel/carousel.component';
import { cropNUploadphotoComponent } from './photogallery/cropNuploadphoto/cropNuploadphoto.component';
import { ImgDragAndDropComponent } from './photogallery/imgDragAndDrop/imgDragAndDrop';
import { PhotobrowserComponent } from './photogallery/photobrowser/photobrowser.component';
import { PhotosComponent } from './photogallery/photos/photos.component';
import { EncodeHTMLPipe } from '../encode-html.pipe';
import { AlbumEditInputComponent } from './photogallery/albumedit-input/albumedit-input.component';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { LandingpageComponent } from '../shared/components/landingpage/landingpage.component';

const routes: Routes = [
  
  {path: '', component: HomeComponent,
  children:
    [
      { path: '',redirectTo:'display/0/0',pathMatch:'full'},  
      { path: 'display/:phid/:pid', component: DisplaypageComponent },
      { path: 'photocarousel', component: CarouselComponent },
      { path: 'uploadphoto', component: cropNUploadphotoComponent },
      { path: 'browsephoto', component: PhotobrowserComponent },
      { path: 'editor', component: TextEditorComponent },
      { path: 'page/:id', component: TextEditorComponent },
      { path: 'pages/:id', component: pageDashboardComponent },
      { path: 'pages', component: pageDashboardComponent },      
      { path: 'details', component: pageViewComponent },
      { path: 'dragdrop', component: ImgDragAndDropComponent },
      { path: 'filedragdrop', component: FiledragAndDropComponent },
      { path: 'photos', component: PhotosComponent },
      { path: 'managefile', component: AlbumsComponent },
      { path: 'messages', component: ContactdashboardComponent },
      { path: 'addmessage', component: ContactComponent },
      { path: 'message/:id', component: ContactComponent },
      { path: 'about/:parentid', component: NewsdashboardComponent },
      { path: 'config', component: MenuConfigComponent },
    ]
  }
];

@NgModule({
  //declarations:[]
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebsiteRoutingModule { }
export const WebsiteComponents=[
  CarouselComponent,
  cropNUploadphotoComponent ,
  PhotobrowserComponent ,
  TextEditorComponent ,
  pageDashboardComponent ,
  DisplaypageComponent,
  pageViewComponent,
  ImgDragAndDropComponent,
  FiledragAndDropComponent,
  PhotosComponent,
  AlbumsComponent,
  ContactdashboardComponent,
  ContactComponent,
  MenuConfigComponent ,
  EncodeHTMLPipe,
  AlbumEditInputComponent,
  CdkCopyToClipboard,  
]
