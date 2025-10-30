module.exports = (sequelize, DataTypes) => {
  const Newsletter = sequelize.define('Newsletter', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    subscribedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
  return Newsletter;
};
