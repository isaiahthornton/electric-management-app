import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { passwordsMatch } from '../../utils/validators';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(false);

  protected readonly registerForm = this.fb.nonNullable.group(
    {
      accountNumber: ['', [Validators.required, Validators.pattern(/^TE-\d{6}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch }
  );

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage.set('Please fill out the form correctly.');
      return;
    }

    const { accountNumber, email, password } = this.registerForm.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(accountNumber, email, password).subscribe({
      next: () => this.router.navigate(['/account']),
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err instanceof Error ? err.message : 'Could not reach the server. Please try again.',
        );
      }
    });
  }
}
