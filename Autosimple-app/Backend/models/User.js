class User {
    constructor(data) {
        this.id = data.id || Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.isAdmin = data.isAdmin || false;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.profile = {
            firstName: data.profile?.firstName || '',
            lastName: data.profile?.lastName || '',
            phone: data.profile?.phone || '',
            address: data.profile?.address || '',
            avatar: data.profile?.avatar || null
        };
    }
}

module.exports = User;