import { LiveList, LiveMap, createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

import { GameRound, UserId, exampleGameRound } from "../game"

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
})

// Presence represents the properties that will exist on every User in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
type Presence = {
  selectedEmoji: string | null
  selectedColor: string | null
}

// Optionally, Storage represents the shared document that persists in the
// Room, even after all Users leave. Fields under Storage typically are
// LiveList, LiveMap, LiveObject instances, for which updates are
// automatically persisted and synced to all connected clients.
type Storage = {
  gameRounds: LiveList<GameRound>
  userChoices: LiveMap<UserId, RoundChoicesForUser>
  currentRoundId: string | null
}

export const initialStorage: Storage = {
  gameRounds: new LiveList<GameRound>([exampleGameRound]),
  userChoices: new LiveMap(),
  currentRoundId: exampleGameRound.id,
}

type RoundId = GameRound["id"]
type ChoiceGroupId = string
type RoundChoicesForUser = LiveMap<RoundId, LiveMap<ChoiceGroupId, number>>

// Optionally, UserMeta represents static/readonly metadata on each User, as
// provided by your own custom auth backend (if used). Useful for data that
// will not change during a session, like a User's name or avatar.
// type UserMeta = {
//   id?: string,  // Accessible through `user.id`
//   info?: Json,  // Accessible through `user.info`
// };

// Optionally, the type of custom events broadcasted and listened for in this
// room. Must be JSON-serializable.
// type RoomEvent = {};

export const {
  suspense: {
    RoomProvider,
    useOthers,
    useUpdateMyPresence,
    useMyPresence,
    useRoom,
    useStorage,
    useMutation,
    useSelf,
  },
} = createRoomContext<
  Presence,
  Storage
  /* UserMeta, RoomEvent */
>(client)
