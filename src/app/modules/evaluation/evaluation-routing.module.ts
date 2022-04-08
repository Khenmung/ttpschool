import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { ClassEvaluationComponent } from './classevaluation/classevaluation.component';
import { ClassEvaluationOptionComponent } from './classevaluationoption/classevaluationoption.component';
import { EvaluationClassSubjectMapComponent } from './evaluationclasssubjectmap/EvaluationClassSubjectMap.component';
import { EvaluationboardComponent } from './evaluationboard/evaluationboard.component';
import { EvaluationandExamComponent } from './evaluationandexam/evaluationandexam.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      {
        path: "", component: EvaluationboardComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EvaluationRoutingModule { }
export const EvaluationComponents = [
  ClassEvaluationComponent,
  ClassEvaluationOptionComponent,
  EvaluationClassSubjectMapComponent,
  EvaluationboardComponent,  
  EvaluationandExamComponent
];

