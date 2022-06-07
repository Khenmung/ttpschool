import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-studenthome',
  templateUrl: './studenthome.component.html',
  styleUrls: ['./studenthome.component.scss']
})
export class StudenthomeComponent implements OnInit { PageLoading=true;

  constructor(
    private route: Router
  ) { }

  ngOnInit(): void {
  }
  
}
