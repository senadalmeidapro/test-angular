import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly icon = input('analytics');
  readonly hint = input('Données en temps réel');
  readonly tone = input<'primary' | 'accent' | 'warning'>('primary');

  readonly displayValue = computed(() => {
    const value = this.value();
    return typeof value === 'number' ? new Intl.NumberFormat('fr-FR').format(value) : value;
  });
}
