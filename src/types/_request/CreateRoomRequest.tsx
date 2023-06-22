import { RoomTypeOfServer } from "types/chats/rooms/Room";

export interface CreateRoomRequest {
  joined_user_ids: number[];
  admin_id: number;
  type: RoomTypeOfServer;
}
