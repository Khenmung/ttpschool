import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatConfirmDialogComponent } from './shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FeesmanagementModule } from './modules/FeesManagement/FeesManagement.module';
import { WebsiteModule } from './modules/website.module';
import { CdkCopyToClipboard, ClipboardModule } from '@angular/cdk/clipboard';
// import { EditInputComponent } from './shared/components/edit-input/edit-input.component';
// import { FeeManagementRoutingModule } from './modules/FeesManagement/fee-management-routing.module';
// import { WebsiteRoutingModule } from './modules/website-routing.module';
import { SharedModule } from './shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from './shared/components/alert/alert.component';
//import { HomeComponent } from './shared/components/home/home.component';
//import { HeaderComponent } from './shared/components/header/header.component';
//import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    //AlertComponent,
    //CdkCopyToClipboard,
    //EditInputComponent
    //HomeComponent,
    //HeaderComponent
  ],
  imports: [
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    FeesmanagementModule,
    WebsiteModule,    
    SharedModule    
  ],
  exports:[SharedModule,
    CdkCopyToClipboard,
    //AlertComponent,
    //SharedModule
    //EditInputComponent
    ],
  providers: [DatePipe],//,authInterceptorProviders],
  bootstrap: [AppComponent],
  entryComponents: [MatConfirmDialogComponent
  //  ,EditInputComponent
  ]
})
export class AppModule { }