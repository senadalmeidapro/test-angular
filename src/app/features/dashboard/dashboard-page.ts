import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { Project } from '../../core/models/project.model';
import { ProjectStore } from '../../core/services/project-store';
import { UserStore } from '../../core/services/user-store';
import { ChangeDetectionLab } from '../../shared/components/change-detection-lab/change-detection-lab';
import { ProjectCard } from '../../shared/components/project-card/project-card';
import { StatCard } from '../../shared/components/stat-card/stat-card';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    ChangeDetectionLab,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    ProjectCard,
    StatCard,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private readonly router = inject(Router);
  protected readonly projectStore = inject(ProjectStore);
  protected readonly userStore = inject(UserStore);

  ngOnInit(): void {
    if (this.projectStore.loadState() === 'idle') {
      this.projectStore.loadProjects();
    }
  }

  protected refresh(): void {
    this.projectStore.loadProjects();
  }

  protected openProject(project: Project): void {
    void this.router.navigate(['/projects', project.id]);
  }
}
