/*
Credit: Fireship https://www.youtube.com/@Fireship
Video: https://www.youtube.com/watch?v=zQyrwxMPm88
*/

import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyCk5ueVsffzuSzjmEwHi0N_BL8l2z1y-og",
    authDomain: "personal-chat-3ef37.firebaseapp.com",
    projectId: "personal-chat-3ef37",
    storageBucket: "personal-chat-3ef37.firebasestorage.app",
    messagingSenderId: "844282704891",
    appId: "1:844282704891:web:7dd1ff5233f70a07dc115e"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
    const [user, loading, error] = useAuthState(auth);

    if (loading) {
        return <p>Loading user...</p>;
    }
    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <div className="App">
            <header className="App-header">

            </header>
            <section>
                {user ? <ChatRoom /> : <SignIn />}
            </section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                //const token = result.credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                console.log('User signed in:', user);
            })
            .catch((error) => {
                console.error('Error signing in with Google:', error);
            });
    }
    return (
        <button onClick={signInWithGoogle}>
            Sign in with Google
        </button>
    )
}

function SignOut() {
    return (
        <button type='button' onClick={() => auth.signOut()} style={{ marginLeft: '10px' }}>
            Sign Out
        </button>
    )
}

function ChatRoom() {
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt').limitToLast(25);//.limit(25);
    const [messages, loading, error] = useCollectionData(query, { idField: 'id' });

    const [formValue, setFormValue] = useState('');

    const dummy = useRef();
    const inputRef = useRef();
    
    const scrollToBottom = () => {
        if (dummy.current) {
            dummy.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const focusOnInput = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }

    useEffect(() => {
        scrollToBottom();
        focusOnInput();
    }, [messages]);

    useEffect(() => {
        const unsubscribe = firestore.collection('messages').onSnapshot(() => {
            scrollToBottom();
        });
        return () => unsubscribe();
    }, []);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (auth.currentUser && formValue.trim() !== '') {
            const { uid, photoURL } = auth.currentUser;

            await messagesRef.add({
                text: formValue,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                uid,
                photoURL: getPhotoUrl(photoURL)
            });

            setFormValue('');
        }
        inputRef.current.focus();
    }

    const postMessage = (e) => {
        e.preventDefault();
        if (auth.currentUser && formValue.trim() !== '') {
            const { uid, photoURL } = auth.currentUser;

            const payload = {
                text: formValue,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                uid,
                photoURL: getPhotoUrl(photoURL)
            };

            

            setFormValue('');
            inputRef.current.focus();
        }
    }
    
    return (
        <>
            <main>
                {loading && <p>Loading messages...</p>}
                {error && <p>Error loading messages: {error.message}</p>}
                {messages?.map((msg, idx) => (<ChatMessage key={idx} message={msg} />))}
                <div ref={dummy} style={{height: '40px', width: '100%'}}></div>
            </main>
            <form onSubmit={sendMessage}>
                <input ref={inputRef} value={formValue} onChange={(e) => setFormValue(e.target.value)} />
                <button type="submit">Send</button>
                <SignOut />
            </form>
        </>
    );
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <div className={`message ${messageClass}`}>
            <img src={getPhotoUrl(photoURL)} alt="User Avatar" />
            <p>{text}</p>
        </div>
    );
}

function getPhotoUrl(photoURL) {
    return photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
}

export default App;
