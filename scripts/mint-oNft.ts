import hre from 'hardhat'
import { log, switchNetwork } from "./common"
import { parseEther } from 'ethers/lib/utils'

const main = async () => {
    const nftAddr = "0xdf31Ca8bF6deFaC71f9c535EEe038A03767418ae"
    const blqsAddr = "0x9A8b5566B942e63d406c7E99aAA3eFF926930d57"
    const testWalletAddr = "0x1e27331a4D54Ae17EE868e4e67d6A83a6d3AbECD"  // metamask First
    const oftAmount = parseEther("100")
    switchNetwork('l1')
    const [signer] = await hre.ethers.getSigners()
    const blqs = await hre.ethers.getContractAt(
      'L1StandardERC20',
      blqsAddr,
    )
    const mintBlqsTx = await blqs['mint(address,uint256)'](testWalletAddr, oftAmount)
    const receipt1 = await mintBlqsTx.wait()
    const l1Balance = await blqs.balanceOf(testWalletAddr)

    log(
        'done',
        `    tx: ${mintBlqsTx.hash} (gas: ${receipt1.gasUsed})`,
        `    balance on Hub-Layer  : ${l1Balance} \n\n`,
      )
    
    // 1. deploy l1 nft market
    const l1NftMarket = await hre.ethers.getContractFactory("L1NftMarket")
    const l1NftMarketContract = await l1NftMarket.deploy(nftAddr, blqsAddr)
    await l1NftMarketContract.deployed()
    console.log("Contract deployed to address:", l1NftMarketContract.address)
    // 2. make nft market mine role
    const l1onft = await hre.ethers.getContractAt(
        'L1StandardERC721',
        nftAddr,
      )
    const tx = await l1onft.grantRole(l1onft.MINTER_ROLE(), l1NftMarketContract.address)
    const receipt = await tx.wait()
    log(
        'done',
        `    tx: ${tx.hash} (gas: ${receipt.gasUsed}) \n\n`,
      )
  }
  
  main()