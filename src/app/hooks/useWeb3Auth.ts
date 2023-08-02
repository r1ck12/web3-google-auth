import Web3Auth from "@web3auth/single-factor-auth"
import { useState } from "react"
import { SessionContext } from "../page"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { SafeEventEmitterProvider } from "@web3auth/base"

const provider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig: {
      chainId: "0x5",
      rpcTarget: "https://rpc.ankr.com/eth_goerli",
      displayName: "Goerli Testnet",
      blockExplorer: "https://goerli.etherscan.io",
      ticker: "ETH",
      tickerName: "Ethereum",
    },
  },
})

const useWeb3Auth = () => {
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null)
  const [web3AuthProvider, setWeb3AuthProvider] = useState<SafeEventEmitterProvider | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const initWeb3Auth = async (session: SessionContext) => {
    if (session.status === "authenticated" && session.data.user && session.data.user.id) {
      setIsLoading(true)

      const web3AuthSfa = new Web3Auth({
        clientId: process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID || "",
        web3AuthNetwork: "testnet",
        usePnPKey: false,
        sessionTime: 60,
      })

      await web3AuthSfa.init(provider)
      if (!web3Auth?.ready) setWeb3Auth(web3AuthSfa)
      const user = session.data.user

      if (web3Auth && web3Auth.ready) {
        try {
          const web3AuthProvider = await web3Auth.connect({
            verifier: "google-testnet-0101",
            verifierId: user.email,
            idToken: user.id,
          })

          if (web3AuthProvider && web3Auth.sessionId) {
            setWeb3AuthProvider(web3AuthProvider)
            setLoggedIn(true)
            setIsLoading(false)
          } else {
            console.log("not connected")
          }
        } catch (e) {
          setIsLoading(false)
          console.error(e)
        }
      }
    }
  }

  return {
    initWeb3Auth,
    web3Auth,
    web3AuthProvider,
    loggedIn,
    isLoading,
  }
}

export default useWeb3Auth
