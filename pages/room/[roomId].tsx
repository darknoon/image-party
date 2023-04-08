import { useMemo } from "react"
import { GetStaticPaths, NextPageContext } from "next"
import { useRouter } from "next/router"

import { RoomProvider, useOthers } from "@/lib/liveblocks/liveblocks.config"

/**
 * This function is used when deploying an example on liveblocks.io.
 * You can ignore it completely if you run the example locally.
 */
function useOverrideRoomId(roomId: string) {
  const { query } = useRouter()
  const overrideRoomId = useMemo(() => {
    return query?.roomId ? `${roomId}-${query.roomId}` : roomId
  }, [query, roomId])

  return overrideRoomId
}

function Others() {
  const users = useOthers()
  return (
    <div>
      <h1>Live Form Selection</h1>
      {users.map(({ connectionId, presence, info }) => {
        return (
          <div>
            {connectionId} - {presence.selectedId} - {JSON.stringify(info)}
          </div>
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

export default function Page() {
  const { query } = useRouter()
  const roomId = useOverrideRoomId("nextjs-live-form-selection")

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        selectedId: null,
      }}
    >
      <Others />
    </RoomProvider>
  )
}
