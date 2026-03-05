import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PostMediaService {
  private readonly BACKEND_ORIGIN = 'http://localhost:5224';

  buildAbsolutePhotoUrl(photoPath: string | null | undefined): string | null {
    if (!photoPath) return null;

    const p = String(photoPath).trim();
    if (!p) return null;

    if (p.startsWith('http://') || p.startsWith('https://')) return p;

    if (p.startsWith('/')) return `${this.BACKEND_ORIGIN}${p}`;

    return `${this.BACKEND_ORIGIN}/${p}`;
  }
}
