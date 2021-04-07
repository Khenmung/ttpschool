import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddstudentComponent } from './student/addstudent/addstudent.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FeesmanagementhomeComponent } from './feesmanagementhome/feesmanagementhome.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddstudentclassComponent } from './studentclass/addstudentclass/addstudentclass.component';
import { AddclassfeeComponent } from './classfee/addclassfee/addclassfee.component';
import { AddstudentfeepaymentComponent } from './studentfeepayment/addstudentfeepayment/addstudentfeepayment.component';
import { DashboardclassfeeComponent } from './classfee/dashboardclassfee/dashboardclassfee.component';
import { DashboardstudentComponent } from './student/dashboardstudent/dashboardstudent.component';
import { FeeHeaderComponent } from './shared/header/feeheader.component';
import { FeeSidebarComponent } from './shared/sidebar/sidebar.component';
import { FeeFooterComponent } from './shared/footer/footer.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AddMasterDataComponent } from './MasterData/add-master-data/add-master-data.component';
import { MultiLevelMenuModule } from '../dynamicMultiLevelMenu/MultiLevelMenu.module';
import { MultiLevelMenuComponent } from '../dynamicMultiLevelMenu/MultiLevelMenu.component';
import { FeereceiptComponent } from './feereceipt/feereceipt.component';
import {NgxPrintModule} from 'ngx-print';
import { NgxFileDropModule } from 'ngx-file-drop';
import { PhotogalleryModule } from '../photogallery/photogallery.module';
import { ExcelDataManagementComponent } from './excel-data-management/excel-data-management.component';
import { StudentDocumentComponent } from './StudentDocument/uploadstudentdocument/uploadstudentdoc.component';


@NgModule({
  declarations: [AddstudentComponent, FeesmanagementhomeComponent, 
    AddstudentclassComponent, AddclassfeeComponent, AddstudentfeepaymentComponent, 
    DashboardclassfeeComponent, DashboardstudentComponent, FeeHeaderComponent, 
    FeeSidebarComponent, FeeFooterComponent, AddMasterDataComponent, 
    FeereceiptComponent, ExcelDataManagementComponent, StudentDocumentComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    MultiLevelMenuModule,
    NgxPrintModule,
    NgxFileDropModule,
    PhotogalleryModule
  ],
  providers:[
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  exports:[MultiLevelMenuComponent]
})
export class StudentsModule { }
