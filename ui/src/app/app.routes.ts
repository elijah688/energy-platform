import { Routes } from '@angular/router';
import { List } from '../app/pages/list/list';
import { Form } from '../app/pages/form/form';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: List },
      { path: 'form', component: Form }
    ]
  }
];
