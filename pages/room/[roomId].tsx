import { useMemo } from "react"
import { GetStaticPaths, NextPageContext } from "next"
import { useRouter } from "next/router"
import { ClientSideSuspense } from "@liveblocks/react"

import { ChoiceGroup, GameRound, exampleGameRound } from "@/lib/game"
import {
  RoomProvider,
  useMutation,
  useOthers,
  useRoom,
  useSelf,
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
  const storage = room.getStorageSnapshot()
  if (storage) {
    const rounds = storage.get("gameRounds")
    if (!rounds || rounds.length === 0) {
      storage.set("gameRounds", [exampleGameRound])
      storage.set("currentRoundId", exampleGameRound.id)
    }
  }
  const currentRound = exampleGameRound
  return (
    <div>
      <h1>Current Room storage</h1>
      <div>{JSON.stringify(storage)}</div>
      {currentRound.phase === "PickingElements" && (
        <PickChoices round={currentRound} />
      )}
    </div>
  )
}

function PickChoiceFromGroup({ group }: { group: ChoiceGroup }) {
  const selfCxn = useSelf()
  const connectionId = selfCxn ? selfCxn.connectionId : "unknown"

  const makeChoice = useMutation(({ storage }, index: number) => {
    const allRounds = storage.get("gameRounds")
    const currentRoundId = storage.get("currentRoundId")
    const currentRound = allRounds.find((r) => r.id === currentRoundId)
    const userChoices = currentRound.userChoices
    // update our user's choice
    const ourChoices = userChoices[connectionId]
    const newChoices = {
      ...ourChoices,
      [group.id]: index,
    }
    userChoices[connectionId] = newChoices
    // update the round
    currentRound.userChoices = userChoices
    // update the storage
    storage.set("gameRounds", allRounds)
  }, [])

  return (
    <ul>
      {group.choices.map((c, index) => {
        return (
          <li className="inline-block" key={c.text}>
            <button
              className="p-3 m-3 rounded-lg bg-slate-300 hover:bg-slate-400"
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
