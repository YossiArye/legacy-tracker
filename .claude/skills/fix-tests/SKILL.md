---
name: fix-tests
description: Run the project's test suite and fix whatever is failing, using the live test output as context.
---

## Current test output

The tail is generous on purpose — a single failure's assertion diff plus stack trace can run 20+ lines, so a short tail would push earlier failures off the top:

!`npm test 2>&1 | tail -150`

## Instructions

The output above is from a test run that just happened — treat it as ground truth, not something to re-derive from scratch.

- If everything passed, say so and stop. Don't go looking for a task that isn't there.
- If something failed, for each failure:
  1. Read the test name, the assertion, and the actual vs. expected values closely before touching any file.
  2. Find the root cause in the source code being tested — fix the implementation, not the test, unless the test itself is provably wrong (e.g. it asserts behavior that contradicts the spec/CLAUDE.md).
  3. Make the smallest change that fixes the failure without changing unrelated behavior.
  4. Follow this repo's conventions from CLAUDE.md (use the logger, not console.log; JSDoc on new functions; prefer const) while fixing.
- If multiple tests are failing, fix and re-run (`npm test`) one at a time rather than guessing at all of them in one shot — a fix for one failure can sometimes mask or cause another.
- Finish only once a full `npm test` run is green, and report which bug(s) you found and fixed.
