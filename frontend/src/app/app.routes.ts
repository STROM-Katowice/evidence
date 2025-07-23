import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { EventsComponent } from './events/events.component';
import { GroupsComponent } from './groups/groups.component';
import { QualsComponent } from './quals/quals.component';
import { SettingsComponent } from './settings/settings.component';
import { StorageComponent } from './storage/storage.component';
import { PracownicyComponent } from './pracownicy/pracownicy.component';

export const routes: Routes = [
    {    path: '',    component: StorageComponent,  },
    {    path: 'login',    component: LoginComponent,  },
    {    path: 'zdarzenia',    component: EventsComponent,  },
    {    path: 'pracownicy',    component: PracownicyComponent,  },
    {    path: 'brygady',    component: GroupsComponent,  },
    {    path: 'kwalifikacje',    component: QualsComponent,  },
    {    path: 'ustawienia',    component: SettingsComponent,  },
];
