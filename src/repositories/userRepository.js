const User = require('../models/userModel');

class UserRepository {
    async create(userData) {
        return await User.create(userData);
    }

    async findByEmail(email) {
        return await User.findOne({ email }).lean();
    }

    async findById(id) {
        return await User.findById(id).select('-password').lean();
    }
}

module.exports = new UserRepository();
