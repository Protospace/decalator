const assert = require('assert');

const wikimediaApi = require('../wikimediaApi');
describe('wikimediaApi', () => {
  describe('extractNameAndId', () => {
    const tests = [
      {
        input: 'Laser cutter, large (Rabbit Laser RL-80-1290) ID:6',
        expected: {
          name: 'Laser cutter, large (Rabbit Laser RL-80-1290)',
          id: '6',
        }
      },
      {
        input: 'Power supply, bench (GQ Electronics GQ-A305D) ID:26',
        expected: {
          name: 'Power supply, bench (GQ Electronics GQ-A305D)',
          id: '26',
        }
      },
      {
        input: 'Decade box, capacitance (Servomex Controls Decade Capacitor Type B) ID:15',
        expected: {
          name: 'Decade box, capacitance (Servomex Controls Decade Capacitor Type B)',
          id: '15',
        }
      },
    ]
    tests.forEach(({input, expected}) => {
      it(`correctly parses ${input} `, function() {
        const res = wikimediaApi.extractNameAndId(input);
        assert.strictEqual(res.name, expected.name);
        assert.strictEqual(res.id, expected.id);
      });
    });
  });
});
