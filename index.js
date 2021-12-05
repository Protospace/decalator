const fs = require('fs');
const path = require('path');
const express = require('express');
const sharp = require('sharp');

const svgmod = require('./svgmod');
const wikimediaApi = require('./wikimediaApi');
const log = require('./log')

function generateLabel(page, size=1.5, callback=null) {
  // TODO: error if id doesnt exist
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
        log.warn(`WARN: ID:${params.id} '${params.name}' doesn't fit on the label. Review this label to determine if it is appropriate. Continuing...`);
      } else {
        throw e;
      }
    }
    svgmod.replaceText(svgmod.getElement(template, wikijump2x1.id), params.id);

    if (callback) {
      callback(template);
    } else {
      // save to file
      svgmod.saveAsPng(template, path.join(`./output/${params.id}`), size);
    }
  });
}

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  // validate
  let errors = [];
  query = req.query;
  if (!('id' in query)) errors.push('"id" not supplied as query parameter. Provide something that exists in the Protospace wiki');
  if ('size' in query && isNaN(query.size)) errors.push('"size" must be a number');
  if ('size' in query && query.size > 4) errors.push('"size" cannot be >4');
  if ('size' in query && query.size < 1) errors.push('"size" much be >=1');
  if (errors.length > 0) { 
    res.status(400).send('Please fix the following errors:<br/><br/>' + errors.join('<br/>')).end(); 
    return
  }
  // TODO: add 1x2 template and provide that via query param
  size = query.size || 1.5
  generateLabel(query.id, size, (svg) => {
    dpi = 300;
    height = size * dpi;
    let img = sharp(Buffer.from(svg.svg()), {density: dpi})
      .resize(height)
      .png()
      .toBuffer((err, data, info) => {
        res.writeHead(200, {
           'Content-Type': 'image/png',
           'Content-Length': info.size
        });
        res.end(data);
      });
  });
});

app.listen(port, () => {
  log.info(`Listening at http://localhost:${port}`);
});
