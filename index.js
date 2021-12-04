const https = require('https');
const fs = require('fs');

print = console.log

// TODO: proper logging
// TODO: add function docs

WIKI_ENDPOINT = 'https://wiki.protospace.ca/'

function getPage(name, callback) {
  const API = WIKI_ENDPOINT + 'api.php';
  // TODO: string builder? what is risk of injection attack?
  let request = API + '?action=parse&prop=wikitext&format=json&page=' + name
  console.log('requesting', request);
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

      // TODO: error handling https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#exceptions
      resp = JSON.parse(body).parse;
      // TODO: error handling if property doesn't exist
      wikitext = resp.wikitext['*'];

      // check if this page has a redirect
      // protospace wiki pages for tools often do
      if (isRedirect(wikitext)) {
        redirect_page = extractRedirect(wikitext)
        console.log('CALL REDIRECT', redirect_page);
        getPage(redirect_page, callback);
        return
      }

      // otherwise, pass the response data back
      callback(resp, err);
    })
  });
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

function saveToFile(contents, filename) {
  fs.writeFile(filename, contents, (err) => {
    if(err) throw err;
    console.log('File written to', filename);
  });
}

// main
getPage('6', (body, err) => {
  if (err) throw err;
  console.log(body);
});
