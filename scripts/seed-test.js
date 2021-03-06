
const Token   = artifacts.require("YFMSToken")
const Presale = artifacts.require("YFMSTokenSale")

// Utils
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' // Ether token deposit address

const ether = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}
const tokens = (n) => ether(n)

const weiToEth = (n) => {
  return web3.utils.fromWei(n.toString(), 'ether')
}

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

module.exports = async function(callback) {
  try {
    let balance
    // Fetch accounts from wallet - these are unlocked
    const accounts = await web3.eth.getAccounts()

    // Fetch the deployed token
    const token = await Token.deployed()
    const presale = await Presale.deployed()
    
    // Give tokens to account[1]
    const deployer = accounts[0]
    const account1 = accounts[1]
    const account2 = accounts[2]
    
    console.log(`Presale address: ${presale.address}`)

    balance = await token.balanceOf(deployer)
    console.log(`Owner balance: ${balance.toString()}`)

    // approve presale address to sell tokens.
    await token.approve(presale.address, tokens(5000), { from: deployer })
    // transfer the tokens & log it.
    await token.transfer(presale.address, tokens(5000), { from: deployer })
    console.log(`Transferred ${weiToEth(tokens(5000))} tokens from ${deployer} to ${presale.address}`)

    // start the presale. [first fail with not owner]
    try {
      await presale.startSale({ from: account1 })
    } catch (err) {
      console.log("Invalid request: not owner")
    }

    await presale.startSale({ from: deployer })
    console.log("Presale started!")

    // send tokens from an invalid address.
    try {
      await presale.contribute({ from: "0x0", value: tokens(1) }) 
    } catch (err) {
      console.log("Error: invalid address")
    }
   

    // run a mock sale using 1/2 supply.
    let remaining
    let purchase

    for (let i=0; i < 30; i++) {
      if (i % 10 !== 0) {
        // buffer for a second.
        remaining = await presale.availableYFMS()
        console.log(weiToEth(remaining))

        // generate random number -- tokens to buy.
        purchase = Math.ceil(Math.random() * 10)
        
        try {
          await presale.contribute({ from: accounts[i % 10], value: tokens(purchase) || tokens(1) })
        } catch (err) {
          console.log(err)
        }
        console.log(`${accounts[i % 10]} Purchased ${weiToEth(tokens(purchase))} ETH of $YFSM`)

        // get value of address contributions.
        const contributions = await presale.contributions(accounts[i % 10]);
        const numberOfCont = await presale.numberOfContributions(accounts[i % 10]);
        const avgPurchase = await presale.averagePurchaseRate(accounts[i % 10]);

        console.log(`${weiToEth(contributions)} - ${numberOfCont} - ${avgPurchase}`)
        // try to buy back Ether.

        balance = await token.balanceOf(accounts[i % 10])
        console.log(`${accounts[i % 10]} Balance: ${weiToEth(balance)}\n`)
      }
    }

    for (let i=1; i < 10; i++) {
      try {
        await presale.buyBackETH(accounts[i % 10])
        console.log(`${accounts[i % 10]} bought back.`)
      } catch (err) {
          console.log("ERROR: cannot withdraw funds")
      }
    }

    // print off collect ETH and remaining YFMS
    const collected = await presale.collectedETH()
    console.log(`Collected ETH: ${weiToEth(collected)}`)
    remaining = await presale.availableYFMS()
    console.log(`Remaining YFMS: ${weiToEth(remaining)}`)

    // withdraw ETH [fail first]
    try {
      await presale.withdrawETH({ from: account1 })
    } catch (err) {
      console.log("ETH withdraw failed: not owner")
    }

    await presale.withdrawETH({ from: deployer })
    console.log("ETH withdrawn")
        
  } catch(error) {
    console.log(error)
  }

  callback()
}
