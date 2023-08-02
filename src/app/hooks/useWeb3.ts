import { SafeEventEmitterProvider } from "@web3auth/base"
import { ethers } from "ethers";

const useWeb3 = () => {
  const getAccount = async (web3AuthProvider: SafeEventEmitterProvider): Promise<any> => {
    try {
      const ethersProvider = new ethers.BrowserProvider(web3AuthProvider);

      const signer = await ethersProvider.getSigner();

      const address = signer.getAddress();

      return await address;
    } catch (error) {
      return error;
    }
  }

  return {
    getAccount
  }
}

export default useWeb3