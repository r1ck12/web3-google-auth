"use client"
import styles from "./page.module.css"
import { useEffect, useState } from "react"
import { SessionContextValue, signOut, useSession } from "next-auth/react"
import { CustomSession } from "./api/auth/[...nextauth]/route"
import Link from "next/link"
import useWeb3Auth from "./hooks/useWeb3Auth"
import { Avatar, Box, Button, Flex, Grid, Paragraph, Spinner } from "theme-ui"
import Image from "next/image"
import useWeb3 from "./hooks/useWeb3"

export type SessionContext = Omit<SessionContextValue, "data"> & {
  data: CustomSession
}

export default function Home() {
  const session = useSession() as SessionContext
  const { initWeb3Auth, web3Auth, web3AuthProvider, loggedIn, isLoading } = useWeb3Auth()
  const { getAccountAddress, getAccountPrivateKey, getBalance } = useWeb3()
  const [accountAddress, setAccountAddress] = useState(null)
  const [accountBalance, setAccountBalance] = useState(null)
  const [accountPrivateKey, setAccountPrivateKey] = useState(null)

  useEffect(() => {
    if (!loggedIn) initWeb3Auth(session)
  }, [session.status, web3Auth?.ready])

  const getUserInfo = async () => {
    if (web3AuthProvider) {
      setAccountAddress(await getAccountAddress(web3AuthProvider))
      setAccountPrivateKey(await getAccountPrivateKey(web3AuthProvider))
      setAccountBalance(await getBalance(web3AuthProvider))
    }
  }

  return (
    <main className={styles.main}>
      <h1>Web3Auth login with Google</h1>
      <div className={styles.center}>
        <div className={styles.container}>
          <Flex
            sx={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1em",
            }}
          >
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
            <Flex
              sx={{
                gap: "1em",
              }}
            >
              {isLoading ? <Spinner /> : null}
              {!loggedIn && !isLoading ? (
                <Link href="/api/auth/signin">
                  <Button>Login</Button>
                </Link>
              ) : null}
              {loggedIn ? <Button onClick={() => signOut()}>Logout</Button> : null}
              {loggedIn ? (
                <Button variant="secondary" onClick={getUserInfo}>
                  Get Account info
                </Button>
              ) : null}
            </Flex>
            {accountAddress ? (
              <Grid gap={2} columns={[2, "1fr 2fr"]}>
                <Box bg="secondary" p=".2em .5em">
                  Public Address
                </Box>
                <Box bg="muted" color="text" p=".2em .5em">
                  {accountAddress}
                </Box>
                <Box bg="secondary" p=".2em .5em">
                  Private Key
                </Box>
                <Box bg="muted" color="text" p=".2em .5em">
                  {accountPrivateKey}
                </Box>
                <Box bg="secondary" p=".2em .5em">
                  Balance
                </Box>
                <Box bg="muted" color="text" p=".2em .5em">
                  {accountBalance}
                </Box>
              </Grid>
            ) : null}
          </Flex>
        </div>
      </div>
    </main>
  )
}
