class UserDto {
    _id;
    username;
    email;
    profileImg;
    profileImgSecureUrl;
    usertype;
    bio;

    constructor(user) {
        this._id = user._id
        this.username = user.username
        this.email = user.email
        this.avatar = user.profileImg
        this.profileImgSecureUrl = user.profileImgSecureUrl
        this.usertype = user.usertype
        this.profileImg = user.profileImg
        this.bio = user.bio
    }       
}

module.exports = UserDto