const assert = require('assert');
const fs = require('fs');

// HACK: include root of this repo in module.paths so we can import our modules
// Feels like there's a right way to do this and this aint it
const path = require('path');
module.paths.push(path.resolve(module.path, '../'));

const svgmod = require('svgmod');

print = console.log;

// put all test-generated images into a single directory
// create that directory if it doesnt exist...
test_output_directory = "./output"
if (!fs.existsSync(test_output_directory)) fs.mkdirSync(test_output_directory);

describe('svgmod', () => {
  let wikijump2x1 = svgmod.templates.wikijump2x1;

  describe('openSVG', () => {
    result = svgmod.openSVG(wikijump2x1.path);

    it('should not be empty', () => assert.ok(result));
    it('should be an svg.js object', () => assert.equal(result.type, "svg"));
  })

  // TODO: should be snapshot testing all of the image-based test cases here
  describe('saveAsPng', () => {
    // arrange
    let template = svgmod.openSVG(wikijump2x1.path);

    it('saves as png without error', () => {
      // act
      return svgmod.saveAsPng(template, path.join(test_output_directory,"svgmod.saveAsPng.test"));
      // verify the template has been saved faithfully as a png
    });
  });

  describe('replaceText', () => {
    // arrange
    let template = svgmod.openSVG(wikijump2x1.path);
    let input = svgmod.getElement(template, wikijump2x1.id);

    // act
    svgmod.replaceText(input, "9999");

    it('should modify internal text of one node', () => {
      return svgmod.saveAsPng(template, path.join(test_output_directory,"svgmod.replaceText.test"));
      // verify ID has changed to 9999
    });
  });

  describe('replaceQrCode', () => {
    // arrange
    let template = svgmod.openSVG(wikijump2x1.path);
    let input = svgmod.getElement(template, wikijump2x1.qrcode);

    it('should modify qr code with new text', () => {
      // act
      return svgmod.replaceQRCode(input, 'https://www.google.com').then(() => svgmod.saveAsPng(template, path.join(test_output_directory,'svgmod.replaceQrCode.test')));
      // verify QR code content has changed to http://www.google.com
    });
  });

  describe('replaceBoxedText', () => {
    // arrange
    let template = svgmod.openSVG(wikijump2x1.path);

    it('should modify boxed text with new text and handle line breaks', () => {
      // act
      svgmod.replaceBoxedText(template, wikijump2x1.name, 'I am some longer text that will surely not fit on one line')

      return svgmod.saveAsPng(template, path.join(test_output_directory,'svgmod.replaceBoxedText.test'));
      // verify name field is 'I am some longer text that will surely not fit on one line' with line breaks
    });
  });
});
