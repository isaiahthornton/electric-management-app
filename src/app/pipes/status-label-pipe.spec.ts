import { StatusLabelPipe } from './status-label-pipe';

describe('StatusLabelPipe', () => {
  const pipe = new StatusLabelPipe();

  it('turns snake_case into Title Case words', () => {
    expect(pipe.transform('in_progress')).toBe('In Progress');
  });

  it('capitalizes a single word', () => {
    expect(pipe.transform('overdue')).toBe('Overdue');
  });

  it('returns an empty string for null or undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
