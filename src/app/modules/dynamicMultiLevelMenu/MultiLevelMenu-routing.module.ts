import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiLevelMenuComponent } from './MultiLevelMenu.component';

const routes: Routes = [
  {
    // path: 'pages',
    // component: MultiLevelMenuComponent,
    // children: [
    //   { path: "phid", component: MultiLevelMenuComponent }
    // ]
  },
];

@NgModule({
  //imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpandCollapseRoutingModule { }