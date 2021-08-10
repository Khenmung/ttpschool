import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudenthomeComponent } from '../student/studenthome/studenthome.component';
import { AccountingVoucherComponent } from './accounting-voucher/accounting-voucher.component';

const routes: Routes = [
  {
    path: "", component: StudenthomeComponent,
    children: [
      { path: "", component: AccountingVoucherComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingRoutingModule { }
export const AccountingComponents=[
  AccountingVoucherComponent
]
