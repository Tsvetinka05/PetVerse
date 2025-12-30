import { Component } from '@angular/core';
import{CommonModule} from '@angular/common';
import{
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

@Component({
  selector:'app-register',
  standalone:true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register{

  errorMessage:string = ' ';
  registerForm: FormGroup;

  constructor(){
    this.registerForm = new FormGroup({

      firstName: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),

      lastName: new FormControl('',[
        Validators.required,
        Validators.minLength(2)
      ]),

      username: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ]),

      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),

      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ]),

      confirmPassword: new FormControl('', [
        Validators.required
      ]),

      addPetNow: new FormControl(false),

      petName: new FormControl(''),
      petType: new FormControl(''),
      petBreed: new FormControl(''),
      petColor: new FormControl('')

    });
  }

  onSubmit():void{

    this.errorMessage = '';

    if(this.registerForm.invalid){
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please fix the highlighted fields.';
      return;
    }

    const password = this.registerForm.value.password;
    const confirmPassword = this.registerForm.value.confirmPassword;

    if(password !== confirmPassword){
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if(this.registerForm.value.addPetNow===true){
      if (
        !this.registerForm.value.petName ||
        !this.registerForm.value.petType ||
        !this.registerForm.value.petBreed ||
        !this.registerForm.value.petColor
      ) {
        this.errorMessage = 'Please fill in all pet fields.';
        return;
      }
    }

  }
}
