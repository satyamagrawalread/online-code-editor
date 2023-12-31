import React, { useState } from "react";
import { v4 as uuidV4 } from 'uuid';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    //Creates new Room Id
    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        // console.log(id);
        setRoomId(id);
        toast.success('Created a new room');
    }

    const joinRoom = () => {
        if(!roomId && !username) {
            toast.error('ROOM ID & USERNAME is Required');
            return;
        }
        else if(!roomId) {
            toast.error('ROOM ID is Required');
            return;
        }
        else if(!username) {
            toast.error('USERNAME is Required');
            return;
        }
        //Redirect to the New page having Room Id
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            }
        }
        )
    }

    //Handle on pressing Enter while inside input box
    const handleInputEnter = (e) => {
        if(e.code =='Enter') {
            joinRoom();
        }
    }


    return (
        <div className="homePageWrapper">
            <div className="formWrapper">
                <img 
                    className="homePageLogo" 
                    src="/code-logo.jpg" 
                    alt="code editor logo" 
                />
                <h4 className="mainLabel">Paste Invitation Room ID</h4>
                <div className="inputGroup">
                    <input 
                        type="text" 
                        className="inputBox" 
                        placeholder="ROOM ID" 
                        value={roomId} 
                        onChange={(e) => setRoomId(e.target.value)} 
                        onKeyUp={handleInputEnter}
                    />
                    <input 
                        type="text" 
                        className="inputBox" 
                        placeholder="USERNAME" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyUp={handleInputEnter}
                    />
                    <button className="btn joinBtn" onClick={joinRoom}>Join</button>
                    <span className="createInfo">
                        If you don't have an invite then create &nbsp;
                        <a onClick={createNewRoom} href="" className="createNewBtn">new room</a>
                    </span>
                </div>
            </div>
            <footer>
                <h4>Built with 💛 by {' '}
                    <a href="https://github.com/satyamagrawalread">Satyam</a></h4>
            </footer>

        </div>
    );
}