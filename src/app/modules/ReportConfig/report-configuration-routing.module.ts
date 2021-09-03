import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { OrgreportcolumnsComponent } from './orgreportcolumns/orgreportcolumns.component';
import { OrgReportNamesComponent } from './OrgReportNames/OrgReportNames.component';
import { ReportconfigboardComponent } from './reportconfigboard/reportconfigboard.component';
import { ReportconfigdataComponent } from './reportconfigdata/reportconfigdata.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', component: ReportconfigboardComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportConfigurationRoutingModule { }
export const ReportConfigComponents = [
  OrgReportNamesComponent,
  ReportconfigdataComponent,
  ReportconfigboardComponent,
  OrgreportcolumnsComponent
]
