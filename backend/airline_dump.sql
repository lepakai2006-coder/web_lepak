-- Airline Booking DB Dump

CREATE TABLE Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('Admin', 'Client', 'Crew')) DEFAULT 'Client'
        );

CREATE TABLE Aircrafts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            model TEXT NOT NULL,
            capacity INTEGER NOT NULL
        );

CREATE TABLE Flights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aircraft_id INTEGER NOT NULL,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            departure_time DATETIME NOT NULL,
            arrival_time DATETIME NOT NULL,
            price REAL NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('Scheduled', 'Delayed', 'Cancelled', 'Completed')) DEFAULT 'Scheduled',
            FOREIGN KEY(aircraft_id) REFERENCES Aircrafts(id)
        );

CREATE TABLE Bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            flight_id INTEGER NOT NULL,
            booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            total_price REAL NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('Pending', 'Confirmed', 'Cancelled')) DEFAULT 'Confirmed',
            FOREIGN KEY(user_id) REFERENCES Users(id),
            FOREIGN KEY(flight_id) REFERENCES Flights(id)
        );

CREATE TABLE Tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            seat_number TEXT NOT NULL,
            passenger_name TEXT NOT NULL,
            FOREIGN KEY(booking_id) REFERENCES Bookings(id)
        );

INSERT INTO Users (id, name, email, password, role) VALUES (1, 'System Admin', 'admin@example.com', '$2b$10$1UqwpSePx9FiHHhXXD/BeurRsPpNkIvuprErCmyua7j0OzzLl4wBC', 'Admin');
INSERT INTO Users (id, name, email, password, role) VALUES (2, 'John Doe', 'john@example.com', '$2b$10$1UqwpSePx9FiHHhXXD/BeuHhYhluiHIbfn6/QMklB4DhFZwqhCaa2', 'Client');

INSERT INTO Flights (id, aircraft_id, origin, destination, departure_time, arrival_time, price, status) VALUES (1, 1, 'JFK', 'LHR', '2026-05-23T17:38:11.584Z', '2026-05-24T00:38:11.584Z', 450, 'Scheduled');
INSERT INTO Flights (id, aircraft_id, origin, destination, departure_time, arrival_time, price, status) VALUES (2, 2, 'CDG', 'JFK', '2026-05-23T17:38:11.584Z', '2026-05-24T01:38:11.584Z', 550, 'Scheduled');
INSERT INTO Flights (id, aircraft_id, origin, destination, departure_time, arrival_time, price, status) VALUES (3, 3, 'DXB', 'JFK', '2026-05-29T17:38:11.584Z', '2026-05-30T07:38:11.584Z', 800, 'Scheduled');
INSERT INTO Flights (id, aircraft_id, origin, destination, departure_time, arrival_time, price, status) VALUES (4, 1, 'LHR', 'CDG', '2026-05-22T17:38:11.584Z', '2026-05-22T19:08:11.584Z', 120, 'Scheduled');

INSERT INTO Tickets (id, booking_id, seat_number, passenger_name) VALUES (1, 3, '1D', 'Guest');

INSERT INTO Bookings (id, user_id, flight_id, booking_date, total_price, status) VALUES (1, 2, 1, '2026-05-22 17:38:11', 900, 'Confirmed');
INSERT INTO Bookings (id, user_id, flight_id, booking_date, total_price, status) VALUES (2, 2, 2, '2026-05-22 17:38:11', 550, 'Confirmed');
INSERT INTO Bookings (id, user_id, flight_id, booking_date, total_price, status) VALUES (3, 1, 1, '2026-05-22 17:49:21', 450, 'Confirmed');

INSERT INTO Aircrafts (id, name, model, capacity) VALUES (1, 'Boeing', '737 MAX', 180);
INSERT INTO Aircrafts (id, name, model, capacity) VALUES (2, 'Airbus', 'A320neo', 160);
INSERT INTO Aircrafts (id, name, model, capacity) VALUES (3, 'Boeing', '787 Dreamliner', 250);

