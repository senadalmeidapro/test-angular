import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<ConfirmDialog>;
  const close = vi.fn();
  const data: ConfirmDialogData = {
    title: 'Confirmer la suppression',
    message: 'Cette action est définitive.',
    confirmLabel: 'Supprimer',
  };

  beforeEach(async () => {
    close.mockReset();
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialog);
    fixture.detectChanges();
  });

  it('affiche les données injectées', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(data.title);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(data.message);
  });

  it('ferme avec annulation puis confirmation', () => {
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
      'button',
    );
    buttons[0].click();
    buttons[1].click();

    expect(close).toHaveBeenNthCalledWith(1, false);
    expect(close).toHaveBeenNthCalledWith(2, true);
  });
});
