import { Component, OnInit } from '@angular/core';
import { PredictiveComponent } from '../predictive/predictive.component';
import { DescriptiveComponent } from '../descriptive/descriptive.component';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
