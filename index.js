const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

// const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World! Task Manager Server is running!!");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ez2ieyu.mongodb.net/?retryWrites=true&w=majority`;

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
    // Create collections here
    const usersCollection = client.db("taskDB").collection("usersCollection");
    const tasksCollection = client.db("taskDB").collection("tasksCollection");


    // CRUD operation here

    // ---Inserting user to db---//
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists in Database" });
      }
      if (!user.role) {
        user.role = 'user'
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

  // Getting all users
  app.get('/users', async(req,res)=>{
    const filter = {role: 'user'}
    const result = await usersCollection.find(filter).toArray()
    res.send(result)
  })



  // Creating a task
  app.post('/tasks', async (req,res)=>{
    const newTask = req.body;
      const result = await tasksCollection.insertOne(newTask);
      res.send(result);
  })



  //--get user specific tasks--//
  app.get("/tasks", async (req, res) => {
    const userEmail = req.query.email
    // console.log('user email '+userEmail);
    const query = {assignedUserEmail: userEmail}
    const result = await tasksCollection.find(query).toArray()
    res.send(result);
  });

  // -- Complete A Task --//

  app.patch('/tasks/completed/:id', async (req, res) => {
    const id = req.params.id;
  
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        status: 'completed'
      },
    };
    

    const result = await tasksCollection.updateOne(filter, updateDoc);
    res.send(result);

  })


  // -- Update a task --//
  app.put("/tasks/update/:id", async (req, res) => {
    const id = req.params.id;
    const updatedTask = req.body;
    const filter = { _id: new ObjectId(id) };

    const options = { upsert: true };
    const task = {
      $set: {...updatedTask},
    };
    const result = await tasksCollection.updateOne(filter, task, options);
    res.send(result);
  });

  //--Delete a task --//
  app.delete('/tasks/:id', async (req, res) => {
    const id = req.params.id
    console.log(id);
    const query = { _id: new ObjectId(id) };
  
    const result = await tasksCollection.deleteOne(query);
    res.send(result);
  })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`My app listening on port ${port}`);
});
