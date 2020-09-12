require("babel-register")
require("babel-polyfill")
require("dotenv").config()

/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const fs = require('fs')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const mnemonic = "library ecology idle toddler because you reduce outside risk cotton famous tree"
const addresses = [
  "831eb0cb3f952067d5547342032b501367efa00c57eea13701475f1334b50544",
  "692f4d67569b673ed6289bddbc6489a7e6b28aadb9d9c4d42ac212c306bed4b5",
  "12a84b083c0b23d65f2df9eb3153f2823616b5400e2121489c9e1edd10e62599"
]

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    ropsten: {
      provider: () => {
        return new HDWalletProvider(addresses, `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`, 0, 3)
      },
      gasPrice: 20000000000,
      network_id: 3
    }
  },
  contracts_directory: "./contracts",
  contracts_build_directory: "./abis/",
  compilers: {
    solc: {
      version: "0.6.0",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
