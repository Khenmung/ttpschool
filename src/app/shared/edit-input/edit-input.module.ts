import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditInputComponent } from './edit-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [EditInputComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports:[EditInputComponent]

})
export class EditInputModule { }
