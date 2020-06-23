import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import * as moment from 'moment';
import { AuthResponse } from './dto/AuthResponse';
import { SignUpRequest } from './dto/SignUpRequest';
import { ApiResponse } from './dto/ApiResponse';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  constructor(private http: HttpClient) {}
  isSignUpSuccessful = new BehaviorSubject(false);
  isSessionExpired = new BehaviorSubject(false);

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.sportbookApiEndpoint}/auth/login`, { email, password })
      .pipe(tap(this.setSession));
  }

  signUp(signUpRequest: SignUpRequest) {
    return this.http.post<ApiResponse>(`${environment.sportbookApiEndpoint}/auth/signup`, signUpRequest);
  }

  signUpSuccess() {
    this.isSignUpSuccessful.next(true);
  }

  setSession(loginResponse: AuthResponse) {
    const expiresAt = moment().add(loginResponse.expires_in, 'second');
    localStorage.setItem('access_token', loginResponse.access_token);
    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
  }

  public isLoggedIn() {
    return this.getAccessToken() && moment().isBefore(this.getExpiration());
  }

  logoutWhenSessionExpired() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
    this.isSessionExpired.next(true);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
  }

  getExpiration() {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }
}
