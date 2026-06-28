import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { Error404Component } from './pages/error404/error404.component';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { FavItemsComponent } from './pages/fav-items/fav-items.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SellItemComponent } from './pages/sell-item/sell-item.component';
import { ChatsListComponent } from './pages/chats-list/chats-list.component';
import { ChatDetailComponent } from './pages/chat-detail/chat-detail.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { AdminComponent } from './pages/admin/admin.component';
import { adminGuard } from './shared/guards/admin-guard';
import { ProfileDetailComponent } from './pages/admin/profile-detail/profile-detail.component';

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
    {path: "chats", component: ChatsListComponent},
    {path: "chats/:id", component: ChatDetailComponent},
    {path: "articles/:id", component: ArticleDetailComponent},
    {path: "admin", component: AdminComponent, canActivate: [adminGuard]},
    {path: "admin/profile/:id", component: ProfileDetailComponent, canActivate: [adminGuard]},
    {path: "**", component: Error404Component}
];
