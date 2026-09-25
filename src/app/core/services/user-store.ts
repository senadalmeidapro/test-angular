import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { UserApi } from '../api/user-api';
import { LoadStateSnapshot } from '../models/load-state.model';
import { User } from '../models/user.model';
import { toErrorMessage } from '../utils/http-error';

const initialState: LoadStateSnapshot<readonly User[]> = {
  state: 'loading',
  data: [],
  errorMessage: null,
};

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly api = inject(UserApi);

  private readonly state = toSignal(
    this.api.getUsers().pipe(
      map((users): LoadStateSnapshot<readonly User[]> => ({
        state: users.length === 0 ? 'empty' : 'success',
        data: users,
        errorMessage: null,
      })),
      catchError((error: unknown) =>
        of<LoadStateSnapshot<readonly User[]>>({
          state: 'error',
          data: [],
          errorMessage: toErrorMessage(error, 'Impossible de charger les utilisateurs.'),
        }),
      ),
      startWith(initialState),
    ),
    { initialValue: initialState },
  );

  readonly users = computed(() => this.state().data);
  readonly loadState = computed(() => this.state().state);
  readonly errorMessage = computed(() => this.state().errorMessage);
}
