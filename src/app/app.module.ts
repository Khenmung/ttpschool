import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './shared/material/material.module';
import { SharedModule } from './shared/shared.module';
import { HomeModule } from './shared/components/home/home.module';
import { RouterModule } from '@angular/router';
import { DefinePagesModule } from './modules/define-pages/define-pages.module';
import { PhotogalleryModule } from './modules/photogallery/photogallery.module';
import { NotfoundComponent } from './modules/notfound/notfound.component';
import { DatePipe } from '@angular/common';
import { MatConfirmDialogComponent } from './shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthModule } from './modules/auth/auth.module';
import { ContactModule } from './modules/contact/contact.module';
import { authInterceptorProviders } from './_helpers/auth.interceptors';
import { FiledragAndDropComponent } from './modules/files/filedrag-and-drop/filedrag-and-drop.component';
import { FilesModule } from './modules/files/files.module';
import { StudentsModule } from './modules/FeesManagement/FeesManagement.module';
@NgModule({
  declarations: [
    AppComponent,   
    NotfoundComponent],
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MaterialModule,
    SharedModule,
    HomeModule,
    DefinePagesModule,
    PhotogalleryModule,
    NgbModule,
    AuthModule,
    ContactModule,
    FilesModule,
    StudentsModule
    //NgMaterialMultilevelMenuModule
    //NewsdashboardModule   
  ],
  providers: [DatePipe],//,authInterceptorProviders],
  bootstrap: [AppComponent],
  entryComponents:[MatConfirmDialogComponent]
})
export class AppModule { }