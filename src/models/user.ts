import { DataTypes, Sequelize } from 'sequelize';

const user = (db: Sequelize): void => {
  db.define(
    'Developer',
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
      },
      firstName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      toneOfVoice: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      feedbackType: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      tableName: 'developers',
    },
  );
};

export default user;
