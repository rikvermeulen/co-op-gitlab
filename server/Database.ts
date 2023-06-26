import { Options, Sequelize } from 'sequelize';
import { config } from '@/server/Config';
import { Logger } from '@/server/Logger';

const sequelize = new Sequelize({
  storage: `${process.cwd()}/db.sqlite`,
  logging: (msg: any) => Logger.info(`[DB] ${msg}`),
  ...config.database,
} as Options);

const init = async (
  models: Array<(db: Sequelize) => void> = [],
  associations: { oneToOne: any[]; oneToMany: any[] } = { oneToOne: [], oneToMany: [] },
  sync: boolean = true,
) => {
  return new Promise<void>(async (resolve) => {
    // Setup database connection
    await sequelize.authenticate().catch((e: Error) => {
      Logger.error(e);
      Logger.error('[DB] Unable to connect to the database!');
      process.exit(1);
    });

    if (config.database.dialect === 'sqlite') {
      Logger.info(
        `[DB] Connection successful: ${config.database.dialect}://${process.cwd()}/db.sqlite`,
      );
    } else {
      Logger.info(
        `[DB] Connection successful: ${config.database.dialect}://${config.database.username}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}`,
      );
    }

    models.forEach((model: Function) => {
      model(sequelize);
    });

    associations.oneToOne.forEach((association) => {
      let options = {};

      if (association[2]) {
        options = association[2];
      }

      const model1 = sequelize.models[association[0]];
      const model2 = sequelize.models[association[1]];

      if (model1 && model2) {
        model1.hasOne(model2, options);
        model2.belongsTo(model1, options);
      }
    });
    associations.oneToMany.forEach((association) => {
      let options = {};

      if (association[2]) {
        options = association[2];
      }

      const model1 = sequelize.models[association[0]];
      const model2 = sequelize.models[association[1]];

      if (model1 && model2) {
        model1.hasOne(model2, options);
        model2.belongsTo(model1, options);
      }
    });

    if (sync) {
      await sequelize.sync({ alter: { drop: false } }).catch((e: Error) => {
        Logger.error(e);
        Logger.error('[DB] Unable to sync models!');
        process.exit(1);
      });

      Logger.info(`[DB] All models where synchronized successfully!`);
    }

    resolve();
  });
};

export default { ...sequelize, init };
