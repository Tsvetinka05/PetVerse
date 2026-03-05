import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './me.html',
  styleUrl: './me.scss',
})
export class Me implements OnInit {
  private readonly router = inject(Router);

  username = '';
  businessId: number | null = null;
  shelterId: number | null = null;

  ngOnInit(): void {
    this.username = 'tsveti';

    this.businessId = this.readNumber('petverse_last_business_id');
    this.shelterId = this.readNumber('petverse_last_shelter_id');
  }

  goToBusiness(): void {
    if (!this.businessId) return;

    localStorage.setItem(
      'petverse_active_profile',
      JSON.stringify({ type: 'business', id: this.businessId }),
    );

    this.router.navigate(['/business', this.businessId]);
  }

  goToShelter(): void {
    if (!this.shelterId) return;

    localStorage.setItem(
      'petverse_active_profile',
      JSON.stringify({ type: 'shelter', id: this.shelterId }),
    );

    this.router.navigate(['/shelter', this.shelterId]);
  }

  private readNumber(key: string): number | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
}
