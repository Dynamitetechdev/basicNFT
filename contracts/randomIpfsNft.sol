// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <=0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
error randomNFT_outOfBounds();
error randomNFT_lowFund();
error randomNFT_notSuccessful();

contract randomNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    enum NFT {
        DOG_NFT,
        DNM_NFT,
        ART_NFT
    }

    VRFCoordinatorV2Interface private i_vrfInterface;

    uint256 private immutable i_NFT_MINT_FEE;
    uint256 private _requestId;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subId;
    uint16 private constant REQUEST_CONFIRMATIONS = 1;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUMWORDS = 3;
    uint256 private constant MAX_CHANCE_VALUE = 100;
    uint256 public tokenId;

    //Events
    event NFTrequest(uint256 indexed requestId, address indexed Requester);
    event NFTMINT(NFT indexed nfts, address indexed minter);

    // NFT URI array
    string[] private _NFT_URI;
    //VRF Helpers
    mapping(uint256 => address) public s_requestIdToAddress;

    constructor(
        address vrfCoorAddress,
        bytes32 keyHash,
        uint64 subId,
        uint32 callbackGasLimit,
        string[3] memory NFT_URI,
        uint256 NFT_MINT_FEE
    ) VRFConsumerBaseV2(vrfCoorAddress) ERC721("DYNAMITE", "$DNM") {
        i_vrfInterface = VRFCoordinatorV2Interface(vrfCoorAddress);
        i_keyHash = keyHash;
        i_subId = subId;
        i_callbackGasLimit = callbackGasLimit;
        _NFT_URI = NFT_URI;
        i_NFT_MINT_FEE = NFT_MINT_FEE;
    }

    function requestNft() public payable {
        if (msg.value < i_NFT_MINT_FEE) revert randomNFT_lowFund();

        _requestId = i_vrfInterface.requestRandomWords(
            i_keyHash,
            i_subId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUMWORDS
        );

        /**
         *  Creating a mapping between the requestId and the address that requested it
         */
        s_requestIdToAddress[_requestId] = msg.sender;
        emit NFTrequest(_requestId, msg.sender);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        /**
         *
         * originally the caller of this function will be the chainkeepers, after the requestId function is been called.
         * but here we want to mint some nfts, meaning the chainKeeper will be the one minting the nfts, since it is the one calling the function. but we want who so ever address requested the nft, should be the one actually minting the ntf. so for this we create a mapping which maps the requestId to the address that requested it.
         *
         *
         */
        address NFT_OWNER = s_requestIdToAddress[requestId];

        // incresing the tokenId by 1, everytime an NFT is been minted, making the tokenId unique
        tokenId += tokenId;

        //tokenId
        uint256 newTokenId = tokenId;

        uint256 moddedRandomNo = randomWords[0] % MAX_CHANCE_VALUE; // returns the remainder of the calculation
        /**
         * So for instance
         * if we get back :
         * 4 we will get DOG NFT
         * 69 => ART NTF
         * 28 => DNM nft
         */
        NFT nfts = getNFTfromModdedRandomNo(moddedRandomNo);

        _safeMint(NFT_OWNER, newTokenId);

        /** setting the NFT image using ERC721URISTORAGE
         *
         * params:
         * 1. tokenId,
         * 2. the main TOKENURL, which in this case we have multiple. so we will be passing an array of tokenURIs
         */

        _setTokenURI(newTokenId, _NFT_URI[uint256(nfts)]);
        emit NFTMINT(nfts, NFT_OWNER);
    }

    /**
     * A function to get our NFT based on the modded Random Number we got.
     *
     */
    function getNFTfromModdedRandomNo(
        uint256 moddedRandonNo
    ) public pure returns (NFT) {
        uint256 cummulativeSum = 0;

        uint256[3] memory chanceArray = getChanceArray();

        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (
                moddedRandonNo >= cummulativeSum &&
                moddedRandonNo < cummulativeSum + chanceArray[i]
            ) {
                return NFT(i);
            }
            cummulativeSum += chanceArray[i];
        }

        revert randomNFT_outOfBounds();
    }

    /**
     * A Function to give us each % of rarity our NFTs should have
     *
     * 1.DOG nft
     * 2. DNM
     * 3. art
     */
    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        if (!success) revert randomNFT_notSuccessful();
    }

    function getMintFee() public view returns (uint256) {
        return i_NFT_MINT_FEE;
    }

    function getNFTURI(uint256 index) public view returns (string memory) {
        return _NFT_URI[index];
    }

    function getTokenId() public view returns (uint256) {
        return tokenId;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function requesterAddress(uint256 requestId) public view returns (address) {
        return s_requestIdToAddress[requestId];
    }
}
