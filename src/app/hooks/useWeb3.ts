import { SafeEventEmitterProvider } from "@web3auth/base"
import { ethers, formatEther } from "ethers"

const useWeb3 = () => {
  const getAccountAddress = async (web3AuthProvider: SafeEventEmitterProvider): Promise<any> => {
    try {
      const ethersProvider = new ethers.BrowserProvider(web3AuthProvider)

      const signer = await ethersProvider.getSigner()

      const address = signer.getAddress()

      return await address
    } catch (e) {
      console.error(e)
      return e
    }
  }

  const getBalance = async (web3AuthProvider: SafeEventEmitterProvider): Promise<any> => {
    try {
      const ethersProvider = new ethers.BrowserProvider(web3AuthProvider)

      const signer = await ethersProvider.getSigner()

      const account = await signer.getAddress()
      // Get user's balance in ether
      const balance = await ethersProvider.getBalance(account)

      const formattedBalance = formatEther(balance)
      return formattedBalance
    } catch (e) {
      console.error(e)
      return e
    }
  }

  const getAccountPrivateKey = async (web3AuthProvider: SafeEventEmitterProvider): Promise<any> => {
    const ethPrivateKey = await web3AuthProvider.request({ method: "eth_private_key" })

    return ethPrivateKey
  }


  return {
    getAccountAddress,
    getAccountPrivateKey,
    getBalance,
  }
}

export default useWeb3