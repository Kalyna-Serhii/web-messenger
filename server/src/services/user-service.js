import {db} from "../database/database.config.js";
import {CollectionsNames} from "../database/collections.names.enum.js";
import ChatService from "./chat-service.js";

const UserService = {
    async getUsersWithoutChat(userId) {
        const usersSnapshot = await db.collection(CollectionsNames.USERS).get();
        const allUsers = usersSnapshot.docs.map((userDoc) => {
            return {
                userId: userDoc.id,
                ...userDoc.data(),
            };
        });

        const userChats = await ChatService.getAllUserChats(userId);
        const userChatInterlocutorIds = userChats.map((chat) => chat.interlocutorId);

        const usersWithoutChat = allUsers.filter((user) => {
            return user.userId !== userId && !userChatInterlocutorIds.includes(user.userId);
        });

        return usersWithoutChat.map((user) => ({ userId: user.userId, name: user.name }));
    },
}

export default UserService;
