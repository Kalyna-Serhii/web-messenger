function emitToParticipants(event, data, participantIds, io) {
    participantIds.forEach((participantId) => {
        const participantSocket = Array.from(io.sockets.sockets.values()).find((s) => s.userId === participantId);
        if (participantSocket) {
            participantSocket.emit(event, data.message);
            if (data.isNewChat && event === 'send_message_response') {
                participantSocket.emit('new_chat_created');
            }
        }
    });
}

export default emitToParticipants;
