module.exports = {
    mongoURI: process.env.MONGO_URI || 'mongodb://taplinkDBA2021:GTjYflAYwe1N70cl@ac-ugpambz-shard-00-00.kswuddz.mongodb.net:27017,ac-ugpambz-shard-00-01.kswuddz.mongodb.net:27017,ac-ugpambz-shard-00-02.kswuddz.mongodb.net:27017/?replicaSet=atlas-2tu4vj-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=cluster1TapLink',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  };