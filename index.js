const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

require('dotenv').config();
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db('portfolio_db');
    const porjectsCollection = database.collection('projects');

    // ১. সব প্রজেক্ট নিয়ে আসার রুট
    app.get('/projects', async (req, res) => {
      const result = await porjectsCollection.find().toArray();
      res.send(result);
    });

    //project post or add
    app.post('/projects', async (req, res) => {
      const projects = req.body;
      const result = await porjectsCollection.insertOne(projects);
      res.send(result);
    });

    // আপনার run() ফাংশনের ভেতরে ডিলিট রুটের পাশে এটি বসান
    app.patch('/projects/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            title: req.body.title,
            techStack: req.body.techStack,
            githubUrl: req.body.githubUrl,
            liveLink: req.body.liveLink,
            description: req.body.description,
            imageUrl: req.body.imageUrl,
            isPublic: req.body.isPublic,
          },
        };
        const result = await porjectsCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: 'Update failed' });
      }
    });

    app.delete('/projects/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }; // আইডি দিয়ে ফিল্টার তৈরি
      const result = await porjectsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!',
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
