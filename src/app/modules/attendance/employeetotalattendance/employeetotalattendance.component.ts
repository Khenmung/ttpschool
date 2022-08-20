import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-employeetotalattendance',
  templateUrl: './employeetotalattendance.component.html',
  styleUrls: ['./employeetotalattendance.component.scss']
})
export class EmployeetotalattendanceComponent implements OnInit {

  constructor(private servicework: SwUpdate) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
  }

}
