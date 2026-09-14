class Car {
    constructor(data) {
        this.id = data.id || Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.ownerId = data.ownerId;
        this.ownerName = data.ownerName;
        this.n = data.n;
        this.m = data.m;
        this.vehicleType = data.vehicleType;
        this.year = data.year;
        this.km = data.km;
        this.engine = data.engine;
        this.color = data.color;
        this.interiorColor = data.interiorColor;
        this.seats = data.seats;
        this.doors = data.doors;
        this.fuel = data.fuel;
        this.transmission = data.transmission;
        this.p = data.p;
        this.city = data.city;
        this.inspectionDate = data.inspectionDate;
        this.phone = data.phone;
        this.email = data.email;
        this.description = data.description;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.images = data.images || [];
        this.status = data.status || 'pending';
        this.approvedAt = data.approvedAt || null;
        this.rejectedAt = data.rejectedAt || null;
        this.adminNotes = data.adminNotes || '';
        this.sellerType = data.sellerType || 'private';
        this.extras = data.extras || [];
    }
}

module.exports = Car;