import mongoose from 'mongoose';
import databaseConfig from './config';

class Database {
  private static instance: Database;

  private connection: mongoose.Connection;

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }

  private constructor() {
    this.openConnection();
  }

  private openConnection(): void {
    this.connection = mongoose.createConnection(
      databaseConfig.mongoURI,
      databaseConfig.ConnectionOptions,
    );
    mongoose.Promise = global.Promise;
    mongoose.set('useCreateIndex', true);

    this.connection.on(
      'error',
      console.log.bind(
        console,
        `Erro ao conectar - Mongo ${JSON.stringify(
          databaseConfig.ConnectionOptions,
        )}`,
      ),
    );

    this.connection.once(
      'open',
      console.log.bind(
        console,
        `Conexão estabelecida -Mongo ${JSON.stringify(
          databaseConfig.ConnectionOptions,
        )}`,
      ),
    );
  }

  public getConnection(): mongoose.Connection {
    return this.connection;
  }
}

export default Database;
