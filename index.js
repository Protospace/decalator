const https = require('https');
const fs = require('fs');

const API = "https://wiki.protospace.ca/api.php";

// request = API + "?action=parse&page=Laser_cutter,_large_(Rabbit_Laser_RL-80-1290)_ID:6&prop=text"
request = API + "?action=parse&page=6&prop=text"
https.get(request, res => {
  res.setEncoding("utf-8");
  let body = "";
  res.on("data", data => {
    body += data;
  });

  res.on("end", (err) => {
    if(err) throw err;
    console.log(body);
  })
});
