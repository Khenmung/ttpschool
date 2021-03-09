import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CKEditorModule } from 'ng2-ckeditor';
import { TextEditorComponent } from './texteditor/texteditor.component';
import { pageDashboardComponent } from './pageDashboard/pageDashboard.component';
import { pageViewComponent } from './pageView/pageView.component';
import {MaterialModule } from '../../shared/material/material.module';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DisplaypageComponent } from './displaypage/displaypage.component';
//import {MatTableDataSource} from '../../shared/material/material.module';
import { EncodeHTMLPipe } from '../../encode-html.pipe'
import { SharedModule} from '../../shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { NewsdashboardComponent } from './newsdashboard/newsdashboard.component';
import { RouterModule } from '@angular/router';
import { MenuConfigComponent } from './menu-config/menu-config.component';
import { FlexLayoutModule } from '@angular/flex-layout';
  
//import { MatBadgeModule } from '@angular/material/badge';
//import {MatAutocompleteModule} from '@angular/material/autocomplete'

@NgModule({
  declarations: [
    TextEditorComponent,
    pageDashboardComponent,
    pageViewComponent,
    DisplaypageComponent,
    EncodeHTMLPipe,
    NewsdashboardComponent,
    MenuConfigComponent,
  ],
  imports: [
    CommonModule,
    CKEditorModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SharedModule,
    MatFormFieldModule,
    MatCardModule,
    RouterModule,
    FlexLayoutModule,
 
  ],
  exports:[
    TextEditorComponent,
    pageDashboardComponent,
    pageViewComponent,
    MaterialModule,
    MatFormFieldModule,
    MatCardModule
//    AlertComponent
  ]
})
export class DefinePagesModule { }
