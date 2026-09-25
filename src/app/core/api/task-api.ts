import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTaskRequest, Task, UpdateTaskRequest } from '../models/task.model';
import { LAB_API_URL } from './lab-api.tokens';

@Injectable({ providedIn: 'root' })
export class TaskApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(LAB_API_URL);

  getTasks(projectId: string): Observable<readonly Task[]> {
    return this.http.get<readonly Task[]>(`${this.apiUrl}/projects/${projectId}/tasks`);
  }

  createTask(projectId: string, request: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/projects/${projectId}/tasks`, request);
  }

  updateTask(taskId: string, request: UpdateTaskRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${taskId}`, request);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}`);
  }
}
