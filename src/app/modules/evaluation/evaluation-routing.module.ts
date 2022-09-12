import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { ClassEvaluationComponent } from './classevaluation/classevaluation.component';
import { ClassEvaluationOptionComponent } from './classevaluationoption/classevaluationoption.component';
import { EvaluationExamMapComponent } from './evaluationexammap/EvaluationExamMap.component';
import { EvaluationboardComponent } from './evaluationboard/evaluationboard.component';
import { EvaluationandExamComponent } from './evaluationandexam/evaluationandexam.component';
import { EvaluationMasterComponent } from './evaluationmaster/evaluationmaster.component';
import { EvaluationresultComponent } from './evaluationresult/evaluationresult.component';
import { QuestionbankComponent } from './questionbank/questionbank.component';
import { QuestionnexamComponent } from './questionnexam/questionnexam.component';

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
  EvaluationExamMapComponent,
  EvaluationboardComponent,
  EvaluationandExamComponent,
  EvaluationMasterComponent,
  EvaluationresultComponent,
  QuestionbankComponent,
  QuestionnexamComponent
];

