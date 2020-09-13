pragma solidity 0.6.0;

library SafeMath {
  /**
  * @dev Multiplies two unsigned integers, reverts on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (a == 0) {
        return 0;
    }

    uint256 c = a * b;
    require(c / a == b);

    return c;
  }

  /**
  * @dev Integer division of two unsigned integers truncating the quotient, reverts on division by zero.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // Solidity only automatically asserts when dividing by 0
    require(b > 0);
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold

    return c;
  }

  /**
  * @dev Subtracts two unsigned integers, reverts on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b <= a);
    uint256 c = a - b;

    return c;
  }

  /**
  * @dev Adds two unsigned integers, reverts on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a);

    return c;
  }

  /**
  * @dev Divides two unsigned integers and returns the remainder (unsigned integer modulo),
  * reverts when dividing by zero.
  */
  function mod(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b != 0);
    return a % b;
  }
}

interface ERC20 {
  function balanceOf(address who) external view returns (uint256);
  function allowance(address owner, address spender) external  view returns (uint256);
  function transfer(address to, uint value) external  returns (bool success);
  function transferFrom(address from, address to, uint256 value) external returns (bool success);
  function approve(address spender, uint value) external returns (bool success);
}

contract YFMSTokenSale {
  using SafeMath for uint256;

  uint256 public totalSold;
  ERC20 public YFMSToken;
  address payable public owner;

  uint256 public collectedETH;
  
  uint256 public startDate;

  constructor(address _wallet) public {
    owner = msg.sender;
    YFMSToken = ERC20(_wallet);
  }
 
  // Converts ETH to YFMS and sends new YFMS to the sender
  receive () external payable {
    require(startDate > 0 && now.sub(startDate) <= 7 days);
    require(YFMSToken.balanceOf(address(this)) > 0);
    require(msg.value >= 1 ether && msg.value <= 50 ether);
     
    uint256 amount;
        
    if (now.sub(startDate) <= 1 days) {
       amount = msg.value.mul(6);
    } else if(now.sub(startDate) > 1 days && now.sub(startDate) <= 2 days) {
       amount = msg.value.mul(11).div(2);
    } else if(now.sub(startDate) > 2 days && now.sub(startDate) <= 3 days) {
       amount = msg.value.mul(5);
    } else if(now.sub(startDate) > 3 days && now.sub(startDate) <= 4 days) {
       amount = msg.value.mul(9).div(2);
    } else if(now.sub(startDate) > 4 days) {
       amount = msg.value.mul(4);
    }
    
    require(amount <= YFMSToken.balanceOf(address(this)));
    totalSold = totalSold.add(amount);
    collectedETH = collectedETH.add(msg.value);
    YFMSToken.transfer(msg.sender, amount);
  }

  // Converts ETH to YFMS and sends new YFMS to the sender
  function contribute() external payable {
    require(startDate > 0 && now.sub(startDate) <= 7 days);
    require(YFMSToken.balanceOf(address(this)) > 0);
    require(msg.value >= 0.1 ether && msg.value <= 50 ether);
      
    uint256 amount;

    if (now.sub(startDate) <= 1 days) {
       amount = msg.value.mul(6);
    } else if(now.sub(startDate) > 1 days && now.sub(startDate) <= 2 days) {
       amount = msg.value.mul(11).div(2);
    } else if(now.sub(startDate) > 2 days && now.sub(startDate) <= 3 days) {
       amount = msg.value.mul(5);
    } else if(now.sub(startDate) > 3 days && now.sub(startDate) <= 4 days) {
       amount = msg.value.mul(9).div(2);
    } else if(now.sub(startDate) > 4 days) {
       amount = msg.value.mul(4);
    }
 
    require(amount <= YFMSToken.balanceOf(address(this)));
    totalSold = totalSold.add(amount);
    collectedETH = collectedETH.add(msg.value);
    YFMSToken.transfer(msg.sender, amount);
  }

  // Function to withdraw raised ETH (minimum 250)
  // Only the contract owner can call this function
  function withdrawETH() public {
    require(msg.sender == owner && address(this).balance > 0);
    uint256 amount = collectedETH;
    collectedETH = 0;
    owner.transfer(amount);
  }
  
  // Function to withdraw available YFMS
  // Only the contract owner can call this function
  function withdrawYFMS() public {
     require(msg.sender == owner && YFMSToken.balanceOf(address(this)) > 0);
     YFMSToken.transfer(owner, YFMSToken.balanceOf(address(this)));
  }
  
  //Starts the sale
  //Only the contract owner can call this function
  function startSale() public {
    require(msg.sender == owner && startDate==0);
    startDate=now;
  }
  
  //Function to query the supply of YFMS in the contract
  function availableYFMS() public view returns(uint256) {
    return YFMSToken.balanceOf(address(this));
  }
}
