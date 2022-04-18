import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './shared/material/material.module';
import { AuthService } from './_services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { authInterceptorProviders } from './_helpers/auth.interceptor';
import { ChartsModule } from 'ng2-charts';
import { MAT_DATE_LOCALE } from '@angular/material/core';
//import { MyFilterPipe } from './shared/FilterPipe';

@NgModule({
  declarations: [
    AppComponent,
    NotfoundComponent
  ],
  imports: [
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    MaterialModule,
    ChartsModule
  ],
  exports: [
    NotfoundComponent
  ],
  providers: [
    DatePipe,
    authInterceptorProviders,
    //SharedataService,
    AuthService, 
    AuthGuard,
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
    { provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  // providers: [
  //   {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
  // ],
  bootstrap: [AppComponent],

})
export class AppModule { }