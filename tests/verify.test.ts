import { describe, expect, it } from 'vitest';
import { parseAddedDiffLines } from '../src/review/diffLines.js';
import {
  enrichFailReason,
  findStaticIssues,
  verifyFailReason,
} from '../src/review/verify.js';

const diffWithConsoleLog = `diff --git a/src/foo.js b/src/foo.js
--- a/src/foo.js
+++ b/src/foo.js
@@ -58,6 +58,9 @@
   if (!isHumanAgentWindowOpen) {
     return [];
   }
+  console.log("debug");
+  console.log("toNumber", toNumber);
   return [
`;

const diffWithoutConsoleLog = `diff --git a/src/foo.js b/src/foo.js
--- a/src/foo.js
+++ b/src/foo.js
@@ -12,8 +12,15 @@
-const HUMAN_AGENT_INBOX_BANNER_MESSAGE =
-  "message";
+const HUMAN_AGENT_INBOX_BANNER_MESSAGE = (
+    <>
+        Hello
+    </>
+);
`;

describe('diffLines', () => {
  it('maps added lines to file and line numbers', () => {
    const lines = parseAddedDiffLines(diffWithConsoleLog);
    expect(lines[0]).toEqual({
      file: 'src/foo.js',
      line: 61,
      content: '  console.log("debug");',
    });
    expect(lines[1].line).toBe(62);
  });
});

describe('verify', () => {
  it('detects console.log with exact line number', () => {
    expect(findStaticIssues(diffWithConsoleLog)).toBe(
      'console.log left in code\n\nsrc/foo.js:61',
    );
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

  it('enriches AI fail reason with exact line from diff', () => {
    expect(
      enrichFailReason('console.log left in code', diffWithConsoleLog),
    ).toBe('console.log left in code\n\nsrc/foo.js:61');
  });
});
