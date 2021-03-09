import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFileDropModule } from 'ngx-file-drop';
import { FiledragAndDropComponent } from './filedrag-and-drop/filedrag-and-drop.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [FiledragAndDropComponent],
  imports: [
    CommonModule,
    NgxFileDropModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  exports:[NgxFileDropModule]

})
export class FilesModule { }
