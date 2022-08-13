import { Component, OnDestroy, OnInit } from '@angular/core';
import { TokenStorageService } from './_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker'; 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'school';
  private roles: string[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showModeratorBoard = false;
  username?: string;
  
  constructor(private tokenStorageService: TokenStorageService,
    private servicework:SwUpdate
    ) { }

  ngOnInit(): void {
    this.servicework.activateUpdate()    
    this.isLoggedIn = !!this.tokenStorageService.getToken();

  }
  ngOnDestroy() {
    
  }

  logout(): void {
    this.tokenStorageService.signOut();
    window.location.reload();
  }

}
