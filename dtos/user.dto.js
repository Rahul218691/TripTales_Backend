class UserDto {
    _id;
    username;
    email;
    profileImg;
    profileImgSecureUrl;
    usertype;
    bio;
    totalStories;
    totalTrips;
    followers;
    following;

    constructor(user) {
        this._id = user._id
        this.username = user.username
        this.email = user.email
        this.avatar = user.profileImg
        this.profileImgSecureUrl = user.profileImgSecureUrl
        this.usertype = user.usertype
        this.profileImg = user.profileImg
        this.bio = user.bio
        this.totalStories = user.totalStories || 0
        this.totalTrips = user.totalTrips || 0
        this.followers = user.followers.length || 0
        this.following = user.following.length || 0
    }       
}

module.exports = UserDto