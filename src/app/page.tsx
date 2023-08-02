"use client"
import styles from "./page.module.css"
import { useEffect, useState } from "react"
import { SessionContextValue, useSession } from "next-auth/react"
import { CustomSession } from "./api/auth/[...nextauth]/route"
import Link from "next/link"
import useWeb3Auth from "./hooks/useWeb3Auth"
import { Avatar, Box, Button, Flex } from "theme-ui"
import Image from "next/image"
import useWeb3 from "./hooks/useWeb3"

export type SessionContext = Omit<SessionContextValue, "data"> & {
  data: CustomSession
}

export default function Home() {
  const session = useSession() as SessionContext
  const { initWeb3Auth, web3Auth, web3AuthProvider, loggedIn } = useWeb3Auth()
  const { getAccount } = useWeb3()
  const [account, setAccounts] = useState(null)

  useEffect(() => {
    if (!loggedIn) initWeb3Auth(session)
  }, [session.status, web3Auth?.ready])

  const getUserInfo = async () => {
    if (web3AuthProvider) {
      setAccounts(await getAccount(web3AuthProvider))
    }
  }

  return (
    <main className={styles.main}>
      <h1>Web3Auth login with Google</h1>
      <div className={styles.center}>
        <div className={styles.container}>
          <Flex sx={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1em"
          }}>
            {loggedIn && session.data && session.data.user ? (
              <Flex
                sx={{
                  alignItems: "center",
                  gap: "1em",
                }}
              >
                {session?.data?.user?.image ? <Avatar src={session.data.user.image} /> : null}
                {session?.data?.user?.name ? <h2>Welcome, {session.data.user.name}</h2> : null}
              </Flex>
            ) : null}
            <Flex sx={{
              gap: "1em"
            }}>
              {!loggedIn ? (
                <Link href="/api/auth/signin">
                  <Button>Login</Button>
                </Link>
              ) : null}
              {loggedIn ? <Button>Logout</Button> : null}
              {loggedIn ? (
                <Button variant="secondary" onClick={getUserInfo}>
                  GetUserInfo
                </Button>
              ) : null}
            </Flex>
            <Flex>{account ? <Box>Public Address: {account}</Box> : null}</Flex>
          </Flex>
        </div>
      </div>
    </main>
  )
}
