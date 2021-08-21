import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { reportshomeComponent } from './reportshome/reportshome.component';
import { TodayCollectionComponent } from './schoolreports/today-collection/today-collection.component';
import { FeecollectionreportComponent } from './schoolreports/feecollectionreport/feecollectionreport.component';
import { ResultsComponent } from './schoolreports/results/results.component';
import { ResultboardComponent } from './schoolreports/resultboard/resultboard.component';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { ExamtimetableComponent } from './schoolreports/examtimetable/examtimetable.component';

const routes: Routes = [{
  path: '', component: HomeComponent,
  children: [
    { path: '', component: ResultboardComponent },
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
  FeecollectionreportComponent,
  ResultsComponent,
  ResultboardComponent,
  ExamtimetableComponent
]