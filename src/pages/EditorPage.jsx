import React, {useEffect, useRef, useState} from 'react';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import MenuIcon from "@mui/icons-material/Menu";
import { Javascript } from '@mui/icons-material';
// const backend_url = import.meta.env.VITE_APP_BACKEND_URL;



function EditorPage() {
    const socketRef = useRef(null);
    const location = useLocation();
    const codeRef = useRef({});
    const reactNavigator = useNavigate();
    const {roomId} = useParams();
    const [clients, setClients] = useState([]);
    const [srcCode, setSrcCode] = useState('');

    useEffect(() => {
        const backend_url = import.meta.env.VITE_APP_BACKEND_URL;
        console.log(backend_url)
        const init = async () => {
            socketRef.current = await initSocket(backend_url);
            // console.log('SocketRef', socketRef.current);
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('Socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username
            });

            //Listening for joined event
            socketRef.current.on(ACTIONS.JOINED, ({clients, username, socketId}) => {
                if(username == location.state?.username) {
                    toast.success('Welcome to the room');
                }
                else {
                    toast.success(`${username} joined the room`);
                }
                console.log('line 48', clients);
                setClients(clients);
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    mode: 'xml',
                    code: codeRef.current['xml'],
                    socketId,
                });
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    mode: 'css',
                    code: codeRef.current['css'],
                    socketId,
                });
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    mode: 'javascript',
                    code: codeRef.current['javascript'],
                    socketId,
                });
            });

            //Listening for someone disconnected event
            socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, username}) => {
                toast.success(`${username} left the room`);
                setClients((prev) => {
                    return prev.filter(client => client.socketId !== socketId);
                })
            })
        }
        init();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        }
    }, [])

    const copyRoomId = async() => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.log(err);
        }
    }

    const onLeaveRoom = () => {
        reactNavigator('/');
    }
    const runCode = () => {
        const tempSrcCode = `
        <html>
        <body>${codeRef.current['xml']}</body>
        <style>${codeRef.current['css']}</style>
        <script>${codeRef.current['javascript']}</script>
        </html>
        `;
        setSrcCode(tempSrcCode);

    }
    const onCodeChange = (mode, code) => {
        codeRef.current[mode] = code;
        console.log('line102', codeRef.current);
        runCode();
    }

    if(!location.state) {
        <Navigate />
    }

    return (
        <>
            <MenuIcon sx={{height: '30px', color: 'white'}} />
            <div className="mainWrap">
                <div className="aside">
                    <div className="asideInner">
                        <div className="logo">
                            <img 
                                src="/code-logo.jpg" 
                                alt="code logo image" 
                                className="logoImage" 
                            />
                        </div>
                        <h3>Connected</h3>
                        <div className="clientsList">
                            {clients.map((client) => {
                                console.log('client socketId', client.sockedId);
                                return (
                                    <Client key={client.socketId} username={client.username} />
                                )
                            })}
                        </div>
                    </div>
                    <button className='btn copyBtn' onClick={copyRoomId}>COPY ROOM ID</button>
                    <button className='btn leaveBtn' onClick={onLeaveRoom}>Leave</button>
                </div>
                <div className="editorWrap">
                    <div className="inputWrap">
                        <Editor mode={'xml'} socketRef={socketRef} roomId={roomId} onCodeChange={onCodeChange} />
                        <Editor mode={'css'} socketRef={socketRef} roomId={roomId} onCodeChange={onCodeChange} />
                        <Editor mode={'javascript'} socketRef={socketRef} roomId={roomId} onCodeChange={onCodeChange} />
                        
                    </div>
                    <div className="outputWrap">
                        <iframe srcDoc={srcCode} title='Output' sandbox='allow-scripts' width='100%' height='100%' />
                    </div>
                </div>
            </div>
        </>
    )
}

export default EditorPage
