import {getUserData} from "../auth.js";
import MessageHandler from './message-handlers.js'

export const setupEventHandlers = (io) => {
    io.on('connection', async (socket) => {
        const userData = await getUserData(socket)

        socket.userId = userData.id;

        console.log(`User connected: ${socket.id}`);

        socket.on('message', async (data) => {
            try {
                const userData = await getUserData(socket)
                const userId = userData.id
                const event = data.event;
                const messageData = data.message;

                await handleEvent(event, messageData, userId, socket, io);
            } catch (error) {
                console.error(`Error handling message from ${socket.id}: ${error.message}`);
            }
        })


        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

async function handleEvent(event, messageData, userId, socket, io) {
    const eventHandlers = {
        send_message: MessageHandler.sendMessage,
        edit_message: MessageHandler.editMessage,
        delete_message: MessageHandler.deleteMessage,
        get_all_user_chats: MessageHandler.getAllUserChats,
    };

    const handler = eventHandlers[event];
    if (handler) {
        handler(messageData, userId, socket, io);
    } else {
        console.error(`Unknown event: ${event}`);
    }
}
