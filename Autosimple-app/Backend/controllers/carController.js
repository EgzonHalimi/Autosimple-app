const Car = require('../models/Car');
const fs = require('fs');

let cars = [];

try {
    if (fs.existsSync('./data/cars.json')) {
        const data = fs.readFileSync('./data/cars.json', 'utf8');
        cars = JSON.parse(data).map(c => new Car(c));
    }
} catch (error) {
    console.log('No existing cars data');
}

const saveCars = () => {
    fs.writeFileSync('./data/cars.json', JSON.stringify(cars, null, 2));
};

// GET ALL CARS
exports.getCars = (req, res) => {
    try {
        let filteredCars = [...cars];
        const isAdmin = req.isAdmin || false;
        
        if (!isAdmin) {
            filteredCars = filteredCars.filter(c => c.status === 'approved');
        }
        
        // Filtrat
        const { brand, model, yearFrom, yearTo, kmFrom, kmTo, priceFrom, priceTo, fuel, city, search } = req.query;
        
        if (brand) filteredCars = filteredCars.filter(c => c.n === brand);
        if (model) filteredCars = filteredCars.filter(c => c.m === model);
        if (yearFrom) filteredCars = filteredCars.filter(c => c.year >= parseInt(yearFrom));
        if (yearTo) filteredCars = filteredCars.filter(c => c.year <= parseInt(yearTo));
        if (kmFrom) filteredCars = filteredCars.filter(c => c.km >= parseInt(kmFrom));
        if (kmTo) filteredCars = filteredCars.filter(c => c.km <= parseInt(kmTo));
        if (priceFrom) filteredCars = filteredCars.filter(c => c.p >= parseFloat(priceFrom));
        if (priceTo) filteredCars = filteredCars.filter(c => c.p <= parseFloat(priceTo));
        if (fuel) filteredCars = filteredCars.filter(c => c.fuel === fuel);
        if (city) filteredCars = filteredCars.filter(c => c.city === city);
        
        if (search) {
            const searchLower = search.toLowerCase();
            filteredCars = filteredCars.filter(c => 
                c.n.toLowerCase().includes(searchLower) ||
                c.m.toLowerCase().includes(searchLower) ||
                c.city.toLowerCase().includes(searchLower) ||
                (c.description && c.description.toLowerCase().includes(searchLower))
            );
        }
        
        res.json(filteredCars);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET SINGLE CAR
exports.getCar = (req, res) => {
    try {
        const car = cars.find(c => c.id === req.params.id);
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.json(car);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ADD CAR
exports.addCar = async (req, res) => {
    try {
        const carData = {
            ...req.body,
            ownerId: req.userId,
            ownerName: req.username,
            images: req.body.images || []
        };
        
        const newCar = new Car(carData);
        cars.push(newCar);
        saveCars();
        
        res.status(201).json(newCar);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};