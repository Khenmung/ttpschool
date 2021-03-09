import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { ContactComponent } from './addMessage/contact.component';
import { MaterialModule } from '../../shared/material/material.module';
import { ContactdashboardComponent } from './contactdashboard/contactdashboard.component';


@NgModule({
  declarations: [ContactComponent, ContactdashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports:[ContactComponent,ContactdashboardComponent]
})
export class ContactModule { }
