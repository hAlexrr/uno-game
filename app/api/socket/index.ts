import { NextApiResponse } from "next";
import { NextApiRequest } from "next";
import { Server } from "socket.io";
import { Server as NetServer } from "http";
import { v4 as uuidv4 } from 'uuid';

interface SocketServer extends NetServer {
    io?: Server;
}

type SocketResponse = NextApiResponse & {
    socket: {
        server: SocketServer;
    };
}

const SocketHandler = (req: NextApiRequest, res: SocketResponse) => {
    if(res.socket.server.io) {
        console.log('Socket is already attached.');
        return res.end()
    }

    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    let players: {
        id: string;
        roomId: string;
        name: string;
    }[] = [];

    io.on("connection", (socket) => {
        console.log(`User Connected: ${socket.id}`);

        socket.on('player-join', (roomId: string, name: string) => {
            const {rooms} = io.sockets.adapter;
            const room = rooms.get(roomId);

            if(room) {
                if(players.find((player) => player.id === socket.id)) {
                    socket.emit('player-already-joined', roomId);
                    return;
                }

                players.push({id: socket.id, roomId, name});
                socket.join(roomId);
                socket.emit('player-joined', socket.id, name);
                socket.to(roomId).emit('player-joined', socket.id, name);
            } else {
                socket.emit('room-not-found', roomId);
            }
        })

        socket.on('create-room', () => {
            const roomId = uuidv4();
            socket.join(roomId);
            socket.emit('room-created', roomId);
            players.push({id: socket.id, roomId, name: ''});
            socket.emit('player-joined', socket.id, '');
            socket.to(roomId).emit('player-joined', socket.id, '');
        })

        socket.on('player-leave', (roomId: string) => {
            socket.leave(roomId);
            socket.emit('player-left', socket.id);
        })

        socket.on('player-move', (roomId: string, move: string) => {
            socket.to(roomId).emit('player-move', socket.id, move);
        })

        socket.on('player-disconnect', (roomId: string) => {
            socket.leave(roomId);
            socket.to(roomId).emit('player-left', socket.id);
        })
        
    }) 

    return res.end()
}

export default SocketHandler;
