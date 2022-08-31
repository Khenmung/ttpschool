import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { GenerateCertificateComponent } from './generatecertificate/generatecertificate.component';
import { SportsResultComponent } from './sportsresult/sportsresult.component';
import { StudentactivityboardComponent } from './studentactivityboard/studentactivityboard.component';
import { StudentactivityhomeComponent } from './studentactivityhome/studentactivityhome.component';
import { StudentfamilynfriendComponent } from './studentfamilynfriend/studentfamilynfriend.component';
import { StudentDocumentComponent } from './uploadstudentdocument/uploadstudentdoc.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent,canActivate:[AuthGuard],
    children: [
      { path: '', component: StudentactivityboardComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentactivityRoutingModule { }
export const StudentActivityComponents=[
  SportsResultComponent,
  GenerateCertificateComponent,
  StudentDocumentComponent,
  StudentactivityhomeComponent,
  StudentactivityboardComponent,
  StudentfamilynfriendComponent
]
