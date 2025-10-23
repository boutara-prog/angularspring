import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

// Components
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

import { Home } from './components/home/home';
import { fournisseur } from './components/fournisseur/fournisseur';
import { Dashboard } from './components/dashboard/dashboard';
import { client } from './components/client/client';
import { produit } from './components/produit/produit';
import { commande } from './components/commande/commande';
import { Navbar } from './components/navbar/navbar';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { Sidebar } from './sidebar/sidebar';
import { StockList } from './components/stock-list/stock-list';
import { StockUpdate } from './components/stock-update/stock-update';

@NgModule({
  declarations: [
    App, 
    Home,
    Header, 
    Footer,
    fournisseur,
    Dashboard,
    client,
    produit,
    commande,
    Navbar,
    Login,
    Register,
    Sidebar,
    StockList,
    StockUpdate
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true // Important: permet d'avoir plusieurs interceptors
    }
   
  ],
  bootstrap: [App]
})
export class AppModule { }