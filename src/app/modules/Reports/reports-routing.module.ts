import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { reportshomeComponent } from './reportshome/reportshome.component';
import { TodayCollectionComponent } from './schoolreports/today-collection/today-collection.component';
import { FeecollectionreportComponent } from './schoolreports/feecollectionreport/feecollectionreport.component';

const routes: Routes = [{
  path: '', component: reportshomeComponent,
  children: [
   
    { path: 'collectionreport', component: TodayCollectionComponent },
    { path: 'feepaymentreport', component: FeecollectionreportComponent },

  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolReportsRoutingModule { }
export const SchoolReportsComponent = [
  reportshomeComponent,
  TodayCollectionComponent,
  FeecollectionreportComponent
]