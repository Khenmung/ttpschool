import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.scss']
})
export class LandingpageComponent implements OnInit {

  constructor(private route:Router) { }

  ngOnInit(): void {
  }
  home()
  {
    this.route.navigate(['/home/display/0/0']);
  }
}
