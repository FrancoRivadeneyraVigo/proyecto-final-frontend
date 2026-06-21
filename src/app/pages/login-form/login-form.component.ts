import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FooterComponent],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css',
})
export class LoginFormComponent {
  loginForm: FormGroup;
  authService = inject(AuthService);
  router = inject(Router);

  constructor() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
      password: new FormControl('', [
        Validators.required,
      ]),
    });
  }

  checkError(controlName: string, errorname: string) {
    return this.loginForm.get(controlName)?.hasError(errorname);
  }
  
  checkTouched(controlName: string) {
    return this.loginForm.get(controlName)?.touched;
  }

  async onSubmit() {
    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login({ email, password });
      const profile = this.authService.currentUser();
      toast.success(`Bienvenido, ${profile?.name} ${profile?.surname}`);
      this.router.navigate(['/']);
    } catch (error: any) {
      toast.error('Email o contraseña incorrectos');
    }
  }
}