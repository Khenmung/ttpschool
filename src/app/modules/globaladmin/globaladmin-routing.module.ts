import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { ApplicationpriceComponent } from '../globaladmininvoice/applicationprice/applicationprice.component';
import { CustomerPlansComponent } from './customerplans/customerplans.component';
import { CustomerinvoiceComponent } from '../globaladmininvoice/customerinvoice/customerinvoice.component';
import { CustomerinvoicecomponentsComponent } from '../globaladmininvoice/customerinvoicecomponents/customerinvoicecomponents.component';
import { GlobaladminboardComponent } from './globaladminboard/globaladminboard.component';
import { MenuConfigComponent } from './menu-config/menu-config.component';
import { ReportConfigItemComponent } from '../globaladmininvoice/reportconfigitem/reportconfigitem.component';
import { PlansComponent } from './plans/plans.component';
import { PlanFeatureComponent } from './planfeature/planfeature.component';
import { AdminrolepermissionComponent } from './adminrolepermission/adminrolepermission.component';
import { InvoiceboardComponent } from '../globaladmininvoice/invoiceboard/invoiceboard.component';

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
  CustomerPlansComponent,
  CustomerinvoiceComponent,
  ApplicationpriceComponent,
  CustomerinvoicecomponentsComponent,
  GlobaladminboardComponent,
  ReportConfigItemComponent,
  MenuConfigComponent,
  PlansComponent,
  PlanFeatureComponent,
  AdminrolepermissionComponent,
  InvoiceboardComponent
]