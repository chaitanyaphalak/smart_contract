
var BigNumber = require('bignumber.js');
var ForkDelta = artifacts.require("./ForkDelta.sol");
var ERC20Token = artifacts.require("./test/ERC20Token.sol");
var config = require('../truffle.js');

const userToken = 2000000;
const depositedEther = 100000;
const depositedToken = 1000000;

const ether=1000000000000000000;
const gwei =1000000000;

const ZERO_ADDRESS=0x0000000000000000000000000000000000000000;
/*
Accounts:
(0) 0x627306090abab3a6e1400e9345bc60c78a8bef57 Default account, owner/admin of the tokens
(1) 0xf17f52151ebef6c7334fad080c5704d77216b732 Owner/admin of the FD contract
(2) 0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef Account receiving fees
(3) 0x821aea9a577a9b44299b9c15c88cf3087f3b5544 Order maker
(4) 0x0d1d4e623d10f9fba5db95830f7d3839406c6af2 Order taker
(5) 0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e
(6) 0x2191ef87e392377ec08e7c08eb105ef5448eced5
(7) 0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5
(8) 0x6330a553fc93768f612722bb8c2ec78ac90b3bbc
(9) 0x5aeda56215b167893e80b4fe645ba6d5bab767de Account used for withdrawal tests
*/ 

//TODO: Add second ERC223 token and follow all along with ERC20 token 

contract('ForkDelta', function(accounts) {

  const gasPrice = config.networks.development.gasPrice;

  var FDInstance;
  var ERC20TokenInstance;
  var maker_account=accounts[4];

  var user_eth_balance_before;
  var user_token_balance_before;
  var contract_eth_balance_before;
  var contract_token_balance_before;
  var contract_user_eth_balance_before;
  var contract_user_token_balance_before;
  var user_eth_balance_after;
  var user_token_balance_after;
  var contract_eth_balance_after;
  var contract_token_balance_after;
  var contract_user_eth_balance_after;
  var contract_user_token_balance_after;


  async function balance_snapshot_before() {
    user_eth_balance_before = await web3.eth.getBalance(accounts[9]);
    user_token_balance_before = await ERC20TokenInstance.balanceOf(accounts[9]);
    contract_eth_balance_before = await web3.eth.getBalance(FDInstance.address);
    contract_token_balance_before = await ERC20TokenInstance.balanceOf(FDInstance.address);
    contract_user_eth_balance_before = await FDInstance.balanceOf(0x0,accounts[9]);
    contract_user_token_balance_before = await FDInstance.balanceOf(ERC20TokenInstance.address,accounts[9]);
  }

  async function balance_snapshot_after() {
    user_eth_balance_after = await web3.eth.getBalance(accounts[9]);
    user_token_balance_after = await ERC20TokenInstance.balanceOf(accounts[9]);
    contract_eth_balance_after = await web3.eth.getBalance(FDInstance.address);
    contract_token_balance_after = await ERC20TokenInstance.balanceOf(FDInstance.address);
    contract_user_eth_balance_after = await FDInstance.balanceOf(0x0,accounts[9]);
    contract_user_token_balance_after = await FDInstance.balanceOf(ERC20TokenInstance.address,accounts[9]);
  }

  before(async () => {
    FDInstance = await ForkDelta.deployed();
    ERC20TokenInstance = await ERC20Token.deployed();
    for (let account of accounts) {
      //distribute tokens to all accounts
      await ERC20TokenInstance.transfer(account, userToken);
    }
  });

  it("Depositing", async () => {
    var gasSpent = 0; 

    await balance_snapshot_before();

    for (let account of accounts) {
      //deposit tokens to all accounts in FD contract
      await ERC20TokenInstance.approve(FDInstance.address, depositedToken, {from: account}).then(function(result) {
        if (account==accounts[9]) gasSpent += result.receipt.gasUsed; 
      });
      await FDInstance.depositToken(ERC20TokenInstance.address, depositedToken, {from: account}).then(function(result) {
        if (account==accounts[9]) gasSpent += result.receipt.gasUsed; 
      });
      //deposit ether to all accounts in FD contract
      await FDInstance.deposit({from: account, value: depositedEther}).then(function(result) {
        if (account==accounts[9]) gasSpent += result.receipt.gasUsed; 
      });
    };
 
    await balance_snapshot_after();    

    assert.equal(user_eth_balance_after.toNumber(), user_eth_balance_before.toNumber() - depositedEther - gasSpent * gasPrice, "User ether balance was not decreased");
    assert.equal(user_token_balance_after.toNumber(), user_token_balance_before.toNumber() -depositedToken, "User token balance was not decreased");

    assert.equal(contract_token_balance_after.toNumber(), contract_token_balance_before.toNumber() + depositedToken *accounts.length, "Contract token balance was not increased");
    assert.equal(contract_eth_balance_after.toNumber(), contract_eth_balance_before.toNumber() + depositedEther *accounts.length, "Contract ether balance was not increased");

    assert.equal(contract_user_eth_balance_after.toNumber(), contract_user_eth_balance_before.toNumber() + depositedEther , "Contract user ether balance was not increased");
    assert.equal(contract_user_token_balance_after.toNumber(), contract_user_token_balance_before.toNumber() + depositedToken , "Contract user token balance was not increased");


  });

  it("Withdrawing", async () => {
    var gasSpent = 0; 

    await balance_snapshot_before();

    await FDInstance.withdraw(depositedEther, {from: accounts[9]}).then(function(result) {
      gasSpent += result.receipt.gasUsed; 
    });
    await FDInstance.withdrawToken(ERC20TokenInstance.address, depositedToken, {from: accounts[9]}).then(function(result) {
      gasSpent += result.receipt.gasUsed; 
    });

    await balance_snapshot_after();

  });

  it("Successful trades", function() {
    //TODO
  });

  it("Failed trades", function() {
    //TODO
  });

  it("Funds migration", function() {
    //TODO
  });

});
