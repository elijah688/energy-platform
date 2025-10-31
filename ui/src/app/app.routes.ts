import { Routes } from '@angular/router';
import { List } from '../app/pages/list/list';
import { Form } from '../app/pages/form/form';
import { transactionGuard } from './guards/transaction-guard';
import { Trade } from './pages/trade/trade';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: List },
      { path: 'form', component: Form },           // for new user
      { path: 'form/:id', component: Form },       // for editing existing user
      { path: 'trade', component: Trade, canActivate: [transactionGuard] }
    ]
  }
];
