# Translation of the Modern JavaScript Tutorial

This repo hosts tools to translate the Modern JavaScript Tutorial <https://javascript.info>.

| Language | Link to GitHub | Translated (%) | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Last&nbsp;Commit&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Published |
|----------|--------|----------------|------------------------------------------------------------------------------------------|-----------|
| Chinese | [Contribute](https://github.com/javascript-tutorial/zh.javascript.info) | ![](https://translate.javascript.info/translate/percent/zh.svg) | ![](https://translate.javascript.info/translate/updated/zh.svg) | [zh.javascript.info](https://zh.javascript.info) |
| French | [Contribute](https://github.com/javascript-tutorial/fr.javascript.info) | ![](https://translate.javascript.info/translate/percent/fr.svg) | ![](https://translate.javascript.info/translate/updated/fr.svg) |  |
| Japanese | [Contribute](https://github.com/javascript-tutorial/ja.javascript.info) | ![](https://translate.javascript.info/translate/percent/ja.svg) | ![](https://translate.javascript.info/translate/updated/ja.svg) | [ja.javascript.info](https://ja.javascript.info) |
| Romanian | [Contribute](https://github.com/javascript-tutorial/ro.javascript.info) | ![](https://translate.javascript.info/translate/percent/ro.svg) | ![](https://translate.javascript.info/translate/updated/ro.svg) |  |
| Russian | [Contribute](https://github.com/javascript-tutorial/ru.javascript.info) | ![](https://translate.javascript.info/translate/percent/ru.svg) | ![](https://translate.javascript.info/translate/updated/ru.svg) | [ru.javascript.info](https://ru.javascript.info) |
| Spanish | [Contribute](https://github.com/javascript-tutorial/es.javascript.info) | ![](https://translate.javascript.info/translate/percent/es.svg) | ![](https://translate.javascript.info/translate/updated/zh.svg) |  |

## Starting a new translation

If you would like to be the maintainer of a new translation, submit a PR adding a new file `{lang-code}.json`
to the `langs` folder with the following information:

* [Language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
* List of maintainers

For example:

```json
{
  "name": "English",
  "code": "en",
  "maintainers": ["iliakan", "lex111"]
}
```


As a maintainer:

- You should know JavaScript well enough to translate and review pull requests of others.

Once the PR is accepted, we will:

* Create a new repository for you at `javascript-tutorial/{lang-code}.javascript.info`.
* Add/invite all maintainers to the team `translate-{lang-code}` in the javascript-tutorial organization.
* Create an special issue in the new repository to track your translation progress.

If you are not a member of the organization, you should receive an email invite to join. Please accept this invite so you can get admin access to your repository!

You may want to [pin](https://help.github.com/articles/pinning-an-issue-to-your-repository/) the generated issue to make it easier to find.

See [Maintainer Tips](/MAINTAINER.md) for additional advice on how to manage your repository.

Happy translating!


## Adding a maintainer

If you are currently a maintainer of a translation and want to add another member, send a pull request to this repo updating `langs/{lang-code}.json`, where `{lang-code}` is the language code of the repo you want to be a maintainer of.

If you are interested in becoming a maintainer for a translation, please ask one of the current maintainers if they would like to add you. While different maintainers can have different requirements, usually they look for people who have already contributed to the translation already, either by translating or reviewing.

## Before publishing

1. Review your translations and make sure that the pages listed in "Core Pages" are fully translated. Run the site yourself locally to make sure there are no bugs or missing translations.
2. ask {TBD} to add {lang-code}.reactjs.org as a subdomain.
3. submit a PR to [reactjs/reactjs.org](https://github.com/reactjs/reactjs.org) adding the language in the dropdown (once we make it).
4. Celebrate! 🎉🌐

## Acknowledgements

The syncing scripts and the translation bot are based off of and iterated upon [react.org-translation](https://github.com/reactjs/reactjs.org-translation) by @tesseralis.
