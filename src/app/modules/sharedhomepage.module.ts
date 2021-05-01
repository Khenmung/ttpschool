import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from '../shared/components/home/home.component';
import { HeaderComponent } from '../shared/components/header/header.component';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { AlertComponent } from '../shared/components/alert/alert.component';
import { MaterialModule } from '../shared/material/material.module';
import { RouterModule } from '@angular/router';
import { RightComponent } from '../shared/components/right/right.component';
import { MultiLevelMenuComponent } from './dynamicMultiLevelMenu/MultiLevelMenu.component';
import { MultiLevelMenuModule } from './dynamicMultiLevelMenu/MultiLevelMenu.module';
import { NewsdashboardComponent } from './newsdashboard/newsdashboard.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LandingpageComponent } from '../shared/components/landingpage/landingpage.component';
import { NestedmenuComponent } from './shared/components/nestedmenu/nestedmenu.component';

const sharedComponent=[
  HomeComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    AlertComponent,
    RightComponent,
    NewsdashboardComponent,
    LandingpageComponent
    //MultiLevelMenuComponent
]

@NgModule({
  declarations: [
    sharedComponent,
    NestedmenuComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    MultiLevelMenuModule,
    FlexLayoutModule
  ],
  exports:[
    sharedComponent
  ]

})
export class SharedhomepageModule { }
