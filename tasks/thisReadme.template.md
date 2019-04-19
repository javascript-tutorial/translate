# Translation of the Modern JavaScript Tutorial

This repo hosts the general information and tools to translate the Modern JavaScript Tutorial <https://javascript.info>.

| Language | Link to GitHub | Translated (%) | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Last&nbsp;Commit&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Published |
|----------|--------|----------------|------------------------------------------------------------------------------------------|-----------|
<% for (let lang of Object.values(langs).sort((a, b) => a.name > b.name)) { -%>
| <%=lang.name%> | [Contribute](https://github.com/javascript-tutorial/<%=lang.code%>.javascript.info) | ![](https://translate.javascript.info/translate/percent/<%=lang.code%>.svg) | ![](https://translate.javascript.info/translate/updated/<%=lang.code%>.svg) | [<%=typeof lang.published === 'string' ? lang.published : `${lang.code}.javascript.info`%>](https://<%=typeof lang.published === 'string' ? lang.published : `${lang.code}.javascript.info`%>) |
<% } -%>

Help us to translate: click the "Contribute" link above and read how to do it. That's simple, join in!

## Starting a new translation

Your language is not in the list? 

If you'd like to create a new translation, submit a PR adding a new file `{lang-code}.json`
to the `langs` folder with the following information:

* [Language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
* List of maintainers (one or more)

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

If you are interested in becoming a maintainer for a translation, please ask one of the current maintainers if they would like to add you.

## Publishing

When the translation is at least 50% finished, please create an issue in this repository with a request to publish. You're good! 👏


## Acknowledgements

The syncing scripts and the translation bot are based off of [react.org-translation](https://github.com/reactjs/reactjs.org-translation) by @tesseralis.
