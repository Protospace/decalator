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

function replaceBoxedText(template, textSelector, newText) {
  // get the text node
  let textNode = getElement(template, textSelector);

  // inspect the style to get the bounding rectangle and grab that element as well
  shapeInsideRegEx = new RegExp(/shape-inside:url\((\#.*)\)/);
  // TODO: can we use a named group or something instead of blindly indexing?
  // https://www.bennadel.com/blog/3508-playing-with-regexp-named-capture-groups-in-node-10.htm
  inside_match = shapeInsideRegEx.exec(textNode.attr().style);
  boxNode = getElement(template, inside_match[1]);

  // avg_line_height precalculate from textNode.children.y()
  avg_line_height = function(){
    lines = textNode.children();
    deltas = []
    for(x=lines.length - 1; x>0; x--) {
      deltas.push(lines[x].attr().y - lines[x - 1].attr().y);
    }
    // average together the line heights
    // ASSUMPTION: all heights are approximately the same give-or-take floating point math
    return (deltas).reduce((a,b) => a + b, 0) / deltas.length
  }()

  // max_line_width = get max line width - ideally from boxNode width but I dont think we can get that...
  max_line_width = Math.max(...textNode.children().map(child => child.bbox().width));

  max_number_of_lines = Math.floor(boxNode.height() / avg_line_height);
  current_line_number = 1;

  // make a 'template' for each child in textnode
  first_line = textNode.children()[0].clone();
  createTSpan = function() {
    x_start = first_line.attr().x;
    y_start = first_line.attr().y + (current_line_number - 1) * avg_line_height;

    // new tspan.x should be same. tspan.y = line_number * line_height
    tspanTemplate = `<tspan x="${x_start}" y="${y_start}">Text Here</tspan>`;
    current_line_number++;
    return tspanTemplate;
  }

  // remove content from template
  textNode.children().forEach(child => child.remove());

  // generate our own content
  textNode.svg(createTSpan());
  textNode.svg(createTSpan());
  textNode.svg(createTSpan());

  // yield from newText building string content...
  // measure width with bbox
  // once exceeds maxwidth of original line, reclaim last word and start a new tspan...
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

function saveAsSvg(svg, fileName) {
  fs.writeFileSync(fileName + '.svg', svg.svg());
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
