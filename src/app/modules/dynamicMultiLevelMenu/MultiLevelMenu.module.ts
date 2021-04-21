import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultilevelMenuService, NgMaterialMultilevelMenuModule} from 'ng-material-multilevel-menu';

import { MaterialModule } from '../../shared/material/material.module';
import { ExpandCollapseRoutingModule } from './MultiLevelMenu-routing.module';
import { MultiLevelMenuComponent } from './MultiLevelMenu.component';
import {MatIconModule} from '@angular/material/icon'

@NgModule({
  declarations: [MultiLevelMenuComponent],
  imports: [
    CommonModule,
    MaterialModule,
    MatIconModule,
    ExpandCollapseRoutingModule,
    NgMaterialMultilevelMenuModule,
  ],
  providers: [
    MultilevelMenuService
  ],
  exports:[
    MultiLevelMenuComponent
  ]

})
export class MultiLevelMenuModule { }
