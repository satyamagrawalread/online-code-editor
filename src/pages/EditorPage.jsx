import React, {useEffect, useRef, useState} from 'react';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import MenuIcon from "@mui/icons-material/Menu";
// import { Javascript } from '@mui/icons-material';
// const backend_url = import.meta.env.VITE_APP_BACKEND_URL;



function EditorPage() {
    const socketRef = useRef(null);
    const location = useLocation();
    const codeRef = useRef({});
    const reactNavigator = useNavigate();
    const {roomId} = useParams();
    const [clients, setClients] = useState(null);
    const [srcCode, setSrcCode] = useState('');
    const [isAsideVisible, setIsAsideVisible] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState({
        'xml': false,
        'css': false,
        'javascript': false,
    })

    useEffect(() => {
        const backend_url = import.meta.env.VITE_APP_BACKEND_URL;
        // console.log(backend_url)
        const init = async () => {
            socketRef.current = await initSocket(backend_url);
            console.log('SocketRef', socketRef.current);
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
                // console.log('line 51', clients);
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
    // useEffect(() => {
    //     console.log('line 86', clients);
    // }, [clients])

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
        <script>
          ${codeRef.current['javascript']}
        </script>
        </html>
        `;
        setSrcCode(tempSrcCode);
    }
    // const runCode = () => {
    //     // const encodedJsCode = encodeURIComponent(codeRef.current['javascript']);
    //     const encodedJsCode = encodeURIComponent(codeRef.current['javascript']);
    //     const tempSrcCode = `
    //         <html>
    //         <body>${codeRef.current['xml']}</body>
    //         <style>${codeRef.current['css']}</style>
    //         <script>
    //           // Decoding and embedding the JavaScript code
    //           try {
    //             var decodedJsCode = decodeURIComponent("${encodedJsCode}");
    //             ${encodedJsCode}
    //           } catch (error) {
    //             console.error("Error in JavaScript code:", error);
    //           }
    //         </script>
    //         </html>
    //     `;
    //     setSrcCode(tempSrcCode);
    // };
    const onCodeChange = (mode, code) => {
        codeRef.current[mode] = code;
        // console.log('line102', codeRef.current);
        runCode();
    }

    const handleMouseEnter = () => {
        setIsAsideVisible(true);
    };
    
    const handleMouseLeave = () => {
        setIsAsideVisible(false);
    };

    const handleLanguageChange = (event) => {
        const selectedLanguage = event.target.value;
        console.log(selectedLanguage);
        if(isCollapsed[selectedLanguage]) {
            setIsCollapsed(prevState => ({
                ...prevState,
                [selectedLanguage]: !prevState[selectedLanguage]
            }));
            
        }
    };

    if(!location.state) {
        <Navigate />
    }

    return (
        <>
            <div>
            {/* <MenuIcon sx={{height: '30px', color: 'white'}} /> */}
            {/* <label style={{color: 'white'}} for="cars">Select Language</label> */}

            <select name="cars" id="cars" onClick={handleLanguageChange}>
            <option value="xml">XML</option>
            <option value="css">CSS</option>
            <option value="javascript">JS</option>
            </select>
            </div>
            <div className="mainWrap">
                <div className={`aside ${isAsideVisible ? 'show-aside' : ''}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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
                            {clients && clients.map((client) => {
                                // console.log('client socketId', client.socketId);
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
                        <Editor mode={'xml'} socketRef={socketRef} roomId={roomId} onCodeChange={onCodeChange} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                        <Editor mode={'css'} socketRef={socketRef} roomId={roomId} onCodeChange={onCodeChange} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                        <Editor mode={'javascript'} socketRef={socketRef} roomId={roomId} onCodeChange={onCodeChange} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                        
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
