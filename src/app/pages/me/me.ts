import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ActiveProfileService } from '../../services/active-profile.service';
import { AuthService } from '../../services/auth';
import { BusinessService } from '../../services/business.service';

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
  private readonly business = inject(BusinessService);

  username = '';
  businessId: number | null = null;
  shelterId: number | null = null;

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.username = 'tsveti';

    this.businessId = this.readNumber('petverse_last_business_id');
    this.shelterId = this.readNumber('petverse_last_shelter_id');

    this.profiles.setUserAsActive(false);

    this.validateBusinessId();
  }

  private validateBusinessId(): void {
    if (!this.businessId) return;

    const id = this.businessId;

    this.business.getBusinessById(id).subscribe((profile) => {
      if (!profile) {
        localStorage.removeItem('petverse_last_business_id');
        this.businessId = null;
      }
    });
  }

  goToBusiness(): void {
    if (!this.businessId) return;

    this.profiles.setBusinessAsActive(this.businessId, true);
    this.router.navigate(['/business', this.businessId]);
  }

  goToCreateBusiness(): void {
    this.router.navigate(['/create-business']);
  }

  goToShelter(): void {
    if (!this.shelterId) return;

    this.profiles.setShelterAsActive(this.shelterId, true);
    this.router.navigate(['/shelter', this.shelterId]);
  }

  private readNumber(key: string): number | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
}
