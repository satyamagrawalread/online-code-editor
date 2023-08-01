import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/css/css';
import 'codemirror/mode/xml/xml';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

function Editor({ mode, socketRef, roomId, onCodeChange }) {
    const editorRef = useRef(null);
    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(document.getElementById(`${mode}-realTimeEditor`), {
                mode: {
                    name: mode,
                    json: true
                },
                theme: 'dracula',
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: true,
            });

            editorRef.current.on('change', (instance, changes) => {
                console.log('changes', changes);
                const { origin } = changes;
                const code = instance.getValue();
                console.log(code);
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
                console.log(value['code']);
                console.log('line50', value['mode']);
                if (value['mode']==mode && value['code'] !== null) {
                    editorRef.current.setValue(value['code']);
                }
            })
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        }
    }, [socketRef.current])

    return (
        <div className={mode}>
            <textarea id={`${mode}-realTimeEditor`}></textarea>
        </div>
    )
}

export default Editor
