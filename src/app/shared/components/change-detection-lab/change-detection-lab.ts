import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface LabRecord {
  revision: number;
  label: string;
}

@Component({
  selector: 'app-eager-probe',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="probe" data-strategy="eager">
      <mat-card-header>
        <mat-card-title><mat-icon>sync</mat-icon> Eager</mat-card-title>
        <mat-card-subtitle>Ancienne stratégie « Default »</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <code>{{ record().label }}</code>
        <p>Champ local : {{ classicCount }}</p>
        <p>Signal local : {{ signalCount() }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button matButton type="button" (click)="incrementClassic()">+ Champ local</button>
        <button matButton type="button" (click)="incrementSignal()">+ Signal</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .probe {
      border: 1px solid #7c4dff;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class EagerProbe {
  readonly record = input.required<LabRecord>();
  protected classicCount = 0;
  protected readonly signalCount = signal(0);

  protected incrementClassic(): void {
    this.classicCount += 1;
  }

  protected incrementSignal(): void {
    this.signalCount.update((count) => count + 1);
  }
}

@Component({
  selector: 'app-onpush-probe',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="probe" data-strategy="onpush">
      <mat-card-header>
        <mat-card-title><mat-icon>bolt</mat-icon> OnPush</mat-card-title>
        <mat-card-subtitle>Stratégie par défaut Angular 22</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <code>{{ record().label }}</code>
        <p>Champ local : {{ classicCount }}</p>
        <p>Signal local : {{ signalCount() }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button matButton type="button" (click)="incrementClassic()">+ Champ local</button>
        <button matButton type="button" (click)="incrementSignal()">+ Signal</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .probe {
      border: 1px solid #00897b;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnPushProbe {
  readonly record = input.required<LabRecord>();
  protected classicCount = 0;
  protected readonly signalCount = signal(0);

  protected incrementClassic(): void {
    this.classicCount += 1;
  }

  protected incrementSignal(): void {
    this.signalCount.update((count) => count + 1);
  }
}

@Component({
  selector: 'app-change-detection-lab',
  imports: [MatButtonModule, MatCardModule, MatIconModule, EagerProbe, OnPushProbe],
  templateUrl: './change-detection-lab.html',
  styleUrl: './change-detection-lab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeDetectionLab {
  protected readonly record = signal<LabRecord>({ revision: 1, label: 'Objet A' });
  protected readonly parentRenderCount = signal(0);
  protected readonly recordRevision = computed(() => this.record().revision);

  protected mutateInPlace(): void {
    // This deliberately keeps the same object reference to demonstrate the input identity rule.
    this.record().label = `Objet A muté (rendu parent ${this.parentRenderCount() + 1})`;
    this.parentRenderCount.update((count) => count + 1);
  }

  protected replaceReference(): void {
    this.record.update((record) => ({
      revision: record.revision + 1,
      label: `Objet B — révision ${record.revision + 1}`,
    }));
    this.parentRenderCount.update((count) => count + 1);
  }
}
