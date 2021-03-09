import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cropNUploadphotoComponent } from './cropNuploadphoto/cropNuploadphoto.component';
import { CarouselComponent } from './carousel/carousel.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card'
import { RadioButtonModule } from 'primeng/radiobutton';
import { PhotobrowserComponent } from './photobrowser/photobrowser.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ImgDragAndDropComponent  } from './imgDragAndDrop/imgDragAndDrop'
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AlbumsComponent } from './albums/albums.component';
import {Ng2ImgMaxModule} from 'ng2-img-max';
import { PhotosComponent } from './photos/photos.component';
import {NgxPhotoEditorModule} from "ngx-photo-editor";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FlexLayoutModule } from '@angular/flex-layout';
@NgModule({
  declarations: [
    cropNUploadphotoComponent, 
    CarouselComponent, 
    AlbumsComponent,
    CarouselComponent, 
    PhotobrowserComponent,
    ImgDragAndDropComponent,
    PhotosComponent,
    ],
  imports: [
    CommonModule ,
    NgbModule ,
    HttpClientModule,
    FormsModule, 
    ReactiveFormsModule,
    ImageCropperModule,
    MatFormFieldModule,
    MatCardModule,
    RadioButtonModule,
    NgxDropzoneModule,
    MatInputModule,
    RouterModule,
    MaterialModule,
    SharedModule,
    Ng2ImgMaxModule,
    NgxPhotoEditorModule,
    MatProgressBarModule,
    FlexLayoutModule
  ],
  exports:[
    cropNUploadphotoComponent,
    ImageCropperModule,
    MatFormFieldModule,
    ImgDragAndDropComponent,
    AlbumsComponent
  ],
  providers:[]
})
export class PhotogalleryModule { }
