import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { ApplicationpriceComponent } from './applicationprice/applicationprice.component';
import { CustomerinvoiceComponent } from './customerinvoice/customerinvoice.component';
import { CustomerinvoicecomponentsComponent } from './customerinvoicecomponents/customerinvoicecomponents.component';
import { InvoiceboardComponent } from './invoiceboard/invoiceboard.component';
import { ReportConfigItemComponent } from './reportconfigitem/reportconfigitem.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      { path: "", component: InvoiceboardComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GlobaladmininvoiceRoutingModule { }
export const GlobaladmininvoiceComponents = [
  ApplicationpriceComponent,
  CustomerinvoiceComponent,
  CustomerinvoicecomponentsComponent,
  ReportConfigItemComponent,
  InvoiceboardComponent
]

