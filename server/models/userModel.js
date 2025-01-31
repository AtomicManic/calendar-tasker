const User = require('../schemas/userSchema');

const createUser = async (userData) => {
    console.log('Creating user:', userData);
    const user = new User(userData);
    await user.save();
    return user;
};

const getUserByGoogleId = async (googleId) => {
    const user = await User.findOne({
        googleId
    });
    return user;
}

const getUserByEmail = async (email) => {
    const user = await User.findOne({
        email
    });
    return user;
};

const getUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

const updateUserById = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

const deleteUserById = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

module.exports = {
    createUser,
    getUserById,
    getUserByEmail,
    updateUserById,
    deleteUserById,
    getUserByGoogleId
};