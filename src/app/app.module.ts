import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatConfirmDialogComponent } from './shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MaterialModule } from './shared/material/material.module';
import { AuthTokenInterceptors } from './interceptors/auth.token.interceptors';
import { AuthService } from './_services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { SharedataService } from './shared/sharedata.service';

@NgModule({
  declarations: [
    AppComponent,
    MatConfirmDialogComponent,
    NotfoundComponent
  ],
  imports: [
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    MaterialModule    
  ],
  exports: [
    NotfoundComponent
  ],
  providers: [
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptors,
      multi: true
    },
    //SharedataService,
    AuthService, 
    AuthGuard
  
  ],
  bootstrap: [AppComponent],
  entryComponents: [MatConfirmDialogComponent
  ]
})
export class AppModule { }