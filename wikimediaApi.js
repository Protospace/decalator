const https = require('https');
const log = require('./log');
const WIKI_ENDPOINT = 'https://wiki.protospace.ca/'

function extractNameAndId(title) {
  log.debug(`title: ${title}`);
  result = (new RegExp(/(.*)\ ID:\s*(\d+)/)).exec(title);
  log.debug(`result: ${result}`);
  return {
    name: result[1],
    id: result[2]
  }
}

function isRedirect(wikitext) {
  return wikitext.includes('{{id/after-redirect}}');
}

function extractRedirect(wikitext) {
  // regexr.com/6acsk
  // the first group match here is for the Page we redirect to
  let regex = new RegExp(/REDIRECT \[\[(.*)\]\]\{\{id\/after-redirect\}\}/);

  // TODO: what do in case of no match?

  // get the name of the page we are redirecting to
  // TODO: can we use a named group or something instead of blindly indexing?
  // https://www.bennadel.com/blog/3508-playing-with-regexp-named-capture-groups-in-node-10.htm
  return regex.exec(wikitext)[1]
}

function getPage(name, callback) {
  const API = WIKI_ENDPOINT + 'api.php';
  // TODO: string builder? what is risk of injection attack?
  // DO this: https://www.valentinog.com/blog/url/
  let request = API + '?action=parse&prop=wikitext&format=json&page=' + name
  log.debug(`requesting: ${request}`);
  https.get(request, res => {
    res.setEncoding('utf-8');
    let body = '';
    res.on('data', data => {
      body += data;
    });

    res.on('end', (err) => {
      if (err) {
        callback(null, err);
        return
      }

      raw = JSON.parse(body);
      if ('error' in raw) {
        message = raw.error.info
        log.warn(message + ": " + name);
        callback(null, message);
        return
      }
      resp = raw.parse;
      // TODO: error handling if property doesn't exist
      wikitext = resp.wikitext['*'];

      // protospace wiki pages for tools often have redirects
      if (isRedirect(wikitext)) {
        redirect_page = extractRedirect(wikitext)
        log.debug(`CALL REDIRECT ${redirect_page}`);
        getPage(redirect_page, callback);
        return
      }

      log.debug(`resp: ${JSON.stringify(resp)}`);
      // otherwise, pass the response data back
      callback(resp, err);
    })
  });
}

module.exports = {
  getPage,
  extractNameAndId,
  isRedirect,
  extractRedirect,
  WIKI_ENDPOINT
}
