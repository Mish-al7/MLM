const mongoose = require('mongoose');
const uri = 'mongodb+srv://mohammednalagath_db_user:Mohammed07@cluster0.n15fuiv.mongodb.net/allianzamlm';

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB.");
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log("Users in DB count:", users.length);
    if (users.length > 0) {
      console.log("Raw user document sample:", users[0]);
    }

    
    // Test today/tomorrow calculation
    const localTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const today = new Date(localTimeStr);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    console.log("Calculated IST Date/Time:", localTimeStr);
    console.log("Calculated IST Today Month/Date:", today.getMonth(), today.getDate());
    console.log("Calculated IST Tomorrow Month/Date:", tomorrow.getMonth(), tomorrow.getDate());
    
    for (const u of users) {
      if (!u.dob) continue;
      const dob = new Date(u.dob);
      console.log(`User ${u.name} (${u.userId}) - DOB: ${u.dob} -> UTC Month/Date: ${dob.getUTCMonth()} / ${dob.getUTCDate()}, Local Month/Date: ${dob.getMonth()} / ${dob.getDate()}`);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
