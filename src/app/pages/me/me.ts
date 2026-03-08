import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ActiveProfileService } from '../../services/active-profile.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './me.html',
  styleUrl: './me.scss',
})
export class Me implements OnInit {
  private readonly router = inject(Router);
  private readonly profiles = inject(ActiveProfileService);
  private readonly auth = inject(AuthService);

  username = '';
  businessId: number | null = null;
  shelterId: number | null = null;

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.username = this.auth.getUsername() ?? 'Unknown user';

    this.businessId = this.readNumber('petverse_last_business_id');
    this.shelterId = this.readNumber('petverse_last_shelter_id');

    this.profiles.setUserAsActive(false);
  }

  get hasBusinessProfile(): boolean {
    return this.businessId !== null;
  }

  get hasShelterProfile(): boolean {
    return this.shelterId !== null;
  }

  goToCreateBusiness(): void {
    this.router.navigate(['/create-business']);
  }

  goToCreateShelter(): void {
    this.router.navigate(['/create-shelter']);
  }

  goToBusiness(): void {
    if (this.businessId === null) {
      return;
    }

    this.profiles.setBusinessAsActive(this.businessId, true);
    this.router.navigate(['/business', this.businessId]);
  }

  goToShelter(): void {
    if (this.shelterId === null) {
      return;
    }

    this.profiles.setShelterAsActive(this.shelterId, true);
    this.router.navigate(['/shelter', this.shelterId]);
  }

  private readNumber(key: string): number | null {
    const raw = localStorage.getItem(key);

    if (raw === null || raw.trim() === '') {
      return null;
    }

    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
}
