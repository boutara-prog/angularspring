import { platformBrowser } from '@angular/platform-browser';
import 'zone.js'; // ou 'zone.js/node' pour SSR

import { AppModule } from './app/app.module';
import { JwtInterceptor } from './app/interceptors/jwt.interceptor';

platformBrowser().bootstrapModule(AppModule, {
  
  
})
  .catch(err => console.error(err));


  