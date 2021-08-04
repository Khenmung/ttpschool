import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { SharedModule } from 'primeng/api';
import { WebsiteComponents, WebsiteRoutingModule } from './website-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxFileDropModule } from 'ngx-file-drop';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//import { Ng2ImgMaxModule } from 'ng2-img-max';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxDropzoneModule } from 'ngx-dropzone';
import {NgxPhotoEditorModule} from "ngx-photo-editor";
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CKEditorModule } from 'ng2-ckeditor';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MaterialModule } from '../shared/material/material.module';
import { SharedhomepageModule } from './sharedhomepage.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AlbumsModule } from './photogallery/albums/albums.module';
import { DefinePagesModule } from './define-pages/define-pages.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [WebsiteComponents],
  imports: [
    CommonModule,
    NgxFileDropModule,    
    NgbModule ,    
    HttpClientModule,
    FormsModule, 
    ImageCropperModule,    
    NgxDropzoneModule,
    RouterModule,
    SharedModule,
    SharedhomepageModule,
    ReactiveFormsModule, 
    //Ng2ImgMaxModule,
    NgxPhotoEditorModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    CKEditorModule,
    MatTableModule,
    MatPaginatorModule,
    MatDividerModule,
    WebsiteRoutingModule,
    //ClipboardModule  
    MaterialModule,
    FlexLayoutModule,
    AlbumsModule,
    //SharedhomepageModule
    DefinePagesModule
    
  
  ],
  exports:[WebsiteComponents,FlexLayoutModule]
})
export class WebsiteModule { }
