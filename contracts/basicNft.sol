// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <=0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    uint256 private s_tokenId;
    string private constant _tokenURI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    constructor() ERC721("0xdynamite", "$DNM") {
        s_tokenId = 0;
    }

    /**
     * For this minting we need two params,
     * 1. The Msg.sender
     * 2. tokenId, and the token Id need to be unique based on the amount of NFTs we have on the contract.
     */

    function _mint() public returns (uint256) {
        _safeMint(msg.sender, s_tokenId);
        s_tokenId += 1;
        return s_tokenId;
    }

    function tokenURI(
        uint256 /* tokenId */
    ) public pure override returns (string memory) {
        return _tokenURI;
    }

    function getTokenId() public view returns (uint256) {
        return s_tokenId;
    }
}
