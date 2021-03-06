const Token = artifacts.require("YFMSToken")
const Presale = artifacts.require("YFMSTokenSale")

module.exports = async (deployer) => {
  deployer.deploy(Token).then(function(res) {
    return deployer.deploy(Presale, Token.address)
  });
}
