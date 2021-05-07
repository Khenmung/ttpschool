import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
//import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatConfirmDialogComponent } from './shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { FeesmanagementModule } from './modules/FeesManagement/FeesManagement.module';
// import { WebsiteModule } from './modules/website.module';
// import {
//   CdkCopyToClipboard,
//   // ClipboardModule 
// } from '@angular/cdk/clipboard';
// import { SharedModule } from './shared/shared.module';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { AuthModule } from './modules/auth/auth.module';
// import { LandingpageModule } from './shared/components/landingpage/landingpage.module';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { HttpClientModule } from '@angular/common/http';
//import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './shared/material/material.module';

@NgModule({
  declarations: [
    AppComponent,
    MatConfirmDialogComponent,
    //CdkCopyToClipboard,
    NotfoundComponent

  ],
  imports: [
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    //  FormsModule,
    //  ReactiveFormsModule,
    // LandingpageModule,
    // FeesmanagementModule,
    // WebsiteModule,
    // AuthModule,
    //  SharedModule
    MaterialModule    
  ],
  exports: [
    //SharedModule,
    //CdkCopyToClipboard,
    NotfoundComponent
  ],
  providers: [DatePipe],//,authInterceptorProviders],
  bootstrap: [AppComponent],
  entryComponents: [MatConfirmDialogComponent
  ]
})
export class AppModule { }