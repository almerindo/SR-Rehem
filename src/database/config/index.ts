import dotenv from 'dotenv';

dotenv.config();

const configDatabase = {
  ConnectionOptions: {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWORD,
    useNewUrlParser: true,
    dbName: process.env.DB_NAME,
    authSource: 'admin',
    useUnifiedTopology: true,
  },
  mongoURI: process.env.DB_URI ? process.env.DB_URI : '',
};

export default configDatabase;
