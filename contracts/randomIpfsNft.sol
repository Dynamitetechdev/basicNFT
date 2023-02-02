// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <=0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract randomNFT is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface private i_vrfInterface;

    uint256 private requestId;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subId;
    uint16 private constant REQUEST_CONFIRMATIONS = 1;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUMWORDS = 3;

    //VRF Helpers
    mapping(uint256 => address) public s_requestIdToAddress;

    constructor(
        address vrfCoorAddress,
        bytes32 keyHash,
        uint64 subId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoorAddress) {
        i_vrfInterface = VRFCoordinatorV2Interface(vrfCoorAddress);
        i_keyHash = keyHash;
        i_subId = subId;
        i_callbackGasLimit = callbackGasLimit;
    }

    function requestNft() public {
        requestId = i_vrfInterface.requestRandomWords(
            i_keyHash,
            i_subId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUMWORDS
        );

        /**
         *  Creating a mapping between the requestId and the address that requested it
         */
        s_requestIdToAddress[requestId] = msg.sender;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        /**
         * originally the caller of this function will be the chainkeepers, after the requestId function is been called.
         * but here we want to mint some nfts, meaning the chainKeeper will be the one minting the nfts, since it is the one calling the function. but we want who so ever address requested the nft, should be the one actually minting the ntf. so for this we create a mapping which maps the requestId to the address that requested it.
         */

        s_requestIdToAddress[requestId];
    }

    function tokenURI() public {}
}
