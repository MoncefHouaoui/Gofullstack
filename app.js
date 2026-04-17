const express = require('express');
const app = express();
const mongoose = require('mongoose');

const stuffRoutes = require('./routes/stuff');

mongoose.connect('mongodb://Moncef:Moncef@ac-b2lfddl-shard-00-00.ul0jbom.mongodb.net:27017,ac-b2lfddl-shard-00-01.ul0jbom.mongodb.net:27017,ac-b2lfddl-shard-00-02.ul0jbom.mongodb.net:27017/?ssl=true&replicaSet=atlas-rzp3a3-shard-0&authSource=admin&appName=Cluster0')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Connexion à MongoDB échouée !', error));

app.use(express.json());


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/stuff', stuffRoutes);

module.exports = app;
