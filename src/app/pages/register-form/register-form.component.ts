import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { AuthHeroComponent } from '../../shared/components/auth-hero/auth-hero.component';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register-form',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FooterComponent, AuthHeroComponent],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css',
})
export class RegisterFormComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  authService = inject(AuthService);
  router = inject(Router);

  constructor() {
    this.registerForm = new FormGroup(
      {
        email: new FormControl('', [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl('', [
          Validators.required,
        ]),
        terms: new FormControl(false, [
          Validators.requiredTrue,
        ]),
      },
      { validators: passwordsMatch },
    );
  }

  checkError(controlName: string, errorName: string) {
    return this.registerForm.get(controlName)?.hasError(errorName);
  }

  checkTouched(controlName: string) {
    return this.registerForm.get(controlName)?.touched;
  }

  passwordsDoNotMatch() {
    return this.registerForm.hasError('passwordsMismatch')
      && this.checkTouched('confirmPassword');
  }

  async onSubmit() {
    if (this.registerForm.invalid || this.isSubmitting) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.registerForm.value;
    this.isSubmitting = true;

    try {
      await this.authService.register({ email, password });
      toast.success('Cuenta creada correctamente');
      this.router.navigate(['/']);
    } catch (error: any) {
      if (error?.status === 409) {
        toast.error('Ya existe una cuenta con ese email');
      } else {
        toast.error('No se pudo crear la cuenta');
      }
    } finally {
      this.isSubmitting = false;
    }
  }
}
