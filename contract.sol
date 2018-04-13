pragma solidity ^0.4.0;

contract PasswordFormat {

    mapping(bytes20 => bytes32)  public passwordFormat;
    mapping(bytes20 => address)  private passwordOwner;

    address public owner;

    event Deposit(
        address indexed from,
        uint256 value
    );

    modifier onlyOwner()
    {
        require(msg.sender == owner);
        _;
    }
    function PasswordFormat() public {
        owner = msg.sender;
    }
    function addPasswordFormat(bytes20 passwordHash, bytes32 format) public payable {
        if(passwordOwner[passwordHash] != 0)
        {
            require(passwordOwner[passwordHash] == msg.sender);//, "only the owner of the password can change it");
        }
        passwordFormat[passwordHash] = format;
        passwordOwner[passwordHash]  = msg.sender;
        if(msg.value> 0)
        {
            emit Deposit(msg.sender, msg.value);
        }
    }
    function () public payable {
        emit Deposit(msg.sender, msg.value);
    }
    function withdraw() public onlyOwner {
        owner.transfer(address(this).balance);
    }
}
