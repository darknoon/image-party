import { useMemo } from "react"
import { GetStaticPaths, NextPageContext } from "next"
import { useRouter } from "next/router"
import { LiveList, LiveMap } from "@liveblocks/client"
import { ClientSideSuspense } from "@liveblocks/react"
import clsx from "clsx"

import { ChoiceGroup, GameRound, exampleGameRound } from "@/lib/game"
import {
  RoomProvider,
  initialStorage,
  useMutation,
  useOthers,
  useRoom,
  useSelf,
  useStorage,
} from "@/lib/liveblocks/liveblocks.config"

/**
 * This function is used when deploying an example on liveblocks.io.
 * You can ignore it completely if you run the example locally.
 */
function useRoomId(): string {
  const { query } = useRouter()
  return query.roomId as string
}

function onEmojiClick(user) {
  console.log(user)
}

function Others() {
  const self = useSelf()
  const users = useOthers()

  const emojiOptions = [
    "🦊",
    "🦝",
    "🦦",
    "🦔",
    "🐘",
    "🦏",
    "🦛",
    "🦒",
    "🐪",
    "🦌",
    "🦜",
    "🦢",
    "🐿️",
    "🦔",
    "🐁",
    "🐇",
    "🦘",
    "🦥",
    "🦦",
    "🐾",
    "🦕",
    "🦖",
    "🦈",
    "🐬",
    "🦭",
    "🦦",
    "🐊",
    "🐢",
    "🐍",
    "🦎",
    "🐙",
    "🦑",
    "🦞",
    "🦐",
    "🐠",
    "🐟",
    "🐡",
    "🦜",
  ]

  return (
    <div>
      {emojiOptions.map((emoji) => {
        return (
          <div onClick={() => onEmojiClick(JSON.stringify(self))}>{emoji}</div>
        )
      })}
      {/* // <h1>Live Form Selection</h1>
      // <p>self: {JSON.stringify(self)}</p>
      {users.map(({ connectionId, presence, info }) => {
        return (
          <div onClick={() => onEmojiClick(users)}>{emoji}</div>
        )
      })} */}
    </div>
  )
}

export async function getStaticProps(context: NextPageContext) {
  // get roomId from path
  const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY
  const API_KEY_WARNING = process.env.CODESANDBOX_SSE
    ? `Add your public key from https://liveblocks.io/dashboard/apikeys as the \`NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY\` secret in CodeSandbox.\n` +
      `Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/nextjs-live-form-selection#codesandbox.`
    : `Create an \`.env.local\` file and add your public key from https://liveblocks.io/dashboard/apikeys as the \`NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY\` environment variable.\n` +
      `Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/nextjs-live-form-selection#getting-started.`

  if (!API_KEY) {
    console.warn(API_KEY_WARNING)
  }

  return { props: {} }
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  }
}

function Room() {
  const room = useRoom()
  const snapshot = room.getStorageSnapshot()
  const currentRound: GameRound | null = useStorage((storage) => {
    console.log("Storage in use", storage)
    const currentRoundId = storage.currentRoundId
    const rounds = storage.gameRounds
    return rounds.find((round) => round.id === currentRoundId) || null
  })
  return (
    <div>
      <h1>Current Room storage</h1>
      <p>Round id {snapshot.get("currentRoundId")}</p>
      {/* <div>
        stnap gameRounds:
        <pre className="font-mono">
          {JSON.stringify(stnap.get("gameRounds"))}
        </pre>
      </div>
      <div>
        currentRound:
        <pre className="font-mono">{JSON.stringify(currentRound)}</pre>
      </div> */}
      {currentRound && currentRound.phase === "PickingElements" && (
        <PickChoices round={currentRound} />
      )}
    </div>
  )
}

function PickChoiceFromGroup({ group }: { group: ChoiceGroup }) {
  const selfCxn = useSelf()
  const connectionId = selfCxn ? String(selfCxn.connectionId) : "unknown"

  const makeChoice = useMutation(({ storage }, index: number) => {
    // Read state when the mutation is called
    const currentRoundId = storage.get("currentRoundId")
    const userChoices = storage.get("userChoices")
    // update our user's choice
    let ourChoices = userChoices.get(connectionId)
    if (!ourChoices) {
      ourChoices = new LiveMap()
      userChoices.set(connectionId, ourChoices)
    }
    let roundChoices = ourChoices.get(currentRoundId)
    if (!roundChoices) {
      roundChoices = new LiveMap()
      ourChoices.set(currentRoundId, roundChoices)
    }
    roundChoices.set(group.id, index)
  }, [])

  const userChoice = useStorage((storage) => {
    const currentRoundId = storage.currentRoundId
    const userChoices = storage.userChoices
    if (!userChoices) return undefined
    const ourChoices = userChoices.get(connectionId)
    if (!ourChoices) return undefined
    const roundChoices = ourChoices.get(currentRoundId)
    if (!roundChoices) return undefined
    return roundChoices.get(group.id)
  })

  return (
    <ul>
      {group.choices.map((c, index) => {
        return (
          <li className="inline-block" key={c.text}>
            <button
              className={clsx(
                "p-3 m-3 rounded-lg bg-slate-300 hover:bg-slate-400",
                {
                  "bg-slate-400": userChoice === index,
                }
              )}
              onClick={() => makeChoice(index)}
              disabled={!selfCxn}
            >
              {c.text}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function PickChoices({ round }: { round: GameRound }) {
  return (
    <div>
      <h1>Round {round.id}</h1>
      {round.choices.map((choice) => {
        return (
          <div>
            <h2 className="text-lg font-bold">{choice.title}</h2>
            <PickChoiceFromGroup group={choice} key={choice.id} />
          </div>
        )
      })}
    </div>
  )
}

export default function Page() {
  const roomId = useRoomId()

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        selectedEmoji: null,
      }}
      initialStorage={initialStorage}
    >
      <ClientSideSuspense fallback={<div>Loading...</div>}>
        {() => (
          <div>
            <Others />
            <Room />
          </div>
        )}
      </ClientSideSuspense>
    </RoomProvider>
  )
}
