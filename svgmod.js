const fs = require('fs');
const sharp = require('sharp');
const QRCode = require('qrcode');

// set up svgdom: https://www.npmjs.com/package/svgdom#get-started-with-svgjs-v3x
const { createSVGWindow } = require('svgdom')
const { SVG, registerWindow } = require('@svgdotjs/svg.js')

const templates = {
  wikijump2x1: {
    path: './templates/wikijump-2x1.svg',
    // a dict of internal name for an element and a selector that grabs that element
    // if we database-ify this, we could include the replace* function to use for this element and the args to call it with...
    id: '#toolId',
    url: '#toolUrl',
    qrcode: '#toolQr',
    name: '#toolName',
    nameBox: '#toolNameBox',
  }
}

function replaceText(node, text) {
  // TODO: the 'right' way to do
  // create a function to iterate through all childrens in the node to locate the one that holds text and change that via node.textContent
  // TODO: warn on multiple text elements as well...
  node.children()[0].node.textContent = text;
  return node;
}

function replaceBoxedText(boxNode, textNode, newText) {
  // https://stackoverflow.com/questions/15430189/pure-svg-way-to-fit-text-to-a-box
  // HACK: this assumes at least ONE line in the template uses the maximum width of the line
  var line_width = 0;
  var line_height = 0;
  textNode.children().forEach(child => { 
    bbox = child.bbox()
    child_width = bbox.width;
    if (child_width > line_width) line_width = child_width;
    child_height = bbox.height
    if (child_height > line_height) line_height = child_height;
  });
  // generate scale factor because line.bbox seems to produce wildly different numbers than boxNode.bbox
  scale_factor = boxNode.width() / line_width;
  max_number_of_lines = Math.floor(boxNode.height() / line_height / scale_factor);

  print(line_height)
  // start generating text...
  print(textNode.svg());
  textNode.children().forEach(child => child.remove());
  textNode.tspan('Lorem ipsum dolor sit amet ');
  // textNode.tspan('Lorem ipsum dolor sit amet ').newLine();
  // textNode.tspan('consectetur').fill('#f06');
  // textNode.tspan('.');
  print(textNode.svg());

  var wat = [18.702212, 26.639712, 34.577212];
  for (x=1; x<wat.length; x++) {
    print(wat[x] - wat[x-1]);
  }
}

async function replaceQRCode(node, qrCodeText) {
  await QRCode.toString(qrCodeText, {type: 'svg', width: node.width(), errorCorrectionLevel: 'H'}, (err, string) => {
    if(err) throw err;
    qrcode = SVG(string);
    node.children().forEach(child => child.remove());
    qrcode.addTo(node);
  })
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
  replaceQRCode,
  openSVG,
  getElement,
  saveAsPng
}
