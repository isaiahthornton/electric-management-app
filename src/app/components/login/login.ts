import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private route = inject(ActivatedRoute);

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
        // Go back to the page that sent them here, if there was one
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        // Only follow paths inside this app (like /account/billing), never a full web address
        if (returnUrl?.startsWith('/') && !returnUrl.startsWith('//')) {
          this.router.navigateByUrl(returnUrl);
          return;
        }
        this.router.navigate([user.role === 'admin' ? '/admin' : '/account']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Login error:', err);
        // Our own errors (like a suspended account) have a message worth showing;
        // anything else means the server couldn't be reached
        this.errorMessage.set(
          err instanceof Error ? err.message : 'An error occurred during login. Please try again later.',
        );
      },
    });
  }
}
