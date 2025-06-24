const { getUserByEmailDB, gefriendsById } = require('../db');


const getFriends = async (req, res) => {
  const user_data = { user : req.user , email : req.email  } ; 
  
  console.log("Get friends API!!");
  console.log( user_data );
 
  const friends = await gefriendsById(user_data.user);
  

   if (!friends) {
    console.log("Null");
    console.log(friends);
      
    res.status(400);
    res.send("Fetching friends API failed");
   

    } else{

       console.log("friends!!!!!!");
       console.log(friends);
      res.status(200);
      console.log(`results: ${ JSON.stringify(friends) }`);
      res.send(`results: ${ JSON.stringify(friends) }`);
      
    }
    return res;
};

const getFriendsNotif = async (req, res) => {
  const user_data = req.user; 
  // TODO :: API friends
  console.log("Get friends notif. API");
  console.log( user_data);

  // const friends = await getUserFriendsByID(email);
  const friends = await getUserByEmailDB("admin@example.com");
  

   if (!friends) {
    console.log("Null");
    console.log(friends);
      
    res.status(400);
    res.send("Fetching friends notification API failed");
   

    } else{

       console.log("friendsnotification ");
       console.log(friends);
      res.status(200);
      console.log(`results: ${ JSON.stringify(friends) }`);
      res.send(`results: ${ JSON.stringify(friends) }`);
      
    }
    return res;
};


 

module.exports = { 
  getFriends,
  getFriendsNotif
};