import React, { useRef } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useAtom } from "jotai"
import clsx from "clsx"

import { usernameAtom, avatarAtom } from "../atoms"
import useSocket from "../hooks/use-socket"
import useScreenFactor from "../hooks/use-screen-factor"

import UsernameInput from "../components/username-input"
import Arrow from "../assets/arrow.svg"
import Logo from "../components/logo"

import type { Message as SendMessage } from "@evil-cards/server/src/lib/ws/receive"
import type { Message as ReceiveMessage } from "@evil-cards/server/src/lib/ws/send"

const Entry: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const screenStyles = useScreenFactor({
    ref: containerRef,
    px: 40,
    py: 40
  })
  const { sendJsonMessage, connected } = useSocket<
    SendMessage,
    ReceiveMessage
  >()
  const [username, setUsername] = useAtom(usernameAtom)
  const [avatarId, setAvatarId] = useAtom(avatarAtom)
  const searchParams = useSearchParams()
  const joining = searchParams.has("s")

  return (
    <main className="h-screen">
      <div
        ref={containerRef}
        style={screenStyles}
        className="flex w-[20.625rem] flex-col items-center justify-center gap-8"
      >
        <Logo />
        <div className="flex aspect-[0.71942446043] w-48 flex-col items-center justify-center gap-5 rounded-lg bg-gray-100 pt-3">
          <div className="rounded-full border-[2px] border-gray-900 p-[2px]">
            <div className="relative">
              <button
                onClick={() =>
                  setAvatarId((prev) => (prev == 17 ? 1 : prev + 1))
                }
                className="absolute -right-5 top-1/2 flex h-[25px] w-[25px] -translate-y-1/2 items-center justify-center rounded-full bg-gray-900"
              >
                <Arrow className="rotate-180" />
              </button>
              <Image
                src={`/avatars/${avatarId}.svg`}
                width={120}
                height={120}
                alt=""
              />
              <button
                onClick={() =>
                  setAvatarId((prev) => (prev == 1 ? 17 : prev - 1))
                }
                className="absolute -left-5 top-1/2 flex h-[25px] w-[25px] -translate-y-1/2 items-center justify-center rounded-full bg-gray-900"
              >
                <Arrow />
              </button>
            </div>
          </div>
          <UsernameInput value={username} onChange={setUsername} />
        </div>
        <button
          onClick={() => {
            const s = searchParams.get("s")
            if (s) {
              sendJsonMessage({
                type: "joinsession",
                details: {
                  username,
                  sessionId: s,
                  avatarId
                }
              })
            } else {
              sendJsonMessage({
                type: "createsession",
                details: {
                  username,
                  avatarId
                }
              })
            }
          }}
          className={clsx(
            "rounded-lg bg-red-500 px-5 py-4 text-xl leading-none text-gray-100",
            "transition-colors enabled:hover:bg-gray-100 enabled:hover:text-red-500",
            "disabled:opacity-50"
          )}
          disabled={!connected}
        >
          {joining ? "ВОЙТИ" : "НАЧАТЬ"}
        </button>
      </div>
    </main>
  )
}

export default Entry
