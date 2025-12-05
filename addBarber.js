require('dotenv').config();
const mongoose = require('mongoose');
const Barber = require('./models/Barber');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected'))
  .catch(err => console.error(err));

async function addBarber() {
  try {
    const barber = await Barber.create({
      name: "John Fade",
      specialty: "Skin Fade Specialist",
      experience: 7,
      bio: "Expert barber with over 7 years experience.",
      image: "https://unsplash.com/photos/man-in-green-and-black-crew-neck-t-shirt-holding-black-dslr-camera-wJoB8D3hnzc, // <--- ADD IMAGE HEREhttps://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      available: true
    });

    console.log("Barber added:", barber);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

addBarber();
