import MessageService from '../../services/message-service.js'

const ChatHandlers = {
    async getAllUserChats (messageData, senderId, socket, io) {
        const chats = await MessageService.getAllUserChats(senderId)

        const senderSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === senderId);

        senderSocket.emit('get_all_user_chats_response', chats)
    }
}

export default ChatHandlers;
