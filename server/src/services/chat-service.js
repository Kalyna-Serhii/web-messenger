import {db} from "../database/database.config.js";
import {CollectionsNames} from "../database/collections.names.enum.js";

const ChatService = {
    async getChat(senderId, receiverId) {
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
    },

    async createChat(senderId, receiverId) {
        const newChatRef = await db.collection(CollectionsNames.CHATS).add({
            user1: senderId,
            user2: receiverId,
        });

        return newChatRef
    },
}

export default ChatService;
