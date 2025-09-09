import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ConfirmEmailComponent } from './components/confirm-email/confirm-email.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { SalesListComponent } from './components/sales-list/sales-list.component';
import { StockMovementsComponent } from './components/stock-movements/stock-movements.component';
import { ContactsListComponent } from './components/contacts-list/contacts-list.component';
import { PresupuestadorComponent } from './components/presupuestador/presupuestador.component';
import { FacturadorComponent } from './components/facturador/facturador.component';
import { InsumosComponent } from './components/insumos/insumos.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductsListComponent, canActivate: [authGuard] },
  { path: 'sales', component: SalesListComponent, canActivate: [authGuard] },
  { path: 'stock-movements', component: StockMovementsComponent, canActivate: [authGuard] },
  { path: 'contacts', component: ContactsListComponent, canActivate: [authGuard] },
  { path: 'presupuestar', component: PresupuestadorComponent, canActivate: [authGuard] },
  { path: 'facturar', component: FacturadorComponent, canActivate: [authGuard] },
  { path: 'insumos', component: InsumosComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];


