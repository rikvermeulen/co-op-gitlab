import { DataTypes, Sequelize } from 'sequelize';

export interface DeveloperAttributes {
  uuid: string;
  firstName: string;
  lastName: string;
  gitlabId: number;
  languagePreference: string;
  toneOfVoice: string;
  learningGoals: string;
}

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
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: false,
        },
      },
      gitlabId: {
        type: DataTypes.NUMBER,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      languagePreference: {
        type: DataTypes.ENUM('English', 'Dutch', 'French', 'German', 'Spanish'),
        defaultValue: 'English',
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      toneOfVoice: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: false,
        },
      },
      learningGoals: {
        type: DataTypes.STRING,
        defaultValue: 'All',
        validate: {
          notEmpty: false,
        },
      },
      commonMistakes: {
        type: DataTypes.STRING,
        defaultValue: 'None',
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
