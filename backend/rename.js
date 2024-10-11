const { MongoClient } = require('mongodb');

async function migrateDatabase() {
    const uri = 'mongodb+srv://dbUser:fuel1234@fuelstation.cit7okx.mongodb.net/zenoFuelDB?retryWrites=true&w=majority'; // Old database URI
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Access the old database and new database
        const oldDb = client.db('zenoFuelDB');
        const newDb = client.db('zenoFuel');

        // Get collections from the old database
        const collections = await oldDb.collections();

        // Copy each collection to the new database
        for (const collection of collections) {
            const data = await collection.find().toArray(); // Get all documents in the collection
            
            // Remove _id field from each document before inserting
            const dataWithoutId = data.map(({ _id, ...rest }) => rest);
            
            if (dataWithoutId.length > 0) { // Check if there are documents to insert
                await newDb.collection(collection.collectionName).insertMany(dataWithoutId); // Insert documents into the new collection
                console.log(`Copied collection: ${collection.collectionName}`);
            } else {
                console.log(`Skipped empty collection: ${collection.collectionName}`);
            }
        }

        console.log('Database migration completed successfully.');
    } catch (err) {
        console.error('Error migrating database:', err);
    } finally {
        // Ensure the client will close when you finish/error
        await client.close();
    }
}

migrateDatabase();
