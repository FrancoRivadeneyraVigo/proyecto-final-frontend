import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { Error404Component } from './pages/error404/error404.component';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { FavItemsComponent } from './pages/fav-items/fav-items.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChatsListComponent } from './pages/chats-list/chats-list.component';
import { ChatDetailComponent } from './pages/chat-detail/chat-detail.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { ArticleFormComponent } from './shared/components/article-form/article-form.component';

export const routes: Routes = [
    {path: "", pathMatch: "full", redirectTo: "home"},
    {path: "home", component: HomeComponent},
    {path: "login", component: LoginFormComponent},
    {path: "register", component: RegisterFormComponent},
    {path: "profile/:id", component: ProfileComponent},
    {path: "explore", component: ExploreComponent},
    {path: "fav-items", component: FavItemsComponent},
    {path: "articles/sell", component: ArticleFormComponent, canActivate: [authGuard]},
    {path: "articles/:id/edit", component: ArticleFormComponent},
    {path: "404", component: Error404Component},
    {path: "chats", component: ChatsListComponent},
    {path: "chats/:id", component: ChatDetailComponent},
    {path: "articles/:id", component: ArticleDetailComponent},

    {path: "**", component: Error404Component}
];
