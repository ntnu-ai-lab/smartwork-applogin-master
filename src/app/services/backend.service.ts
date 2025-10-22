import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject  } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Appuser } from '../appuser';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private username: string = '';
  private token: string = '';
  private tokenValid: boolean = false;

   // Add BehaviorSubjects to emit value changes
   private usernameSubject = new BehaviorSubject<string>('');
   private tokenValidSubject = new BehaviorSubject<boolean>(false);
   
   // Expose the observables 
   public username$ = this.usernameSubject.asObservable();
   public tokenValid$ = this.tokenValidSubject.asObservable();

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.validateToken();
      }
    });
   }

    // Validate token and get username
  private validateToken(): void {
    this.http.get(`${this.config.endpoints.validateTokenUrl}?token=${this.token}`, 
      { responseType: 'text' })
      .pipe(
        map(response => {
          this.username = response;
          this.tokenValid = true;
          // Emit the new values to subscribers
          this.usernameSubject.next(this.username);
          this.tokenValidSubject.next(true);
          
          return true;
        }),
        catchError(error => {
          this.tokenValid = false;
          this.tokenValidSubject.next(false);
          console.error('Token validation error:', error);
          return of(false);
        })
      )
      .subscribe();
  }

   setUserPassword(password: string): Observable<any> {
    console.log('In backend setUserPassword:', this.username);
    if (!this.tokenValid) {
      return of({ success: false, message: 'Link expired or invalid' });
    }
    const user: Appuser = {
      username: this.username,
      password: password
    };
    return this.http.post<string>(this.config.endpoints.savePasswordUrl, user,
      { responseType: 'text' as 'json' }
    );
  }

  getCurrentUsername(): string {
    return this.username;
  }

  isTokenValid(): boolean {
    return this.tokenValid;
  }

  getToken(): string {
    return this.token;
  }
}
