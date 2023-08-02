"use client"
import styles from "./page.module.css"
import { useEffect, useState } from "react"
import { SessionContextValue, useSession } from "next-auth/react"
import { CustomSession } from "./api/auth/[...nextauth]/route"
import Link from "next/link"
import useWeb3Auth from "./hooks/useWeb3Auth"
import { Avatar, Button, Flex } from "theme-ui"
import Image from "next/image"

export type SessionContext = Omit<SessionContextValue, "data"> & {
  data: CustomSession
}

export default function Home() {
  const session = useSession() as SessionContext
  const { initWeb3Auth, web3Auth, loggedIn } = useWeb3Auth()

  useEffect(() => {
    if (!loggedIn) initWeb3Auth(session)
  }, [session.status, web3Auth?.ready])

  return (
    <main className={styles.main}>
      <h1>Web3Auth login with Google</h1>
      <div className={styles.center}>
        <div className={styles.container}>
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
          {!loggedIn ? (
            <Link href="/api/auth/signin">
              <Button>Login</Button>
            </Link>
          ) : null}
          {loggedIn ? <Button>Logout</Button> : null}
          {loggedIn ? <Button variant="secondary">GetUserInfo</Button> : null}
        </div>
      </div>
    </main>
  )
}
