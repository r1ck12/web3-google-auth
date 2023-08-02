import Web3Auth from "@web3auth/single-factor-auth"
import { useState } from "react"
import { SessionContext } from "../page"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"

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
  const [loggedIn, setLoggedIn] = useState(false)

  const initWeb3Auth = async (session: SessionContext) => {
    const web3AuthSfa = new Web3Auth({
      clientId: process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID || "",
      web3AuthNetwork: "testnet",
      usePnPKey: false,
      sessionTime: 60,
    })

    await web3AuthSfa.init(provider)
    if (!web3Auth?.ready) setWeb3Auth(web3AuthSfa)
    if (session.status === "authenticated" && session.data.user && session.data.user.id) {
      const user = session.data.user

      if (web3Auth && web3Auth.ready) {
        try {
          const web3AuthSfaProvider = await web3Auth.connect({
            verifier: "google-testnet-0101",
            verifierId: user.email,
            idToken: user.id,
          })

          if (web3AuthSfaProvider) {
            const ethPrivateKey = await web3AuthSfaProvider.request({ method: "eth_private_key" })
            console.log(ethPrivateKey)
          }

          if (web3Auth.sessionId) {
            setLoggedIn(true)
          } else {
            console.log("not connected")
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  }

  return {
    initWeb3Auth,
    web3Auth,
    loggedIn,
  }
}

export default useWeb3Auth
