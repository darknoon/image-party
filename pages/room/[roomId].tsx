import { useMemo } from "react"
import { GetStaticPaths, NextPageContext } from "next"
import { useRouter } from "next/router"

import { GameRound, exampleGameRound } from "@/lib/game"
import {
  RoomProvider,
  useOthers,
  useRoom,
  useSelf,
  useMyPresence,
} from "@/lib/liveblocks/liveblocks.config"

/**
 * This function is used when deploying an example on liveblocks.io.
 * You can ignore it completely if you run the example locally.
 */
function useRoomId(): string {
  const { query } = useRouter()
  return query.roomId as string
}



function Others() {
  const [myPresence, updateMyPresence] = useMyPresence();
  const self = useSelf()

  function onEmojiClick(user, emoji, background) {
    updateMyPresence({selectedEmoji: emoji, selectedColor: background})
  }

  const emojiOptions = ["🦊", "🦝", "🦦", "🦔", "🐘", "🦏", "🦛", "🦒", "🐪", "🦌", "🦜", "🦢", "🐿️", "🦔", "🐁", "🐇", "🦘", "🦥", "🦦", "🐾", "🦕", "🦖", "🦈", "🐬", "🦭", "🦦", "🐊", "🐢", "🐍", "🦎", "🐙", "🦑", "🦞", "🦐", "🐠", "🐟", "🐡", "🦜"];
  const backgroundColors = [
    "bg-gray-100",
    "bg-gray-200",
    "bg-gray-300",
    "bg-gray-400",
    "bg-gray-500",
    "bg-gray-600",
    "bg-gray-700",
    "bg-gray-800",
    "bg-gray-900",
    "bg-red-100",
    "bg-red-200",
    "bg-red-300",
    "bg-red-400",
    "bg-red-500",
    "bg-red-600",
    "bg-red-700",
    "bg-red-800",
    "bg-red-900",
    "bg-orange-100",
    "bg-orange-200",
    "bg-orange-300",
    "bg-orange-400",
    "bg-orange-500",
    "bg-orange-600",
    "bg-orange-700",
    "bg-orange-800",
    "bg-orange-900",
    "bg-yellow-100",
    "bg-yellow-200",
    "bg-yellow-300",
    "bg-yellow-400",
    "bg-yellow-500",
    "bg-yellow-600",
    "bg-yellow-700",
    "bg-yellow-800",
    "bg-yellow-900",
    "bg-green-100",
    "bg-green-200",
    "bg-green-300",
    "bg-green-400",
    "bg-green-500",
    "bg-green-600",
    "bg-green-700",
    "bg-green-800",
    "bg-green-900",
    "bg-teal-100",
    "bg-teal-200"];

  const emojiSize = 10;
 
  return (
    <div className="grid grid-cols-4">
      <div className={`text-5xl rounded-full w-${emojiSize} h-${emojiSize} ${myPresence.selectedColor}`}>{myPresence.selectedEmoji}</div>
      {emojiOptions.map((emoji, index) => {
        return (
          <div className={`text-5xl rounded-full w-${emojiSize} h-${emojiSize} ${backgroundColors[index]}`} onClick={() => onEmojiClick(JSON.stringify(self), emoji, backgroundColors[index])}>{emoji}</div>
        )
        })}
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

function PickChoices({ round }: { round: GameRound }) {
  return (
    <div>
      <h1>Round {round.id}</h1>
      {round.choices.map((choice) => {
        return (
          <div>
            <h2 className="text-lg font-bold">{choice.title}</h2>
            <ul>
              {choice.choices.map((c) => {
                return (
                  <li className="inline-block p-3 m-3 rounded-lg bg-slate-300 hover:bg-slate-400">
                    {c.text}
                  </li>
                )
              })}
            </ul>
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
        selectedColor: '#000',
      }}
    >
      
      <Room />
      <Others />
    </RoomProvider>
  )
}
