import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Project, ProjectStatus } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-project-card',
  imports: [DatePipe, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCard {
  readonly project = input.required<Project>();
  readonly users = input.required<readonly User[]>();
  readonly projectSelected = output<Project>();

  readonly ownerName = computed(
    () => this.users().find((user) => user.id === this.project().ownerId)?.name ?? 'Non assigné',
  );
  readonly statusLabel = computed(() => projectStatusLabels[this.project().status]);
}

const projectStatusLabels: Readonly<Record<ProjectStatus, string>> = {
  planned: 'Planifié',
  active: 'Actif',
  'on-hold': 'En pause',
  completed: 'Terminé',
};
