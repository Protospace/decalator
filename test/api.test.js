var assert = require("assert");
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../index");
let should = chai.should();
chai.use(chaiHttp);

print = console.log

describe("root", function(){
  it("should return 200", done => {
    chai.request(server)
      .get("/")
      .send({})
      .end((err,res)=>{
        res.should.have.status(200);
        done();
      });
  });
  /// some other tests we will write here
});
