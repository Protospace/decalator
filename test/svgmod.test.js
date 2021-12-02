const assert = require('assert');
const fs = require('fs');

// HACK: include root of this repo in module.paths so we can import our modules
// Feels like there's a right way to do this and this aint it
const path = require('path');
module.paths.push(path.resolve(module.path, '../'));

const svgmod = require('svgmod');

print = console.log;

describe('svgmod', ctx => {
  describe('openSVG', () => {
    result = svgmod.openSVG(svgmod.templates.wikijump2x1.path);

    it('should not be empty', () => {
      assert.ok(result);
    })

    it('should be an svg.js object', () => {
      assert.equal(result.type, "svg");
    })
  })

  describe('replaceText', () => {
    wikijump2x1 = svgmod.templates.wikijump2x1;
    // arrange
    template = svgmod.openSVG(wikijump2x1.path);
    input = svgmod.getElement(template, wikijump2x1.id);

    // act
    actualNode = svgmod.replaceText(input, "9999");
    it('should modify internal text of one node', () => {
      return svgmod.saveAsPng(template, "svgmod.replaceText.test");
    });
  });
});
