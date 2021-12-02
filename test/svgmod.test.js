const assert = require('assert');
const { createSVGWindow } = require('svgdom')
const window = createSVGWindow()
const document = window.document
const { SVG, registerWindow } = require('@svgdotjs/svg.js')
registerWindow(window, document)

print = console.log;

// HACK: include root of this repo in module.paths so we can import our modules
// Feels like there's a right way to do this and this aint it
const path = require('path');
module.paths.push(path.resolve(module.path, '../'));

const svgmod = require('svgmod');

describe('svgmod', () => {
  describe('replaceText', () => {
    // arrange
    input = SVG().svg(`<text xml:space="preserve" style="font-size:5.10065px;line-height:1.25;font-family:'Liberation Sans';-inkscape-font-specification:'Liberation Sans';stroke-width:0.127517" x="83.396477" y="8.3947868" id="toolId"><tspan id="tspan1270" x="83.396477" y="8.3947868" style="font-weight:bold;stroke-width:0.127517">1234</tspan></text>`);
    expected = `<text xml:space="preserve" style="font-size:5.10065px;line-height:1.25;font-family:'Liberation Sans';-inkscape-font-specification:'Liberation Sans';stroke-width:0.127517" x="83.396477" y="8.3947868" id="toolId"><tspan id="tspan1270" x="83.396477" y="8.3947868" style="font-weight:bold;stroke-width:0.127517">9999</tspan></text>`;
    actualNode = svgmod.replaceText(input, "9999");
    print(input.children())

    it('should modify internal text of one node', () => {
      assert.equal(actualNode.svg(), expected);
    });
  });
});

