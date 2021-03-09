import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultilevelMenuService, NgMaterialMultilevelMenuModule} from 'ng-material-multilevel-menu';

import { MaterialModule } from '../../shared/material/material.module';
import { ExpandCollapseRoutingModule } from './MultiLevelMenu-routing.module';
import { MultiLevelMenuComponent } from './MultiLevelMenu.component';


@NgModule({
  declarations: [MultiLevelMenuComponent],
  imports: [
    CommonModule,
    MaterialModule,
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
