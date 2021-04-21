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
import { SharedModule } from './shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthModule } from './modules/auth/auth.module';

@NgModule({
  declarations: [
    AppComponent,
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
    AuthModule, 
    SharedModule    
  ],
  exports:[SharedModule,
    CdkCopyToClipboard,
    ],
  providers: [DatePipe],//,authInterceptorProviders],
  bootstrap: [AppComponent],
  entryComponents: [MatConfirmDialogComponent
  ]
})
export class AppModule { }