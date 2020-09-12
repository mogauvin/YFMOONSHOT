const Token = artifacts.require('./YFMSToken')
const Presale = artifacts.require('./YFMSTokenSale')

require('chai')
  .use(require('chai-as-promised'))
  .should()

const tokens = (n) => {
  return web3.utils.toWei(n.toString(), 'ether')
}

const EVM_REVERT = 'VM Exception while processing transaction: revert'

contract('Token', ([deployer, receiver, account, exchange]) => {
  const name = 'YF Moonshot'
  const symbol = 'YFMS'
  const decimals = '18'
  const initialSupply = tokens(35000).toString()

  let token

  beforeEach(async () => {
    token = await Token.new()
  })

  describe('deployment', async () => {
    it('tracks the name', async () => {
      const result = await token.name()
      result.should.equal(name)
    })

    it('tracks the symbol', async () => {
      const result = await token.symbol()
      result.should.equal(symbol)
    })

    it('tracks the decimals', async () => {
      const result = await token.decimals()
      result.toString().should.equal(decimals)
    })

    it('tracks the total supply', async () => {
      const result = await token.totalSupply()
      result.toString().should.equal(initialSupply)
    })

    it('assigns the total supply to the deployer', async () => {
      const result = await token.balanceOf(deployer)
      result.toString().should.equal(initialSupply)
    })

    it('test burning tokens [PASS]', async () => {
      await token.burn(tokens(1000), true, { from: deployer })
      const result = await token._presaleBurnTotal()
      const supply = await token.totalSupply() 
      const acc = await token.balanceOf(deployer)

      result.toString().should.equal(tokens(1000).toString())
      supply.toString().should.equal(tokens(34000).toString())
      acc.toString().should.equal(tokens(34000).toString())
    })

    it('test burning tokens [FAIL]', async () => {
      await token.burn(tokens(1000), true, { from: exchange })
          .should.be.rejectedWith(EVM_REVERT)
    })
  })

  describe('sending tokens', () => {
    let amount
    let result

    describe('success', () => {
      beforeEach(async () => {
        amount = tokens(100)
        result = await token.transfer(receiver, amount, { from: deployer })
      })

      it('transfers token balances', async () => {
        const balanceOfSender = await token.balanceOf(deployer)
        const balanceOfReceiver = await token.balanceOf(receiver)
        balanceOfSender.toString().should.equal(tokens(34900).toString())
        balanceOfReceiver.toString().should.equal(tokens(100).toString())
      })

      it('emits a Transfer event', async () => {
        const log = result.logs[0]
        log.event.should.eq('Transfer')
        const event = log.args
        event.from.should.eq(deployer, "from is correct")
        event.to.should.eq(receiver, "to is correct")
        event.value.toString().should.equal(amount.toString(), "amount is correct")
      })
    })

    describe('failure', () => {
      it('rejects insufficient balances', async () => {
        let invalidAmount
        // transfer exceeds supply limit.
        invalidAmount = tokens(10000000) // 10 million (1 million supply)
        await token.transfer(receiver, invalidAmount, { from: deployer })
          .should.be.rejectedWith(EVM_REVERT)

        // sending without any tokens.
        invalidAmount = tokens(10000000) // 10 million (1 million supply)
        await token.transfer(deployer, invalidAmount, { from: receiver})
          .should.be.rejectedWith(EVM_REVERT)
      })

      it('rejects invalid recipients', async () => {
        await token.transfer(0x0, amount, { from: deployer })
          .should.be.rejected
      })
    })
  })

  describe('approving tokens', () => {
    let result
    let amount

    beforeEach(async() => {
      amount = tokens(100)
      result = await token.approve(exchange, amount, { from: deployer }) 
    })

    describe('success', () => {
      it('allocates an allowance for delegated token spending on exchange', async () => {
        const allowance = await token.allowance(deployer, exchange)
        allowance.toString().should.equal(amount.toString()) 
      })

      it('emits an Approval event', async () => {
        const log = result.logs[0]
        log.event.should.eq('Approval')
        const event = log.args
        event.owner.should.eq(deployer, "owner is correct")
        event.spender.should.eq(exchange, "spender is correct")
        event.value.toString().should.equal(amount.toString(), "amount is correct")
      })
    })

    describe('failure', () => {
      it('rejects invalid spenders', async () => {
        await token.approve(0x0, amount, { from: deployer }).should.be.rejected
      })
    })
  })

  describe('transfering tokens after approval', () => {
    let result
    let amount

    beforeEach(async () => {
      amount = tokens(100)
      await token.approve(receiver, amount, { from: deployer })
    })

    describe('success', () => {
      beforeEach(async () => {
        result = await token.transferFrom(deployer, account, amount, { from: receiver })
      })

      it('transfers token balances', async () => {
        const balanceOfSender = await token.balanceOf(deployer)
        const balanceOfReceiver = await token.balanceOf(account)
        balanceOfSender.toString().should.equal(tokens(34900).toString())
        balanceOfReceiver.toString().should.equal(tokens(100).toString())
      })

      it('resets the allowance', async () => {
        const allowance = await token.allowance(deployer, receiver)
        allowance.toString().should.equal('0')
      })
    })

    describe('failure', () => {
      it('transfer too many tokens', async () => {
        const invalidAmount = tokens(1000)
        await token.transferFrom(deployer, account, invalidAmount, { from: receiver })
          .should.be.rejectedWith(EVM_REVERT)
      })

      it('rejects invalid recipients', async () => {
        await token.transferFrom(deployer, 0x0, amount, { from: receiver })
          .should.be.rejected
      })
    })
  })

  describe('testing the presale contract', async () => {
    let result
    let amount
    let presale

    beforeEach(async () => {
      // initialize presale, approve for tokens, then transfer funds.
      presale = await Presale.new(exchange)
      amount = tokens(10000)
      await token.approve(exchange, amount, { from: deployer })
      await token.transfer(exchange, amount, { from: deployer })
    })

    describe('success', async () => {
      it('balance should be amount', async () => {
        result = await token.balanceOf(exchange)
        result.toString().should.equal(tokens(10000).toString())
      })
    })
  })
})
