import { io } from "socket.io-client";

export const initSocket = async (backend_url) => {
    const options = {
        'force new connection': true,
        'reconnectionAttempt': 'Infinity',
        'timeout': 10000,
        'transports': ['websocket']
    }

    return io(backend_url, options);
}