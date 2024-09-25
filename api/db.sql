CREATE TABLE IF NOT EXISTS preferences (
    preferenceID serial PRIMARY KEY ,
    preference VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS security_questions(
    questionID serial PRIMARY KEY ,
    question VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    userid serial PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    pass_hash VARCHAR(255) NOT NULL,
    question INT NOT NULL,
    answer_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    phone int NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    user_role VARCHAR(7) DEFAULT 'user',
    dob DATE ,
    gender char(1) NOT NULL,
    occupation VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    preference int,
    verified_email BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (preference) REFERENCES preferences(preferenceID),
    FOREIGN KEY (question) REFERENCES security_questions(questionID),
    UNIQUE (username)
);


INSERT INTO preferences(preference) VALUES 
('Vegetarian'),
('Non-vegetarian'),
('Drinker'),
('Smoker'),
('Sports-person'),
('Morning-person'),
('Night-owl');

INSERT INTO security_questions(question) VALUES
('What is your mothers maiden name?'),
('What is the name of your first pet?'),
('What is the name of the city where you were born?'),
('What is the name of your favorite teacher?'),
('What is the name of your favorite movie?'),
('What is the name of your favorite book?'),
('What is the name of your favorite song?'),
('What is the name of your favorite food?'),
('What is your favorite color?'),
('What is the name of your favorite vacation spot?');

CREATE TABLE IF NOT EXISTS refresh_token(
    userid int, 
    token TEXT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(userid)
);

CREATE TABLE IF NOT EXISTS listing(
    propertyID serial PRIMARY KEY,
    property_title VARCHAR(255) NOT NULL,
    property_desc TEXT NOT NULL,
    images JSON,
    uploadedBy int NOT NULL,
    uploadedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isAvailable BOOLEAN DEFAULT TRUE,
    rentedOn TIMESTAMP DEFAULT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    listingType INT NOT NULL,
    preferenceID INT NOT NULL,
    FOREIGN KEY (uploadedBy) REFERENCES users(userid),
    FOREIGN KEY (preferenceID) REFERENCES preferences(preferenceID)
);

CREATE TABLE IF NOT EXISTS listing_stats(
    propertyiD int PRIMARY KEY,
    views int DEFAULT 0,
    likes int DEFAULT 0,
    shares int default 0,
    FOREIGN KEY (propertyiD) REFERENCES listing(propertyID)
);

CREATE TABLE IF NOT EXISTS report(
    reportiD serial PRIMARY KEY,
    reported_by int NOT NULL,
    reported_on TIMESTAMP DEFAULT NOW(),
    reported_for TEXT NOT NULL,
    propertyID int NOT NULL,
    FOREIGN KEY (reported_by) REFERENCES users(userid),
    FOREIGN KEY (propertyID) REFERENCES listing(propertyID)
);

CREATE TABLE IF NOT EXISTS messages(
    message_id SERIAL PRIMARY KEY,
    sender_id int NOT NULL,
    receiver_id int NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (sender_id) REFERENCES users(userid),
    FOREIGN KEY (receiver_id) REFERENCES users(userid)
);