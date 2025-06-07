import React from 'react';
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
    const [user] = useAuthState(auth);

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
                const token = result.credential.accessToken;
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
        <div>
            <button onClick={() => auth.signOut()}>
                Sign Out
            </button>
        </div>
    )
}

function ChatRoom() {
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25);
    const [messages] = useCollectionData(query, { idField: 'id' });

    return (
        <>
            <div>
                {messages && messages.map(msg => {
                    console.log('Message:', msg);
                    return msg ? <ChatMessage key={msg.id} message={msg} /> : <p key={msg.id}>'not loaded yet'</p>
                })}
            </div>
            <SignOut />
        </>
    );

    function ChatMessage(props) {
        const { text, uid, photoURL } = props.message;
        const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

        return (
            <div className={`message ${messageClass}`}>
                <img src={photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} alt="User Avatar" />
                <p>{text}</p>
            </div>
        );
    }
}

export default App;
