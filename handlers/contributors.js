const config = require('../config');
const debug = require('debug')('handlers:stats');
const Stats = require('../lib/stats');
const request = require('request-promise');

exports.get = async function (ctx) {

  const { lang: langCode } = ctx.request.query;

  debug('contributors for lang', langCode);

  if (!config.langs[langCode]) {
    return; // 404
  }

  const {files} = Stats.instance().get(langCode).contributors;

  let statsByAuthor = Object.create(null);
  let emailToAuthor = Object.create(null);

  for(let fileRelPath in files) {
    let fileStats = files[fileRelPath];
    for (let authorEmail in fileStats) {
      let {author, linesCount} = fileStats[authorEmail];
      if (!emailToAuthor[authorEmail] || !emailToAuthor[authorEmail].user) {
        emailToAuthor[authorEmail] = author;
      }
      statsByAuthor[authorEmail] = (statsByAuthor[authorEmail] || 0) + linesCount;
    }
  }

  let idToEmails = Object.create(null);
  for(let authorEmail in emailToAuthor) {
    let author = emailToAuthor[authorEmail];
    if (!author.user) continue;
    if (!idToEmails[author.user.id]) {
      idToEmails[author.user.id] = [authorEmail];
    } else {
      idToEmails[author.user.id].push(authorEmail);
    }
  }


  for(let [id,emails] of Object.entries(idToEmails)) {
    if (emails.length > 1) {
      // same user two or more emails => remove extras
      let emailMain = emails.filter(email => !email.endsWith('@users.noreply.github.com'))[0];
      if (!emailMain) emailMain = emails[0];
      let emailsSecondary = emails.filter(email => email !== emailMain);
      for(let email of emailsSecondary) {
        statsByAuthor[emailMain] += statsByAuthor[email];
        delete statsByAuthor[email];
      }
    }
  }


  // remove iliakan@gmail.com, the original content author
  // so that only translators' lines count
  if (langCode !== 'en' && langCode !== 'ru') {
    delete statsByAuthor['iliakan@gmail.com'];
  }

  let contributorsTotal = 0;
  let linesTotal = 0;
  for (let linesCount of Object.values(statsByAuthor)) {
    linesTotal += linesCount;
    contributorsTotal++;
  }

  let contributors = [];

  //console.log("stats by author", statsByAuthor);

  for (let authorEmail in statsByAuthor) {
    // console.log(authorEmail);
    let linesCount = statsByAuthor[authorEmail];

    if (linesCount < 10) {
      // skip contribs who have less than 10 lines
      continue;
    }

    contributors.push({
      linesCount,
      author: emailToAuthor[authorEmail]
    });

  }

  for (let value of contributors) {
    value.percent = (value.linesCount / linesTotal * 100).toFixed(2);
  }

  // console.log(result.entries());

  // use array to ensure sorting order
  contributors.sort((a, b) => b.linesCount - a.linesCount);

  // console.log(contributors);

  ctx.body = {contributorsTotal,  contributors};

};
