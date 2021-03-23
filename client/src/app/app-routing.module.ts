import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DescriptiveComponent } from './descriptive/descriptive.component';
import { PredictiveComponent } from './predictive/predictive.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [{path: '', component: MainComponent},
{path: 'descriptive', component: DescriptiveComponent},
{path: 'predictive', component: PredictiveComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
