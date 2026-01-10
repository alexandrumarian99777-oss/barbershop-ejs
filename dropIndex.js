const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/yourdbname'; // replace with your DB

async function dropEmailIndex() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const Barber = mongoose.connection.collection('barbers');

    // Get current indexes
    const indexes = await Barber.indexes();
    console.log('Current indexes:', indexes);

    // Drop email_1 if exists
    if (indexes.some(idx => idx.name === 'email_1')) {
      await Barber.dropIndex('email_1');
      console.log('Dropped index email_1');
    } else {
      console.log('No email_1 index found');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

dropEmailIndex();
