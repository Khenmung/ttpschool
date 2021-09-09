import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { ApplicationfeatureComponent } from './applicationfeature/applicationfeature.component';
import { ApplicationpriceComponent } from './applicationprice/applicationprice.component';
import { CustomerappsComponent } from './customerapps/customerapps.component';
import { CustomerinvoiceComponent } from './customerinvoice/customerinvoice.component';
import { CustomerinvoicecomponentsComponent } from './customerinvoicecomponents/customerinvoicecomponents.component';
import { GlobaladminboardComponent } from './globaladminboard/globaladminboard.component';
import { ReportconfigdataComponent } from './reportconfigdata/reportconfigdata.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', component: GlobaladminboardComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GlobaladminRoutingModule { }
export const GlobalAdminComponents = [
  CustomerinvoicecomponentsComponent,
  CustomerappsComponent,
  CustomerinvoiceComponent,
  ApplicationpriceComponent,
  ApplicationfeatureComponent,
  CustomerinvoicecomponentsComponent,
  GlobaladminboardComponent,
  ReportconfigdataComponent
]