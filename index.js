const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect to MongoDB
    // await client.connect(); // Production এ এটি প্রয়োজন হতে পারে

    const database = client.db('portfolio_db');
    const projectsCollection = database.collection('projects');

    // ১. সব প্রজেক্ট ডাটাবেস থেকে নিয়ে আসা
    app.get('/projects', async (req, res) => {
      try {
        const result = await projectsCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching projects', error });
      }
    });

    // ২. নতুন প্রজেক্ট অ্যাড করা
    app.post('/projects', async (req, res) => {
      try {
        const project = req.body;
        const result = await projectsCollection.insertOne(project);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Error saving project', error });
      }
    });

    app.patch('/projects/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          title: req.body.title,
          techStack: req.body.techStack,
          githubUrl: req.body.githubUrl,
          liveLink: req.body.liveLink,
          description: req.body.description,
          isPublic: req.body.isPublic,
          imageUrl: req.body.imageUrl,
        },
      };
      const result = await projectsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // ৩. প্রজেক্ট ডিলিট করা (অপশনাল - আইকনের জন্য যোগ করা হয়েছে)
    app.delete('/projects/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await projectsCollection.deleteOne(query);
      res.send(result);
    });

    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Portfolio Server is Running...');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
