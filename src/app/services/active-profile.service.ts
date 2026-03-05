import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ProfileType = 'user' | 'business' | 'shelter';

export interface ActiveProfile {
  type: ProfileType;
  id: number | null;
}

@Injectable({ providedIn: 'root' })
export class ActiveProfileService {
  private readonly STORAGE_KEY = 'petverse_active_profile';
  private readonly STACK_KEY = 'petverse_profile_history';

  private readonly activeSubject = new BehaviorSubject<ActiveProfile>(this.readActive());
  readonly active$ = this.activeSubject.asObservable();

  private stack: ActiveProfile[] = this.readStack();

  active(): ActiveProfile {
    return this.activeSubject.value;
  }

  switchTo(profile: ActiveProfile, pushToStack: boolean): void {
    const current = this.activeSubject.value;

    if (current.type !== profile.type || current.id !== profile.id) {
      if (pushToStack) {
        this.stack.push(current);
        this.writeStack();
      }

      this.activeSubject.next(profile);
      this.writeActive(profile);
    }
  }

  setUserAsActive(pushToStack: boolean): void {
    this.switchTo({ type: 'user', id: null }, pushToStack);
  }

  setBusinessAsActive(id: number, pushToStack: boolean): void {
    this.switchTo({ type: 'business', id }, pushToStack);
  }

  setShelterAsActive(id: number, pushToStack: boolean): void {
    this.switchTo({ type: 'shelter', id }, pushToStack);
  }

  canGoBack(): boolean {
    return this.stack.length > 0;
  }

  goBack(): ActiveProfile {
    const prev = this.stack.pop() ?? { type: 'user', id: null };
    this.writeStack();
    this.activeSubject.next(prev);
    this.writeActive(prev);
    return prev;
  }

  clearAll(): void {
    this.stack = [];
    this.writeStack();

    const def: ActiveProfile = { type: 'user', id: null };
    this.activeSubject.next(def);
    this.writeActive(def);
  }

  switchToDefault(profile: ActiveProfile): void {
    this.switchTo(profile, true);
  }

  private readActive(): ActiveProfile {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return { type: 'user', id: null };

    try {
      const obj = JSON.parse(raw) as ActiveProfile;
      if (obj?.type === 'business' || obj?.type === 'shelter' || obj?.type === 'user') {
        return { type: obj.type, id: obj.id ?? null };
      }
      return { type: 'user', id: null };
    } catch {
      return { type: 'user', id: null };
    }
  }

  private writeActive(p: ActiveProfile): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(p));
  }

  private readStack(): ActiveProfile[] {
    const raw = localStorage.getItem(this.STACK_KEY);
    if (!raw) return [];

    try {
      const arr = JSON.parse(raw) as ActiveProfile[];
      if (!Array.isArray(arr)) return [];

      return arr
        .filter((x) => x && (x.type === 'user' || x.type === 'business' || x.type === 'shelter'))
        .map((x) => ({ type: x.type, id: x.id ?? null }));
    } catch {
      return [];
    }
  }

  private writeStack(): void {
    localStorage.setItem(this.STACK_KEY, JSON.stringify(this.stack));
  }
}
