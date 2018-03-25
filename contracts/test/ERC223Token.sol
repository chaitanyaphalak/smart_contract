pragma solidity 0.4.19;

import "./Standard223Token.sol";

contract ERC223Token is Standard223Token {

    uint public totalSupply;
    string public name;
    uint8 public decimals;
    string public symbol;

  function ERC223Token(   
    uint _totalSupply,
    string _name,
    uint8 _decimals,
    string _symbol) public {        
        totalSupply = _totalSupply;
        name = _name;
        decimals = _decimals;
        symbol = _symbol;

        balances[msg.sender] = totalSupply;
    }
}