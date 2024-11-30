import MessageService from '../../services/message-service.js'

const MessageHandler = {
    async sendMessage (messageData, senderId, socket, io) {
        const message = await MessageService.sendMessage(messageData, senderId)

        const participantIds = [senderId, messageData.receiverId]

        participantIds.forEach(participantId => {
            const participantSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === participantId);
            if (participantSocket) {
                participantSocket.emit('send_message_response', message);
            }
        });
    },

    async editMessage (messageData, senderId, socket, io) {
        const message = await MessageService.editMessage(messageData)

        const participantIds = [senderId, messageData.receiverId]

        participantIds.forEach(participantId => {
            const participantSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === participantId);
            if (participantSocket) {
                participantSocket.emit('edit_message_response', message);
            }
        });
    },

    async deleteMessage (messageData, senderId, socket, io) {
        const messageId = await MessageService.deleteMessage(messageData, senderId)

        const participantIds = [senderId, messageData.receiverId]

        participantIds.forEach(participantId => {
            const participantSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === participantId);
            if (participantSocket) {
                participantSocket.emit('delete_message_response', {deletedMessageId: messageId});
            }
        });
    },

    async getAllUserChats (messageData, senderId, socket, io) {
        const chats = await MessageService.getAllUserChats(senderId)

        const senderSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === senderId);

        senderSocket.emit('get_all_user_chats_response', chats)
    }
}

export default MessageHandler;
