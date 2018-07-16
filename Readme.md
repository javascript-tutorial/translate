# Translation percentage calculator

Checks out / updates repos listed at https://github.com/iliakan/javascript-tutorial-en.

For each repo, compares it vs en version.

The comparison is as follows (`countTranslation.js`):

1. For each `.md` file in the en version.
2. If there exists the same file and it's different enough (jsdiff), it's considered translated.
3. Then translated count / total files count = percentage.

