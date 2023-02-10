// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

error DNFT_invalidTokenURI();

contract DynamicNFT is ERC721 {
    uint256 public tokenId;
    string private i_lowSvg;
    string private i_highSvg;
    AggregatorV3Interface public immutable i_priceFeeds;

    mapping(uint256 => int256) public s_tokenIdToValue;
    string public constant SVGBASE64PREFIX = "data:image/svg+xml;base64,";

    event createdNFT(uint256 indexed tokenId, int256 indexed tokenValue);

    constructor(
        address AggregatorInterfaceAddress,
        string memory lowSvg,
        string memory Highsvg
    ) ERC721("DynamicNFT", "DNFT") {
        i_priceFeeds = AggregatorV3Interface(AggregatorInterfaceAddress);
        i_lowSvg = svgToImageURI(lowSvg);
        i_highSvg = svgToImageURI(Highsvg);
    }

    // allow the minter to choose values, so our contract can display NFT based of their values
    function mintNFT(int256 tokenValue) public {
        s_tokenIdToValue[tokenId] = tokenValue;
        tokenId += 1;
        _safeMint(msg.sender, tokenId);
        emit createdNFT(tokenId, tokenValue);
    }

    // a function to convert our SVG image to encode our svg to byte, so we can use it as our IMAGEURI;

    //1. encodePack The svg
    //2. typeCast it to a string
    //3. typeCast it to a byte(this is the input parameter required our base64-sol)
    //4. return the base64 result and typeCast it back to a string

    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        string memory svgToBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return string(abi.encodePacked(SVGBASE64PREFIX, svgToBase64Encoded));
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        if (_exists(_tokenId)) revert DNFT_invalidTokenURI();
        string memory imageURI = i_lowSvg;

        (, int price, , , ) = i_priceFeeds.latestRoundData();

        // if the price is higher than some value, then show the high NFT, else show the low NFT

        //also if s_tokenIdToValue[_tokenId] deliver a value lower than the price, we will return the lowerSVG and Vice Versa
        if (price >= s_tokenIdToValue[_tokenId]) {
            imageURI = i_highSvg;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '","description":"Good NFTs","image":"',
                                imageURI,
                                '","attributes":[{"trait_type":"cuteness","value":100}]}'
                            )
                        )
                    )
                )
            );
    }

    function __lowSvg() public view returns (string memory) {
        return i_lowSvg;
    }
}
