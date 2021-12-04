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

  // setting:
  // textNode.node.textContent = newText;
  // return
  // makes a passable SVG in inkscape, but not in the browser, not a usable PNG either

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
  // ASSUMPTION here that a textNode line in the template occupies that maximum width
  max_line_width = Math.max(...textNode.children().map(child => child.bbox().width));
  max_number_of_lines = Math.floor(boxNode.height() / avg_line_height) - 1;
  current_line_number = -1;

  // make a 'template' for each child in textnode
  first_line = textNode.children()[0].clone();
  createTSpan = function() {
    current_line_number++;
    x_start = first_line.attr().x;
    y_start = first_line.attr().y + current_line_number * avg_line_height;

    // new tspan.x should be same. tspan.y = line_number * line_height
    tspanTemplate = `<tspan x="${x_start}" y="${y_start}">Text Here</tspan>`;
    return tspanTemplate;
  }

  // remove content from template
  textNode.children().forEach(child => child.remove());

  // time to generate our own content
  // everything here on out is to generate line breaks in our text
  // apparently SVG is a baby format that cannot do this for me automatically...
  words = newText.split(' ');
  total_words = words.length;
  current_index = 0;
  
  // we are not going to attempt to write more lines than we have size for
  while (current_line_number < max_number_of_lines) {
    textNode.svg(createTSpan());
    line = textNode.children()[current_line_number];
    print('current_line_number:', current_line_number);
    current_line_width = 0.0;
    num_words_for_line = 1;
    // progressively add words to line.node.textContent and check the width
    // stop writing if the line gets too long
    while (current_line_width < max_line_width) {
      num_words_for_line++;
      stop_index = current_index + num_words_for_line;
      line.node.textContent = words.slice(current_index, stop_index).join(' ');
      print('line.node.textContent', line.node.textContent);
      current_line_width = line.bbox().width;
      print('current_line_width', current_line_width);
      print(stop_index, total_words - 1, total_words);
      // stop writing if we run out of words to write
      if (stop_index >= total_words - 1) break;
    }
    // presumably we have exceeded max_line_width, if so back a word off and reassign line.node.textContent
    // but ONLY if we exceed the max_line_width as there is cases we may not (e.g. the last written line)
    if (current_line_width > max_line_width) {
      stop_index--;
      line.node.textContent = words.slice(current_index, stop_index).join(' ');
    }
    current_index = stop_index;
  }
  if (current_index < words.length) throw new Error('Content does not fit on template: ' + words.slice(current_index, words.length - 1).join(' '));
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
