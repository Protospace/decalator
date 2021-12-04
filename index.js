const fs = require('fs');
const path = require('path');

const svgmod = require('./svgmod');
const wikimediaApi = require('./wikimediaApi');

print = console.log;

// TODO: proper logging
// TODO: add function docs

// main
[
  '120',
  '144'
].forEach(page => {
  wikimediaApi.getPage(page, (body, err) => {
    if (err) throw err;
    params = wikimediaApi.extractNameAndId(body.title);
    wikijump2x1 = svgmod.templates.wikijump2x1;
    template = svgmod.openSVG(wikijump2x1.path);

    // replace contents
    new_url = wikimediaApi.WIKI_ENDPOINT + params.id;
    svgmod.replaceText(svgmod.getElement(template, wikijump2x1.url), new_url);
    svgmod.replaceQRCode(svgmod.getElement(template, wikijump2x1.qrcode), new_url);
    svgmod.replaceBoxedText(template, wikijump2x1.name, params.name);
    svgmod.replaceText(svgmod.getElement(template, wikijump2x1.id), params.id);

    // save to file
    svgmod.saveAsPng(template, path.join(`./output/${params.id}`));
  });
})
