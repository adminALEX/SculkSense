import { describe, expect, it } from 'vitest';
import { findStaticIssues, verifyFailReason } from '../src/review/verify.js';

const diffWithConsoleLog = `diff --git a/foo.js b/foo.js
--- a/foo.js
+++ b/foo.js
@@ -1 +1,2 @@
+console.log("debug");
`;

const diffWithoutConsoleLog = `diff --git a/foo.js b/foo.js
--- a/foo.js
+++ b/foo.js
@@ -1 +1,3 @@
+const message = (
+    <>Hello</>
+);
`;

describe('verify', () => {
  it('detects console.log in added lines', () => {
    expect(findStaticIssues(diffWithConsoleLog)).toBe('console.log left in code');
  });

  it('does not flag jsx changes as console.log', () => {
    expect(findStaticIssues(diffWithoutConsoleLog)).toBeNull();
  });

  it('rejects false console.log AI claims', () => {
    expect(
      verifyFailReason(
        'console.log left in code at src/foo.js:15',
        diffWithoutConsoleLog,
      ),
    ).toBe(false);
  });

  it('accepts true console.log AI claims', () => {
    expect(
      verifyFailReason('console.log left in code', diffWithConsoleLog),
    ).toBe(true);
  });
});
