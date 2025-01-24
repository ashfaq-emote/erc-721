// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;

import "./bases/ERC721.sol";
import "./governance/Governed.sol";

contract NonFungibleToken is ERC721, Governed {

    constructor() ERC721("Non Fungible Test Token", "NFTX1") {
        owner = msg.sender;
    }

    function whoOwnsToken() public view returns (address) {
        return owner;
    }

    function mintToken(address to, uint256 tokenId, bytes memory data) public isAdmin {
        /**
         * All minted assets will be deposited into _owner
         * _owner will later distribute assets across recipients
         */
        _safeMint(to, tokenId, data);
    }

}