import MessageService from '../../services/message-service.js';
import emitToParticipants from '../utils/emit-to-participants.js'

const MessageHandlers = {
    async sendMessage(messageData, senderId, socket, io) {
        const { message, isNewChat } = await MessageService.sendMessage(messageData, senderId);
        emitToParticipants('send_message_response', { message, isNewChat }, [senderId, messageData.receiverId], io);
    },

    async editMessage(messageData, senderId, socket, io) {
        const message = await MessageService.editMessage(messageData, senderId);
        emitToParticipants('edit_message_response', { message }, [senderId, messageData.receiverId], io);
    },

    async deleteMessage(messageData, senderId, socket, io) {
        const message = await MessageService.deleteMessage(messageData, senderId);
        emitToParticipants('delete_message_response', { message }, [senderId, messageData.receiverId], io);
    },
};

export default MessageHandlers;
