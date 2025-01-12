'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        static associate(models) {
            this.belongsTo(models.User, {
                foreignKey: 'userId',
            });
            this.belongsTo(models.TranslatedSentence, {
                foreignKey: 'translatedSentenceId',
            });
        }
    }
    Comment.init({
        userId: DataTypes.INTEGER,
        translatedSentenceId: DataTypes.INTEGER,
        comment: DataTypes.STRING,
        state: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Comment',
    });
    return Comment;
}