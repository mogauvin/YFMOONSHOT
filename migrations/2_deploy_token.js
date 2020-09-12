const Token = artifacts.require("YFMSToken")
const Presale = artifacts.require("YFMSTokenSale")

module.exports = async (deployer) => {
  await deployer.deploy(Token)
  await deployer.deploy(Presale, Token.address)
}
