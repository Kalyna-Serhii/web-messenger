import {db} from "../database/database.config.js";
import {CollectionsNames} from "../database/collections.names.enum.js";

const ChatService = {
    async getChat(senderId, receiverId) {
        try {
            const chatQuerySnapshot1 = await db
                .collection(CollectionsNames.CHATS)
                .where('user1', '==', senderId)
                .where('user2', '==', receiverId)
                .get();
            if (!chatQuerySnapshot1.empty) {
                return chatQuerySnapshot1.docs[0];
            }

            const chatQuerySnapshot2 = await db
                .collection(CollectionsNames.CHATS)
                .where('user1', '==', receiverId)
                .where('user2', '==', senderId)
                .get();
            if (!chatQuerySnapshot2.empty) {
                return chatQuerySnapshot2.docs[0];
            }
        } catch (error) {
            throw error;
        }
    },

    async createChat(senderId, receiverId) {
        try {
            const newChatRef = await db.collection(CollectionsNames.CHATS).add({
                user1: senderId,
                user2: receiverId,
            });

            return newChatRef
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

                const interlocutorId = chatData.user1 === userId ? chatData.user2 : chatData.user1;

                const interlocutorSnapshot = await db.collection(CollectionsNames.USERS).doc(interlocutorId).get();
                const interlocutorName = interlocutorSnapshot.exists ? interlocutorSnapshot.data().name : 'Unknown';

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
                    interlocutor: interlocutorName,
                    interlocutorId,
                    messages,
                };
            }));

            return chats;
        } catch (error) {
            throw error;
        }
    },
}

export default ChatService;
