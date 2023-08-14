import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
// import 'codemirror/theme/dracula.css';
// import 'codemirror/theme/3024-day.css';
// import 'codemirror/theme/3024-night.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/xml/xml';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';
import { AiOutlineCloseSquare } from 'react-icons/ai';

function Editor({ mode, socketRef, roomId, onCodeChange, isCollapsed, setIsCollapsed, selectedTheme, isLineNumberEnabled }) {
    const editorRef = useRef(null);
    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(document.getElementById(`${mode}-realTimeEditor`), {
                mode: {
                    name: mode,
                    json: true
                },
                theme: selectedTheme,
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: isLineNumberEnabled,
                
            });

            editorRef.current.on('change', (instance, changes) => {
                // console.log('changes', changes);
                const { origin } = changes;
                const code = instance.getValue();
                // console.log(code);
                onCodeChange(mode, code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        mode,
                        code
                    });
                }
            })


            // editorRef.current.setValue('console.log("Hello World");');
        }
        init();
    }, [])

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, (value) => {
                // console.log(value['code']);
                // console.log('line50', value['mode']);
                if (value['mode']==mode && value['code']!=null) {
                    editorRef.current.setValue(value['code']);
                }
            })
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        }
    }, [socketRef.current])

    const removeLanguage = () => {
        console.log(mode, isCollapsed[mode]);
        if(isCollapsed[mode]==false) {
            setIsCollapsed(prevState => ({
                ...prevState,
                [mode]: !prevState[mode]
            }));
            console.log(mode, isCollapsed[mode]);
        }
    }

    useEffect(() => {
        if (editorRef.current) {
            const editorWrapper = editorRef.current.getWrapperElement();
            
            // Remove existing theme classes
            editorWrapper.classList.remove();
    
            // Add new theme classes
            editorWrapper.classList.add(`cm-s-${selectedTheme}`);
            // if (selectedTheme === "newThemeName") {
            //     editorWrapper.classList.add("cm-s-newThemeName");
            // } else if (selectedTheme === "anotherTheme") {
            //     editorWrapper.classList.add("cm-s-anotherTheme");
            // }
    
            // Update the editor theme option (optional)
            editorRef.current.setOption("theme", selectedTheme);
        }
        // console.log('line78', editorRef.current.theme);
    }, [selectedTheme])

    useEffect(() => {
        editorRef.current.setOption("lineNumbers", isLineNumberEnabled);
    }, [isLineNumberEnabled]);




    return (
        <div className={`${mode} ${isCollapsed[mode] ? `collapsed-${mode}` : ''}`}>
            <div className={`editorHeading-${mode}`}>
                <span>{mode}</span>
                <AiOutlineCloseSquare style={{alignItems: 'center', fontSize: '30px'}} onClick={removeLanguage} />
            </div>
            <textarea id={`${mode}-realTimeEditor`}></textarea>
        </div>
    )
}

export default Editor
