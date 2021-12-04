const fs = require('fs');

print = console.log

// TODO: proper logging
// TODO: add function docs

// main
getPage('6', (body, err) => {
  if (err) throw err;
  console.log(body);
});
