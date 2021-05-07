import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumsComponent } from './albums.component';
import {ClipboardModule} from '@angular/cdk/clipboard'
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlbumEditInputComponent } from '../albumedit-input/albumedit-input.component';

@NgModule({
  declarations: [AlbumsComponent,
    AlbumEditInputComponent],
  imports: [
    CommonModule,
    ClipboardModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    
  ],
  exports:[
    AlbumsComponent,
    AlbumEditInputComponent
  ]
})
export class AlbumsModule { }
