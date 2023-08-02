"use client"
import styles from "./page.module.css"
import { useEffect, useState } from "react"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { SessionContextValue, useSession } from "next-auth/react"
import Web3Auth from "@web3auth/single-factor-auth"
import { CustomSession } from "./api/auth/[...nextauth]/route"
import Link from "next/link"

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

type SessionContext = Omit<SessionContextValue, "data"> & {
  data: CustomSession
}

export default function Home() {
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const session = useSession() as SessionContext

  useEffect(() => {
    const initWeb3Auth = async () => {
      const web3AuthSfa = new Web3Auth({
        clientId: "BLicDSGdbxEgzIyECDxPX-uLaVjgdCqwVDMlGeODmhYfJPZbN_X9E2_J9wrYT5-goyT5iPqsKZEawe1opOWUy30",
        web3AuthNetwork: "testnet",
        usePnPKey: false,
      })

      web3AuthSfa.init(provider)
      if (session.status === "authenticated" && session.data.user && session.data.user.id) {
        const user = session.data.user

        if (web3AuthSfa.ready) {
          try {
            const web3AuthSfaProvider = await web3AuthSfa.connect({
              verifier: "google-testnet-0101",
              verifierId: user.email,
              idToken: user.id,
            })
            if (web3AuthSfaProvider) {
              const ethPrivateKey = await web3AuthSfaProvider.request({ method: "eth_private_key" })
              console.log(ethPrivateKey)
            }

            if (web3AuthSfa.sessionId) {
              console.log("connected")
              setLoggedIn(true)
            } else {
              console.log("not connected")
            }

            setWeb3Auth(web3AuthSfa)
          } catch (e) {
            console.error(e)
          }
        }
      }
    }

    if (!loggedIn) initWeb3Auth()
  }, [session])

  return (
    <main className={styles.main}>
      <h1>Web3Auth login with Google</h1>
      <div className={styles.center}>
        <div className={styles.container}>
          {!loggedIn ? (
            <Link href="/api/auth/signin">
              <button>Login</button>
            </Link>
          ) : null}
          {loggedIn ? <button>Logout</button> : null}
          <button>GetUserInfo</button>
        </div>
      </div>
    </main>
  )
}
