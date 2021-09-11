import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { ClassboardComponent } from './classboard/classboard.component';
import { ClassdetailComponent } from './classdetail/classdetail.component';
import { ClassprerequisiteComponent } from './classprerequisite/classprerequisite.component';
import { ClassmasterdashboardComponent } from './classsmastermapping/classmasterdashboard.component';
import { DashboardclassfeeComponent } from './dashboardclassfee/dashboardclassfee.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', component: ClassboardComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClassesRoutingModule { }
export const ClassesComponents = [
  ClassdetailComponent,
  DashboardclassfeeComponent,
  ClassboardComponent,
  ClassprerequisiteComponent,
  ClassmasterdashboardComponent
]
