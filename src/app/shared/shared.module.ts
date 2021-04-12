import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { AreaComponent } from './widgets/area/area.component';
import { MaterialModule } from './material/material.module';
import { MultiLevelMenuModule} from '../modules/dynamicMultiLevelMenu/MultiLevelMenu.module';
import { AlertComponent } from './components/alert/alert.component';
import { MatConfirmDialogComponent } from './components/mat-confirm-dialog/mat-confirm-dialog.component';
//import { EditInputComponent } from '../modules/photogallery/edit-input/edit-input.component';
import { AutofocusDirective } from './autofocus.directive';
import { FormsModule } from '@angular/forms';
import { RightComponent } from './components/right/right.component';
import { NewsdashboardComponent } from '../modules/newsdashboard/newsdashboard.component';
import { HomeComponent } from './components/home/home.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
@NgModule({
  declarations: [
    //HomeComponent,
    //HeaderComponent,
    //SidebarComponent,
    //FooterComponent,
    AreaComponent,
    //AlertComponent,
    MatConfirmDialogComponent,
    AutofocusDirective,
    //RightComponent,
    //NewsdashboardComponent,
    NotfoundComponent,
    //CdkCopyToClipboard,
    //EditInputComponent,
    
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    //RouterModule,
    MaterialModule,
    MultiLevelMenuModule,    
    FormsModule,    
    MatProgressBarModule
  ],
  exports: [
    //HomeComponent,
    //HeaderComponent,
    //SidebarComponent,
    //FooterComponent,
    AreaComponent,
    //AlertComponent,
    //RightComponent,
    //NewsdashboardComponent,
    NotfoundComponent,
    //EditInputComponent,
    //CdkCopyToClipboard
  ]

})
export class SharedModule { }
