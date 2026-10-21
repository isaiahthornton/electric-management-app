import { FormControl, FormGroup } from '@angular/forms';
import { passwordsMatch } from './validators';

describe('passwordsMatch', () => {
  const form = (password: string, confirmPassword: string) =>
    new FormGroup(
      { password: new FormControl(password), confirmPassword: new FormControl(confirmPassword) },
      { validators: passwordsMatch },
    );

  it('passes when both passwords are the same', () => {
    expect(form('secret1', 'secret1').errors).toBeNull();
  });

  it('fails with passwordsMismatch when they differ', () => {
    expect(form('secret1', 'secret2').errors).toEqual({ passwordsMismatch: true });
  });
});
