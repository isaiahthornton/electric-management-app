import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})

export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(false);

  attemptLogin(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.email(), this.password()).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        if (!user) {
          this.errorMessage.set('Invalid email or password. Please try again.');
          return;
        }
        this.router.navigate([user.role === 'admin' ? '/admin' : '/account']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Login error:', err);
        this.errorMessage.set('An error occurred during login. Please try again later.');
      },
    });
  }
}
