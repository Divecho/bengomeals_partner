import Firebase from 'firebase';  

const firebaseConfig = {
  apiKey: "AIzaSyA5FzfchQgIqRbt61ceXmusOXxjbuXbsmA",
  authDomain: "bongofood-dfce7.firebaseapp.com",
  databaseURL: "https://bongofood-dfce7-default-rtdb.firebaseio.com",
  projectId: "bongofood-dfce7",
  storageBucket: "bongofood-dfce7.appspot.com",
  messagingSenderId: "470706299814",
  appId: "1:470706299814:web:e2dce6ad9307b9ab286567"
};
  

let app = Firebase.initializeApp(firebaseConfig);  
export const fb = app.database(); 