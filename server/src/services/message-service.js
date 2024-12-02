import {db} from "../database/database.config.js";
import {CollectionsNames} from "../database/collections.names.enum.js";
import ChatService from "./chat-service.js";

const MessageService = {
    async sendMessage(messageData, userId) {
        try {
            const { receiverId, text } = messageData;

            let isNewChat = false
            let chat = await ChatService.getChat(userId, receiverId);
            if (!chat) {
                chat = await ChatService.createChat(userId, receiverId);
                isNewChat = true
            }

            const chatId = chat.id || chat.ref.id;

            const newMessageRef = await db.collection(CollectionsNames.MESSAGES).add({
                chatId,
                userId,
                text,
                createdAt: new Date(),
            });

            const newMessageDoc = await newMessageRef.get();
            const newMessageData = newMessageDoc.data();

            const message = {
                chatId,
                messageId: newMessageDoc.id,
                userId: newMessageData.userId,
                text: newMessageData.text,
                createdAt: newMessageData.createdAt,
                receiverId,
            }

            return {message, isNewChat};
        } catch (error) {
            throw error;
        }
    },

    async editMessage(messageData, senderId) {
        try {
            const { chatId, messageId, text } = messageData;

            const messageSnapshot = await db
                .collection(CollectionsNames.MESSAGES)
                .doc(messageId)
                .get();

            const messageAuthor = messageSnapshot?.data()?.userId;

            if (!messageSnapshot.empty && messageAuthor === senderId) {
                const newMessageRef = messageSnapshot.ref;
                await newMessageRef.update({
                    text,
                });

                const newMessageDoc = await newMessageRef.get();
                const newMessageData = newMessageDoc.data();

                return {chatId, messageId, text: newMessageData.text};
            }
        } catch (error) {
            throw error;
        }
    },

    async deleteMessage(messageData, senderId) {
        try {
            const {messageId, chatId} = messageData

            const messageSnapshot = await db
                .collection(CollectionsNames.MESSAGES)
                .doc(messageId)
                .get();

            const messageAuthor = messageSnapshot?.data()?.userId

            if (!messageSnapshot.empty && messageAuthor === senderId) {

                await messageSnapshot.ref.delete();

                return {messageId: messageSnapshot.ref.id, chatId};
            }
        } catch (error) {
            throw error;
        }
    },

    async getAllUserChats(userId) {
        try {
            const chatQuerySnapshot = await db.collection(CollectionsNames.CHATS)
                .where('user1', '==', userId)
                .get();

            const chatQuerySnapshot2 = await db.collection(CollectionsNames.CHATS)
                .where('user2', '==', userId)
                .get();

            const allChatsSnapshot = [...chatQuerySnapshot.docs, ...chatQuerySnapshot2.docs];

            const chats = await Promise.all(allChatsSnapshot.map(async (chatDoc) => {
                const chatData = chatDoc.data();
                const chatId = chatDoc.id;

                const receiverId = chatData.user1 === userId ? chatData.user2 : chatData.user1;

                const receiverSnapshot = await db.collection(CollectionsNames.USERS).doc(receiverId).get();
                const receiverName = receiverSnapshot.exists ? receiverSnapshot.data().name : 'Unknown';

                const messagesSnapshot = await db.collection(CollectionsNames.MESSAGES)
                    .where('chatId', '==', chatId)
                    .orderBy('createdAt', 'asc')
                    .get();

                const messages = messagesSnapshot.docs.map((messageDoc) => {
                    return {
                        messageId: messageDoc.id,
                        ...messageDoc.data(),
                    };
                })

                return {
                    chatId,
                    receiverName,
                    receiverId,
                    messages,
                };
            }));

            return chats;
        } catch (error) {
            throw error;
        }
    }
}

export default MessageService;
