var ForkDelta = artifacts.require("./ForkDelta.sol");
var LSafeMath = artifacts.require("./LSafeMath.sol");

var ERC20Token   = artifacts.require("./test/ERC20Token.sol");
var ERC223Token  = artifacts.require("./test/ERC223Token.sol");

module.exports = function(deployer, network, accounts) {
  
  if (network == "develop" || network == "development") {
    admin = accounts[1]
    feeAccount = accounts[2];
    feeMake = 0;
    feeTake = 3000000000000000;
    freeUntilDate= 0;
    deployer.deploy(ERC20Token,   100000000*1000000000000000000 , "ERC20Token",  18, "E20");    
    deployer.deploy(ERC223Token,  100000000*1000000000000000000 , "ERC223Token", 14, "E223");    
  }
  
  if (network == "live" || network == "production") {
    //TODO: set admin and fee accounts for production
    admin = null
    feeAccount = null;
    feeMake = 0;
    feeTake = 3000000000000000;
    freeUntilDate= 0;
  }

deployer.deploy(LSafeMath);
deployer.link(LSafeMath, ForkDelta);
deployer.deploy(ForkDelta, admin, feeAccount, feeMake, feeTake, freeUntilDate);
}

