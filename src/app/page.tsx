"use client"
import styles from "./page.module.css"
import { useEffect, useState } from "react"
import { SessionContextValue, useSession } from "next-auth/react"
import { CustomSession } from "./api/auth/[...nextauth]/route"
import Link from "next/link"
import useWeb3Auth from "./hooks/useWeb3Auth"

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
