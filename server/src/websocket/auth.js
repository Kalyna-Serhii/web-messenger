import tokenService from "../services/token-service.js";

export function checkAuth(socket) {
    try {
        const userData = getUserData(socket)

        if (!userData) {
            socket.disconnect()
        }
    } catch (error) {
        socket.disconnect()
    }
}

export async function getUserData(socket) {
    try {
        const token = socket.handshake.headers.cookie?.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
        const userData = await tokenService.validateAccessToken(token);
        if (!userData) {
            socket.disconnect()
        }

        return userData
    } catch (error) {
        socket.disconnect()
    }
}
