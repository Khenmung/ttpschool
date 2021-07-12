import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.scss']
})
export class NotfoundComponent implements OnInit {
loading=false;
  constructor(
    private route: Router
  ) { }

  ngOnInit(): void {
  }
  home() {
    this.route.navigate(['/home']);
  }
}
