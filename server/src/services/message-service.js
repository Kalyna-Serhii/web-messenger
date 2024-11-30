import {db} from "../database/database.config.js";
import {CollectionsNames} from "../database/collections.names.enum.js";
import ChatService from "./chat-service.js";

const MessageService = {
    async sendMessage(messageData, senderId) {
        const {receiverId, text} = messageData

        let chat

        const alreadyCreatedChat = await ChatService.getChat(senderId, receiverId)
        if (alreadyCreatedChat) {
            chat = alreadyCreatedChat
        } else {
            chat = await ChatService.createChat(senderId, receiverId);
        }

        const newMessageRef = await db.collection(CollectionsNames.MESSAGES).add({
            chatId: chat.id,
            userId: senderId,
            text,
            createdAt: new Date()
        });
        const newMessageDoc = await newMessageRef.get();
        const newMessageData = newMessageDoc.data()

        return newMessageData.text;
    },

    async editMessage(messageData) {
        const {messageId, text} = messageData

        const newMessageRef = db
            .collection(CollectionsNames.MESSAGES)
            .doc(messageId);

        await newMessageRef.update({
            text,
        });

        const newMessageDoc = await newMessageRef.get();
        const newMessageData = newMessageDoc.data();

        return newMessageData.text;
    },

    async deleteMessage(messageData, senderId) {
        const {messageId} = messageData

        const messageSnapshot = await db
            .collection(CollectionsNames.MESSAGES)
            .doc(messageId)
            .get();

        const messageAuthor = messageSnapshot?.data()?.userId

        if (!messageSnapshot.empty && messageAuthor === senderId) {

            await messageSnapshot.ref.delete();

            return messageSnapshot.ref.id;
        }
    },

    async getAllUserChats(userId) {
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

            const messagesSnapshot = await db.collection(CollectionsNames.MESSAGES)
                .where('chatId', '==', chatId)
                .orderBy('createdAt', 'asc')
                .get();

            const messages = messagesSnapshot.docs.map((messageDoc) => {
                return {
                    messageId: messageDoc.id,
                    ...messageDoc.data(),
                };
            });

            return {
                chatId,
                participants: [chatData.user1, chatData.user2],
                messages,
            };
        }));

        return chats;
    }

}

export default MessageService;
