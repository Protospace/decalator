const fs = require('fs');
const path = require('path');
const express = require('express');

const svgmod = require('./svgmod');
const wikimediaApi = require('./wikimediaApi');

print = console.log;

// TODO: proper logging
// TODO: add function docs

function generateLabel(page) {
  wikimediaApi.getPage(page, (body, err) => {
    if (err) throw err;
    params = wikimediaApi.extractNameAndId(body.title);
    wikijump2x1 = svgmod.templates.wikijump2x1;
    template = svgmod.openSVG(wikijump2x1.path);

    // replace contents
    new_url = wikimediaApi.WIKI_ENDPOINT + params.id;
    svgmod.replaceText(svgmod.getElement(template, wikijump2x1.url), new_url);
    svgmod.replaceQRCode(svgmod.getElement(template, wikijump2x1.qrcode), new_url);
    try {
      svgmod.replaceBoxedText(template, wikijump2x1.name, params.name);
    } catch (e) {
      if (e.message.includes('Content does not fit')) {
        print(`WARN: ID:${params.id} '${params.name}' doesn't fit on the label. Review this label to determine if it is appropriate. Continuing...`);
      } else {
        throw e;
      }
    }
    svgmod.replaceText(svgmod.getElement(template, wikijump2x1.id), params.id);

    // save to file
    svgmod.saveAsPng(template, path.join(`./output/${params.id}`), 1);
    svgmod.saveAsPng(template, path.join(`./output/${params.id}`), 1.5);
    svgmod.saveAsPng(template, path.join(`./output/${params.id}`), 2);
  });
}

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  // need:
  // template
  // id
  // size
  res.status(200).send('Hello World!').end();
});

app.listen(port, () => {
  print(`Listening at http://localhost:${port}`);
});

module.exports = app
