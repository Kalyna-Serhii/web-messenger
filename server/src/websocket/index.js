import { Server } from 'socket.io';
import { setupEventHandlers } from './handlers/index.js';

export default (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
        },
    });

    console.log('Socket is initialised')

    setupEventHandlers(io);

    return io;
};
