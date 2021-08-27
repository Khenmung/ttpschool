import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/components/home/home.component';
import { AccountingVoucherComponent } from './accounting-voucher/accounting-voucher.component';
import { AccountingboardComponent } from './accountingboard/accountingboard.component';
import { TrialBalanceComponent } from './trial-balance/trial-balance.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent,
    children: [
      { path: "", component: AccountingboardComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingRoutingModule { }
export const AccountingComponents=[
  AccountingVoucherComponent,
  TrialBalanceComponent,
  AccountingboardComponent
]
