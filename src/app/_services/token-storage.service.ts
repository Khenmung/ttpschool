import { Injectable } from '@angular/core';
const RANDOMIMAGE_KEY = 'random-images';
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
const USER_DETAIL = 'userdetail';
const REDIRECT_URL = 'redirecturl';
const SELECTEDBATCHID = 'selectedbatchid';
const SELECTEDAPPID = 'selectedappid';
const CHECKBATCHID='checkbatchid'
const NEXTBATCHID ='nextbatchid';
const PREVIOUSBATCHID='previousbatchid';
@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor() { }

  signOut(): void {
    localStorage.clear();
  }

  
  public saveRandomImages(images:any): void {
    localStorage.removeItem(RANDOMIMAGE_KEY);
    localStorage.setItem(RANDOMIMAGE_KEY, JSON.stringify(images));
  }
  public getImages(): any | null {
    let images = localStorage.getItem(RANDOMIMAGE_KEY);
    if (images) {
      return JSON.parse(JSON.stringify(images));
    }

    return "";    
  }
  public saveNextBatchId(token: string): void {
    localStorage.removeItem(NEXTBATCHID);
    localStorage.setItem(NEXTBATCHID, token);
  }
  public getNextBatchId(): string | null {
    return localStorage.getItem(NEXTBATCHID);
  }
  public savePreviousBatchId(token: string): void {
    localStorage.removeItem(PREVIOUSBATCHID);
    localStorage.setItem(PREVIOUSBATCHID, token);
  }
  public getPreviousBatchId(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public saveToken(token: string): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
  }
  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
  public saveCheckEqualBatchId(token: string): void {
    localStorage.removeItem(CHECKBATCHID);
    localStorage.setItem(CHECKBATCHID, token);
  }
  public getCheckEqualBatchId(): string | null {
    return localStorage.getItem(CHECKBATCHID);
  }
  public saveSelectedAppId(token: string): void {
    localStorage.removeItem(SELECTEDAPPID);
    localStorage.setItem(SELECTEDAPPID, token);
  }
  public getSelectedAPPId(): string | null {
    return localStorage.getItem(SELECTEDAPPID);
  }
  public saveSelectedBatchId(token: string): void {
    localStorage.removeItem(SELECTEDBATCHID);
    localStorage.setItem(SELECTEDBATCHID, token);
  }
  public getSelectedBatchId(): string | null {
    return localStorage.getItem(SELECTEDBATCHID);
  }
  public saveUser(user: any): void {
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  public saveUserdetail(userdetail: any): void {
    localStorage.removeItem(USER_DETAIL);
    localStorage.setItem(USER_DETAIL, JSON.stringify(userdetail));
  }
  public saveredirectionurl(url: any): void {
    localStorage.removeItem(REDIRECT_URL);
    localStorage.setItem(REDIRECT_URL, JSON.stringify(url));
  }
  public getRedirectUrl(): any {
    const redirecturl = localStorage.getItem(REDIRECT_URL);
    if (redirecturl) {
      return JSON.parse(redirecturl);
    }
    return "";
  }
  public getUserDetail(): any {
    const userdetail = localStorage.getItem(USER_DETAIL);
    if (userdetail) {
      return JSON.parse(userdetail);
    }

    return "";
  }
  public getUser(): any {
    const user = localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return "";
  }
}