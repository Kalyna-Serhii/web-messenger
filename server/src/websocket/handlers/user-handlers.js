import UserService from "../../services/user-service.js";

const UserHandlers = {
    async getUsersWithoutChat(_, senderId, socket, io) {
        const users = await UserService.getUsersWithoutChat(senderId);

        const senderSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === senderId);

        senderSocket.emit('get_all_users_without_chat_response', users)
    },
}

export default UserHandlers;
