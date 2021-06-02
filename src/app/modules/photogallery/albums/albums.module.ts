import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumsComponent } from './albums.component';
import {ClipboardModule} from '@angular/cdk/clipboard'
import { MaterialModule } from '../../../shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditInputModule } from 'src/app/shared/edit-input/edit-input.module';

@NgModule({
  declarations: [AlbumsComponent,
    ],
  imports: [
    CommonModule,
    ClipboardModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    EditInputModule
    
  ],
  exports:[
    AlbumsComponent,
  ]
})
export class AlbumsModule { }
