import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

firebase.initializeApp(firebaseConfig)


function App() {
  const [newUser,setNewUser]=useState(false);
  const [user, setUser]= useState({
    isSignIn: false,
    name: '',
    email : '',
    photo: ''
  })

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();

  const handleSignIn=() =>{
    firebase.auth().signInWithPopup(googleProvider)
    .then(res =>{
      const {displayName, email,photoURL}= res.user;

      const signInUser={
        isSignIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      
      console.log(displayName, email, photoURL);
      setUser(signInUser)
    })
    .catch(err =>{
      console.log(err.message);
    })

  }

  const handleFbSignIn=()=>{
    firebase.auth().signInWithPopup(fbProvider)
    .then((result) => {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;
  
      // The signed-in user info.
      var user = result.user;
        console.log('after sign in via fb', user);
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var accessToken = credential.accessToken;
  
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
  
      // ...
    });
  }

  const handleSignOut= ()=>{
    firebase.auth().signOut()
    .then(res=>{
      const signOutUser={
        isSignIn: false,
        name: '',
        email:'',
        password: '',
        photo: '',
        error: '',
        success: false
      }
      setUser(signOutUser)
    })
    .catch(err=>{
      console.log(err);
    })
  }

  const handleBlur= (e) =>{
    // console.log(e.target.name, e.target.value);

    // validation the user email and password

    let isFieldValid=true;
    if(e.target.name === 'email'){
       isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
      
    }
    if(e.target.name === 'password'){
      const isPasswordValidate= e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);

      isFieldValid=isPasswordValidate && passwordHasNumber;
    }
    if(isFieldValid){
      const newUserInfo= {...user};
      newUserInfo[e.target.name]= e.target.value;
      setUser(newUserInfo)
    }
  }

  const handleSubmit = (e) => {
    if(newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then((res) => {
        const newUserInfo = {...user}
        newUserInfo.error= '';
        newUserInfo.success= true;
        setUser(newUserInfo);
        updateUserName(user.name)
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
   
    const newUserInfo = {...user}
    newUserInfo.error= errorMessage;
    newUserInfo.success= false;
    setUser(newUserInfo)

    console.log(errorCode, errorMessage);
  });
    }
    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
       .then((res) => {
        const newUserInfo = {...user}
        newUserInfo.error= '';
        newUserInfo.success= true;
        setUser(newUserInfo);
        console.log('signIn info', res.user);
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        const newUserInfo = {...user}
        newUserInfo.error= errorMessage;
        newUserInfo.success= false;
        setUser(newUserInfo)
      });

    }
    e.preventDefault();
  }

    const updateUserName = (name)=>{
          var user = firebase.auth().currentUser;
        user.updateProfile({
          displayName: name,
        }).then(function() {
          console.log('update user name successfully');
        }).catch(function(error) {
        console.log(error);
      });
    }
  return (
    <div className="App">
      {
        user.isSignIn ? <button onClick={handleSignOut}>Sign out</button> :
        <button onClick={handleSignIn}>Sign In</button>     
      } <br/>
      <button onClick={handleFbSignIn}>Sign In via Facebook</button>
      {
        user.isSignIn &&
        <div>
          <p> Welcome , {user.name}</p>
          <p> your email : {user.email}</p>
          <img src={user.photo} alt="userPhoto"/>
        </div> 
      }

      <h1>Our own athentication</h1>
      
      <form onSubmit={handleSubmit}>
        <input type="checkbox" name="newUser" onChange={()=> setNewUser(!newUser)} id="newUser"/> 
        <label htmlFor="newUser">New user sign up</label> <br/>

        {newUser && <input type="text" name='name' placeholder='Your name' onBlur={handleBlur}/>}
        <br/>
        <input type="text" name='email' onBlur={handleBlur} placeholder='Enter valid email' required/> <br/>
        <input type="password" name="password" onBlur={handleBlur} placeholder="Your password" required/> <br/>
        <input type="submit" value="Submit"/>
      </form>
      <p style={{color:'red'}}> {user.error}</p>
      {
        user.success && <p style={{color:'green'}}> User {newUser ? 'created' : 'logged'} successfully</p>
      }
    </div>
  );
}

export default App;
