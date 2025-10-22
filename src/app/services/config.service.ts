import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private env = (window as any).env || {};

  get endpoints() {
    return {
        savePasswordUrl: this.env.SAVE_PASSWORD_URL || 'http://localhost:8014/login/app_credentials',
        validateTokenUrl: this.env.VALIDATE_TOKEN_URL || 'http://localhost:8014/login/validate_token'
    };
  }
}
