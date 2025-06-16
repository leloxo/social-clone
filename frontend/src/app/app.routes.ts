import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { UploadComponent } from './pages/upload/upload.component';
import { ProfileComponent } from './pages/user/profile/profile.component';
import { SearchComponent } from './pages/user/search/search.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    
    { path: '', 
        component: AppLayout, 
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'profile', redirectTo: 'profile/me', pathMatch: 'full' },
            { path: 'profile/:username', component: ProfileComponent },
            { path: 'search', component: SearchComponent },
            { path: 'upload', component: UploadComponent },
        ]
    },

    { path: '**', redirectTo: 'login' }
];
