import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { Error404Component } from './pages/error404/error404.component';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { FavItemsComponent } from './pages/fav-items/fav-items.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SellItemComponent } from './pages/sell-item/sell-item.component';

export const routes: Routes = [
    {path: "", pathMatch: "full", redirectTo: "home"},
    {path: "home", component: HomeComponent},
    {path: "login", component: LoginFormComponent},
    {path: "register", component: RegisterFormComponent},
    {path: "profile/:id", component: ProfileComponent},
    {path: "explore", component: ExploreComponent},
    {path: "fav-items", component: FavItemsComponent},
    {path: "sell-item", component: SellItemComponent},
    {path: "404", component: Error404Component},
    
    {path: "**", component: Error404Component}
];
