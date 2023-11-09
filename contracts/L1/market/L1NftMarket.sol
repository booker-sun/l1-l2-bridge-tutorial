// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '../token/L1StandardERC721.sol';

contract L1NftMarket is Ownable, ReentrancyGuard {
    address public nftContract;
    address public acceptedTokenAddress;
    uint256 public feePrice = 0.001 ether;

    constructor(address _nftContract, address _acceptedTokenAddress) {
        nftContract = _nftContract;
        acceptedTokenAddress = _acceptedTokenAddress;
    }

    function mintWithToken(uint256 tokenId, uint256 price) public nonReentrant {
        require(
            price >= feePrice,
            'Price should be at least same as listing price'
        );
        IERC20(acceptedTokenAddress).transferFrom(
            msg.sender,
            address(this),
            price
        );
        L1StandardERC721(nftContract).mint(msg.sender, tokenId);
    }
}
