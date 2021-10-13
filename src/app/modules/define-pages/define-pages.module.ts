import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CKEditorModule } from 'ng2-ckeditor';
import { TextEditorComponent } from './texteditor/texteditor.component';
import { pageDashboardComponent } from './pageDashboard/pageDashboard.component';
import { pageViewComponent } from './pageView/pageView.component';
import { MaterialModule } from '../../shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DisplaypageComponent } from './displaypage/displaypage.component';
import { SharedModule } from '../../shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
//import { MenuConfigComponent } from '../globaladmin/menu-config/menu-config.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { AlbumsModule } from '../photogallery/albums/albums.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    TextEditorComponent,
    pageDashboardComponent,
    pageViewComponent,
    DisplaypageComponent,
    
  ],
  imports: [
    CommonModule,
    CKEditorModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    SharedhomepageModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterModule,
    FlexLayoutModule,
    
    AlbumsModule
  ],
  exports: [
    TextEditorComponent,
    pageDashboardComponent,
    pageViewComponent,
  ]
})
export class DefinePagesModule { }
