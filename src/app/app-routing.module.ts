import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './shared/components/home/home.component';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';

const routes: Routes = [
  // {
  //   path: '',component:HomeComponent
  // },
  {
    path: '',
    loadChildren: () => import('./modules/website.module').then(m => m.WebsiteModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/FeesManagement/FeesManagement.module').then(m => m.FeesmanagementModule)
  },
  { path: '**', component: NotfoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    //  ExpandCollapseRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }