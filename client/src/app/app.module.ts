import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PredictiveComponent } from './predictive/predictive.component';
import { DescriptiveComponent } from './descriptive/descriptive.component';
import { NavComponent } from './nav/nav.component';
import { MainComponent } from './main/main.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    PredictiveComponent,
    DescriptiveComponent,
    NavComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxChartsModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
