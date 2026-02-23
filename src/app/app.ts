import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

  goHome(): void {
    this.router.navigate(['/home']);
  }

  goCreatePost(): void {
    alert('Create post will be available soon');
  }

  goCreateBusiness(): void {
    this.router.navigate(['/create-business']);
  }

  goCreateShelter(): void {
    this.router.navigate(['/create-shelter']);
  }
}
