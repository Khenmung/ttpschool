import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { pageDashboardComponent } from './modules/define-pages/pageDashboard/pageDashboard.component';
import { TextEditorComponent } from './modules/define-pages/texteditor/texteditor.component';
import { pageViewComponent } from './modules/define-pages/pageView/pageView.component';
import { HomeComponent } from './layout/home/home.component';
import { HomeComponent as authHomeComponent } from './modules/auth/home/home.component';
import { CarouselComponent } from './modules/photogallery/carousel/carousel.component';
import { cropNUploadphotoComponent } from './modules/photogallery/cropNuploadphoto/cropNuploadphoto.component';
import { DisplaypageComponent } from './modules/define-pages/displaypage/displaypage.component';
import { NotfoundComponent } from './modules/notfound/notfound.component';
import { ImgDragAndDropComponent } from './modules/photogallery/imgDragAndDrop/imgDragAndDrop'
import { PhotobrowserComponent } from './modules/photogallery/photobrowser/photobrowser.component';
import { AlbumsComponent } from './modules/photogallery/albums/albums.component';
import { PhotosComponent } from './modules/photogallery/photos/photos.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { ProfileComponent } from './modules/auth/profile/profile.component';
import { ContactdashboardComponent } from './modules/contact/contactdashboard/contactdashboard.component';
import { ContactComponent } from './modules/contact/addMessage/contact.component';
import { NewsdashboardComponent } from './modules/define-pages/newsdashboard/newsdashboard.component';
import { MenuConfigComponent } from './modules/define-pages/menu-config/menu-config.component';
import { ChangePasswordComponent } from './modules/auth/change-password/change-password.component';
import { FiledragAndDropComponent } from './modules/files/filedrag-and-drop/filedrag-and-drop.component';
import { AddstudentComponent } from './modules/FeesManagement/student/addstudent/addstudent.component';
import { FeesmanagementhomeComponent } from './modules/FeesManagement/feesmanagementhome/feesmanagementhome.component';
import { AddstudentclassComponent } from './modules/FeesManagement/studentclass/addstudentclass/addstudentclass.component';
import { AddclassfeeComponent } from './modules/FeesManagement/classfee/addclassfee/addclassfee.component';
import { DashboardclassfeeComponent } from './modules/FeesManagement/classfee/dashboardclassfee/dashboardclassfee.component';
import { DashboardstudentComponent } from './modules/FeesManagement/student/dashboardstudent/dashboardstudent.component';
import { AddstudentfeepaymentComponent } from './modules/FeesManagement/studentfeepayment/addstudentfeepayment/addstudentfeepayment.component';

const routes: Routes = [{
  path: '', component: HomeComponent,
  children:
    [
      { path: '', redirectTo: 'display/0', pathMatch: 'full' },
      { path: 'photocarousel',component: CarouselComponent },
      // { path: 'photocarousel', 
      //   loadChildren:()=> import('./modules/photogallery/carousel/carousel.component').then(m=>m.CarouselComponent)
      // },
      { path: 'uploadphoto', component: cropNUploadphotoComponent },
      { path: 'browsephoto', component: PhotobrowserComponent },
      { path: 'editor', component: TextEditorComponent },
      { path: 'page/:id', component: TextEditorComponent },
      { path: 'pages/:id', component: pageDashboardComponent },
      { path: 'pages', component: pageDashboardComponent },
      { path: 'display/:phid', component: DisplaypageComponent },
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
},
{
  path: 'auth', component: authHomeComponent,
  children: [ 
    { path: 'login', component: LoginComponent },
    { path: 'changepassword', component: ChangePasswordComponent },
    { path: 'createlogin', component: RegisterComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'user', component: CarouselComponent },
    { path: '', redirectTo: 'auth', pathMatch: 'full' },
    { path: '**', component: NotfoundComponent }
  ]
},
{
  path: 'admin', component: FeesmanagementhomeComponent,
  children: [ 
    { path: 'addstudent', component: AddstudentComponent },
    { path: 'addstudent/:id', component: AddstudentComponent },
    { path: 'addstudentcls', component: AddstudentclassComponent },
    { path: 'addclassfee', component: AddclassfeeComponent },
    { path: 'addstudentfeepayment/:id', component: AddstudentfeepaymentComponent },
    { path: 'dashboardclassfee', component: DashboardclassfeeComponent },
    { path: 'dashboardstudent', component: DashboardstudentComponent },
    { path: '', redirectTo: 'auth', pathMatch: 'full' },
    { path: '**', component: NotfoundComponent }
  ]
},
{ path: '**', component: NotfoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    //  ExpandCollapseRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { } 