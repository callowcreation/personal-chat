import React from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCk5ueVsffzuSzjmEwHi0N_BL8l2z1y-og",
  authDomain: "personal-chat-3ef37.firebaseapp.com",
  projectId: "personal-chat-3ef37",
  storageBucket: "personal-chat-3ef37.firebasestorage.app",
  messagingSenderId: "844282704891",
  appId: "1:844282704891:web:7dd1ff5233f70a07dc115e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header"></header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
      const user = result.user;
      console.log('User signed in:', user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    <div>
      <button onClick={() => signOut(auth)}>Sign Out</button>
    </div>
  );
}

function ChatRoom() {
  const messagesRef = collection(firestore, 'messages');
  const messagesQuery = query(messagesRef, orderBy('createdAt'), limit(25));
  const [snapshot, loading, error] = useCollection(messagesQuery);
  const messages = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return (
    <>
      <div>
        {loading && <p>Loading messages...</p>}
        {error && <p>Error loading messages: {error.message}</p>}
        {messages?.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>
      <SignOut />
    </>
  );

  function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;
    const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received';

    return (
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL ||
            'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
          }
          alt="User Avatar"
        />
        <p>{text}</p>
      </div>
    );
  }
}

export default App;