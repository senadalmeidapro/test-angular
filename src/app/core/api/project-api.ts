import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';
import { LAB_API_URL } from './lab-api.tokens';

@Injectable({ providedIn: 'root' })
export class ProjectApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(LAB_API_URL);

  getProjects(): Observable<readonly Project[]> {
    return this.http.get<readonly Project[]>(`${this.apiUrl}/projects`);
  }

  getProject(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/${projectId}`);
  }
}
