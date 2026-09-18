import { isAllowedEmail } from '../src/modules/auth/college-domain.util';
import { GITHUB_RE } from '../src/modules/projects/dto/create-project.dto';

describe('domain rules (no DB needed)', () => {
  it('allows college domains, blocks gmail', () => {
    expect(isAllowedEmail('a@college.edu', ['college.edu'], [])).toBe(true);
    expect(isAllowedEmail('b@cs.college.edu', ['college.edu', 'cs.college.edu'], [])).toBe(true);
    expect(isAllowedEmail('c@gmail.com', ['college.edu'], [])).toBe(false);
  });
  it('allows overrides', () => {
    expect(isAllowedEmail('guest@gmail.com', ['college.edu'], ['guest@gmail.com'])).toBe(true);
  });
  it('allows all mail IDs when wildcard or empty', () => {
    expect(isAllowedEmail('someone@gmail.com', ['*'], [])).toBe(true);
    expect(isAllowedEmail('x@yahoo.in', [], [])).toBe(true);
    expect(isAllowedEmail('y@college.edu', ['*'], [])).toBe(true);
  });
  it('validates github urls', () => {
    expect(GITHUB_RE.test('https://github.com/aarav/laundry-tracker')).toBe(true);
    expect(GITHUB_RE.test('https://gitlab.com/a/b')).toBe(false);
    expect(GITHUB_RE.test('not-a-url')).toBe(false);
  });
});
