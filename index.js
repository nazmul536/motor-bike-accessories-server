const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const cors=require('cors')
const ObjectId = require("mongodb").ObjectId;


require('dotenv').config()

const port = process.env.PORT || 5000

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s3ngn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)

async function run(){
    try{
        await client.connect();
        const database=client.db('motor_bike');
        const reviewCollection=database.collection('reviews');
        const productCollection=database.collection('products');
        const addUserCollection=database.collection('addUser')
        const usersCollection=database.collection('users')

        app.get('/users/:email', async(req,res)=>{
          const email=req.params.email;
          const query={email:email};
          const user=await usersCollection.findOne(query);
          let isAdmin=false;
          if(user?.role === 'admin'){
            isAdmin=true;
          }
          res.json({admin:isAdmin});
        })

        app.post('/users', async(req,res)=>{
          const user=req.body;
          const result=usersCollection.insertOne(user);
          // console.log(result);
          res.json(result);
        });

        app.put('/users', async(req,res)=>{
          const user=req.body;
          const filter={email:user.email};
          const options={ upsert: true};
          const updateDoc={ $set:user };
          const result=await usersCollection.updateOne(filter,updateDoc,options);
          res.json(result);
        });

        app.put('/users/admin', async(req,res)=>{
          const user=req.body;
          const filter={email:user.email};
          const updateDoc={$set:{role:'admin'}};
          const result=await usersCollection.updateOne(filter,updateDoc);
          res.json(result);
        });
        
        // get all items from collection
        app.get('/products', async (req, res) => {
          const cursor = productCollection.find({});
          const items = await cursor.toArray();
          res.send(items);
      });


        //get single product
        app.get('/products/:id', async (req,res)=>{
           const id = req.params.id;
           const query = {_id: ObjectId(id)};
           const result = await productCollection.findOne(query);
           res.json(result);
        });


        //add a product
        app.post('/products', async(req,res)=>{
          const products=req.body;
          const result=await productCollection.insertOne(products);
          // console.log(result)
          res.json(result);
        });

        

         //reviews
         app.post("/reviews", async (req, res) => {
          const review=(req.body);
          const result = await reviewCollection.insertOne(review);
          // console.log(result)
          res.json(result);
        });

        app.get('/reviews', async(req,res)=>{
          const result=await reviewCollection.find({}).toArray();
          console.log(result)
          res.send(result);
        })

        
         //add a user and display myOrder
         app.post('/addUser', async(req,res)=>{
          const addUsers=req.body;
          const result=await addUserCollection.insertOne(addUsers);
          // console.log(result)
          res.json(result);
        });

        app.get('/addUser', async(req,res)=>{
          const result=await addUserCollection.find({}).toArray();
          // console.log(result)
          res.send(result);

        });

        app.get('/addUser/:email', async(req,res)=>{
          const email=req.params.email;
          const query = { email: { $regex: email } };
          const result = await addUserCollection.find(query).toArray();
          console.log(result);
          res.send(result);
        });

           // delete product-item
           app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })
  




    }
    finally{
      // await client.close()
    }
}

run().catch(console.dir)




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})