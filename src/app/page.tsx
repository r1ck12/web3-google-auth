"use client"
import styles from "./page.module.css"
import { useEffect, useState } from "react"
import { SessionContextValue, signOut, useSession } from "next-auth/react"
import { CustomSession } from "./api/auth/[...nextauth]/route"
import Link from "next/link"
import useWeb3Auth from "./hooks/useWeb3Auth"
import { Avatar, Box, Button, Flex, Grid, Input, Spinner } from "theme-ui"
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
  const [encryptionPassword, setEncryptionPassword] = useState<string>("")
  const [encryptionSalt, setEncryptionSalt] = useState<string>("")
  const [encryptionIv, setEncryptionIv] = useState<string>("")
  const [encryptionCiphertext, setEncryptionCiphertext] = useState<string>("")
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState<string>("")

  const { data } = session
  useEffect(() => {
    if (!loggedIn) initWeb3Auth(session)
  }, [session.status, web3Auth?.ready])

  const uploadBackup = async () => {
    if (!session) {
      console.error("No session found")
      return
    }

    const wallet = {
      address: "your_wallet_address",
      privateKey: "your_private_key",
    }

    const password = "123123"
    const auth = {
      access_token: data.user.access_token,
    }

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.access_token}`,
        },
        body: JSON.stringify({ wallet, password, auth }),
      })

      if (response) {
        console.log("Backup uploaded successfully")
      } else {
        console.error("Failed to upload backup:", response)
      }
    } catch (error) {
      console.error("Error uploading backup:", error)
    }
  }

  const getUserInfo = async () => {
    if (web3AuthProvider) {
      setAccountAddress(await getAccountAddress(web3AuthProvider))
      setAccountPrivateKey(await getAccountPrivateKey(web3AuthProvider))
      setAccountBalance(await getBalance(web3AuthProvider))
    }
  }

  const decryptBackup = async () => {
    if (encryptionPassword && encryptionIv && encryptionSalt && encryptionCiphertext) {
      try {
        const response = await fetch("/api/decrypt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            encryptedData: {
              salt: encryptionSalt,
              iv: encryptionIv,
              ciphertext: encryptionCiphertext,
            },
            password: encryptionPassword,
          }),
        })

        if (response.ok) {
          console.log("Backup decrypted successfully")
          const data = await response.json()
          setDecryptedPrivateKey(data.privateKey)
        } else {
          console.error("Failed to decrypt backup:", response)
        }
      } catch (error) {
        console.error("Error decrypting backup:", error)
      }
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
              alignItems: "flex-start",
              justifyContent: "flex-start",
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
                alignItems: "flex-start",
                justifyContent: "flex-start",
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
              {loggedIn ? (
                <Button variant="secondary" onClick={uploadBackup}>
                  Upload Backup
                </Button>
              ) : null}
              {loggedIn ? (
                <Flex
                  sx={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1em",
                  }}
                >
                  <Input
                    type="password"
                    placeholder="password"
                    value={encryptionPassword}
                    onChange={(e) => setEncryptionPassword(e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="salt"
                    value={encryptionSalt}
                    onChange={(e) => setEncryptionSalt(e.target.value)}
                  />
                  <Input
                    type="iv"
                    placeholder="iv"
                    value={encryptionIv}
                    onChange={(e) => setEncryptionIv(e.target.value)}
                  />
                  <Input
                    type="ciphertext"
                    placeholder="ciphertext"
                    value={encryptionCiphertext}
                    onChange={(e) => setEncryptionCiphertext(e.target.value)}
                  />
                  <Button variant="secondary" onClick={decryptBackup}>
                    Decrypt Backup
                  </Button>
                </Flex>
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

            {decryptedPrivateKey ? (
              <Grid>
                <Box bg="secondary" p=".2em .5em">
                  Private Key
                </Box>
                <Box bg="muted" color="text" p=".2em .5em">
                  {decryptedPrivateKey}
                </Box>
              </Grid>
            ) : null}
          </Flex>
        </div>
      </div>
    </main>
  )
}
