const fs = require('fs');
const sharp = require('sharp');

// set up svgdom: https://www.npmjs.com/package/svgdom#get-started-with-svgjs-v3x
const { createSVGWindow } = require('svgdom')
const { SVG, registerWindow } = require('@svgdotjs/svg.js')

const templates = {
  wikijump2x1: {
    path: './templates/wikijump-2x1.svg',
    // a dict of internal name for an element and a selector that grabs that element
    // if we database-ify this, we could include the replace* function to use for this element and what to replace it with...
    id: '#toolId',
    url: '#toolUrl',
    qrcode: '#toolQr',
    name: '#toolName',
  }
}

function replaceText(node, text) {
  node.children()[0].node.textContent = text;
  return node;
}

function replaceBoxedText(node, text) {

}

function replaceNode(node, newNode) {

}

function openSVG(path) {
  let window = createSVGWindow()
  let document = window.document
  registerWindow(window, document)
  let draw = SVG();
  return draw.svg(fs.readFileSync(path));
}

function getElement(svg, selector) {
  return svg.findOne(selector);
}

function saveAsPng(svg, fileName) {
  // TODO: how to output png at a specific size?
  return sharp(Buffer.from(svg.svg()))
    .png()
    .toFile(fileName + '.png');
}

module.exports = {
  templates,
  replaceText,
  replaceBoxedText,
  replaceNode,
  openSVG,
  getElement,
  saveAsPng
}
