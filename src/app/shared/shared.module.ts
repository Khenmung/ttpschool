import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AreaComponent } from './widgets/area/area.component';
import { MaterialModule } from './material/material.module';
import { MultiLevelMenuModule} from '../modules/dynamicMultiLevelMenu/MultiLevelMenu.module';
import { AutofocusDirective } from './autofocus.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { EncodeHTMLPipe } from '../encode-html.pipe';

@NgModule({
  declarations: [
    AreaComponent,
    AutofocusDirective,
    EncodeHTMLPipe
    ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    MultiLevelMenuModule,    
    FormsModule,  
    ReactiveFormsModule,
    MatProgressBarModule,
    MatSidenavModule
  ],
  exports: [
    AreaComponent,
    EncodeHTMLPipe
  ],
  

})
export class SharedModule { }
