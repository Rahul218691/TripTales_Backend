const User = require('../models/user.model')

class Userservice {
    findUser(filter) {
        return new Promise(async(resolve, reject) => {
            try {
                const user = await User.findOne(filter)
                resolve(user)
            } catch (error) {
                reject(error)
            }
        })
    }

    createUser(data) {
        return new Promise(async(resolve, reject) => {
            try {
                const user = await User.create(data)
                resolve(user)
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = new Userservice()