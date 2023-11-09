import hre from 'hardhat'
import { BigNumber } from 'ethers'
import { TransactionReceipt } from '@ethersproject/abstract-provider'

import {
  getCrossDomainMessageHashesFromTx,
  getTransactionReceiptFromMsgHash,
  switchNetwork,
  addresses,
  log,
} from './common'

// Get the token address on the Hub-Layer created by L1StandardERC20Factory.
const getL1ERC20AddressFromReceipt = (receipt: TransactionReceipt): string => {
  const logs = receipt.logs.filter(
    (x) =>
      x.address === addresses.l1.L1StandardERC20Factory &&
      x.topics[0] === hre.ethers.utils.id('ERC20Created(string,address)'),
  )
  for (const log of logs) {
    const [address] = hre.ethers.utils.defaultAbiCoder.decode(
      ['address'],
      log.topics[2],
    )
    return address
  }
}

// Get the token address on the Verse-Layer created by L2StandardTokenFactory.
const getL2ERC20AddressFromReceipt = (receipt: TransactionReceipt): string => {
  const logs = receipt.logs.filter(
    (x) =>
      x.address === addresses.l2.L2StandardTokenFactory &&
      x.topics[0] ===
        hre.ethers.utils.id('StandardL2TokenCreated(address,address)'),
  )
  for (const log of logs) {
    const [address] = hre.ethers.utils.defaultAbiCoder.decode(
      ['address'],
      log.topics[2],
    )
    return address
  }
}

const main = async () => {
  switchNetwork('l2')
  const l2oft = await hre.ethers.getContractAt(
    'L2StandardERC20',
    '0x2Ff4BD31de3366adBA4dC38E0a6e61a44Ee77269',
  )

  const getBalance = async (): Promise<BigNumber[]> => {
    switchNetwork('l1')
    const l1Balance = await l1oft.balanceOf(signer.address)

    switchNetwork('l2')
    const l2Balance = await l2oft.balanceOf(signer.address)

    return [l1Balance, l2Balance]
  }
  const oFT_AMOUNT = 999999999999999

  // Get Hub-Layer pre-deployed contracts.
  switchNetwork('l1')
  const [signer] = await hre.ethers.getSigners()

  const l1oft = await hre.ethers.getContractAt(
    'L1StandardERC20',
    '0x3690f1215DfEAd94e89C6E29968056dBA1DA4b0B',
  )

  /**
   * Step 3
   */
  log('[Hub-Layer] Mint oFT...')

  switchNetwork('l1')
  const tx3 = await l1oft['mint(address,uint256)'](signer.address, oFT_AMOUNT)
  const receipt3 = await tx3.wait()

  let [l1Balance, l2Balance] = await getBalance()
  log(
    'done',
    `    tx: ${tx3.hash} (gas: ${receipt3.gasUsed})`,
    `    balance on Hub-Layer  : ${l1Balance}`,
    `    balance on Verse-Layer: ${l2Balance}\n\n`,
  )
}

main()
