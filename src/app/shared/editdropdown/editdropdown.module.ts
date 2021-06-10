import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditdropdownComponent } from './editdropdown.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [EditdropdownComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports:[EditdropdownComponent]

})
export class EditDropdownModule { }
