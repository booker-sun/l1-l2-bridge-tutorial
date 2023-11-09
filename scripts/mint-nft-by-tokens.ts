import hre from 'hardhat'
import { log, switchNetwork } from './common'
import { parseEther } from 'ethers/lib/utils'

const main = async () => {
  const marketAddr = '0x9Fe7E56aca2243638adEEC0047618a6dA22189F9'
  const blqsAddr = "0x9A8b5566B942e63d406c7E99aAA3eFF926930d57"
  const testWalletAddr = '0x1e27331a4D54Ae17EE868e4e67d6A83a6d3AbECD' // metamask First

  const price = parseEther('0.002')
  const nftTokenId = 101
  switchNetwork('l1')
  const [signer] = await hre.ethers.getSigners()
  const market = await hre.ethers.getContractAt('L1NftMarket', marketAddr)
  const l1blqs = await hre.ethers.getContractAt(
    'L1StandardERC20',
    blqsAddr,
  )
  // approve
  const approveTx = await l1blqs.approve(marketAddr, price)
  const approveReceipt = await approveTx.wait()

  log(
    'done',
    `    tx: ${approveTx.hash} (gas: ${approveReceipt.gasUsed})\n\n`,
  )
  
  // mint with user token
  const mintBlqsTx = await market['mintWithToken(uint256,uint256)'](
    nftTokenId,
    price,
  )
  const mintReceipt = await mintBlqsTx.wait()

  log(
    'done',
    `    tx: ${mintBlqsTx.hash} (gas: ${mintReceipt.gasUsed})`,
    `    tx status: ${mintReceipt.status} \n\n`,
  )
}

main()
