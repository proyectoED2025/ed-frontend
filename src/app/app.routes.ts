import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { SalesListComponent } from './components/sales-list/sales-list.component';
import { StockMovementsComponent } from './components/stock-movements/stock-movements.component';
import { ContactsListComponent } from './components/contacts-list/contacts-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'products', component: ProductsListComponent },
  { path: 'sales', component: SalesListComponent },
  { path: 'stock-movements', component: StockMovementsComponent },
  { path: 'contacts', component: ContactsListComponent },
  { path: '**', redirectTo: '/dashboard' }
];
