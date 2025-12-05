require('dotenv').config();
const mongoose = require('mongoose');
const Barber = require('./models/Barber');

async function deleteLastBarber() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const lastBarber = await Barber.findOne().sort({ createdAt: -1 });

    if (!lastBarber) {
      console.log("No barbers found.");
      return;
    }

    await Barber.findByIdAndDelete(lastBarber._id);
    console.log("Deleted barber:", lastBarber.name);

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

deleteLastBarber();
