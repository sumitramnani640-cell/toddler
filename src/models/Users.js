// src/models/User.js
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },

      // OTP & verification fields
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otp_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      otp_purpose: {
        type: DataTypes.ENUM("registration", "forgot_password"),
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,

      // 🔥 PASSWORD HASHING HOOKS
      hooks: {
        // hash on create
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },

        // hash on update
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  // 🔥 INSTANCE METHOD — compare passwords
  User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  // 🔥 Remove sensitive data before sending JSON
  User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.otp;
    delete values.otp_expires;
    delete values.otp_purpose;
    return values;
  };

  return User;
};
