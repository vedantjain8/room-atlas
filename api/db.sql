CREATE TABLE IF NOT EXISTS preferences (
    preference_id serial PRIMARY KEY ,
    preference VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS security_questions(
    question_id serial PRIMARY KEY ,
    question VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    user_id serial PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    pass_hash VARCHAR(255) NOT NULL,
    question INT NOT NULL,
    answer_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    phone VARCHAR(10) NOT NULL UNIQUE,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    user_role VARCHAR(7) DEFAULT 'user',
    dob DATE ,
    gender char(1) NOT NULL CHECK(gender IN ("M","F","O")),
    occupation VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    verified_email BOOLEAN DEFAULT FALSE,
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

CREATE TABLE IF NOT EXISTS preference_user_link(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, 
    preference_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (preference_id) REFERENCES preferences(preference_id),
    UNIQUE(user_id, preference_id)
);

CREATE TABLE IF NOT EXISTS preference_listing_link (
    id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL,
    preference_id INT NOT NULL,
    FOREIGN KEY (listing_id) REFERENCES listing(property_id),
    FOREIGN KEY (preference_id) REFERENCES preferences(preference_id),
    UNIQUE(listing_id, preference_id)
  );

CREATE TABLE IF NOT EXISTS refresh_token(
    user_id int, 
    token TEXT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS listing(
    property_id serial PRIMARY KEY,
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
    FOREIGN KEY (uploadedBy) REFERENCES users(user_id),
);

-- TODO: Add a trigger to update the listing stats table
CREATE TABLE IF NOT EXISTS listing_stats(
    property_id int PRIMARY KEY,
    views int DEFAULT 0,
    likes int DEFAULT 0,
    shares int default 0,
    FOREIGN KEY (property_id) REFERENCES listing(property_id)
);

CREATE TABLE IF NOT EXISTS report(
    report_id serial PRIMARY KEY,
    reported_by int NOT NULL,
    reported_on TIMESTAMP DEFAULT NOW(),
    reported_for TEXT NOT NULL,
    property_id int NOT NULL,
    FOREIGN KEY (reported_by) REFERENCES users(user_id),
    FOREIGN KEY (property_id) REFERENCES listing(property_id)
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

CREATE TABLE IF NOT EXISTS user_ratings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    ratings DECIMAL(2,1) NOT NULL,
    comments VARCHAR(255) DEFAULT NULL,
    rated_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (rated_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS property_ratings (
    id SERIAL PRIMARY KEY ,
    property_id INT NOT NULL, 
    ratings DECIMAL(2,1) NOT NULL , 
    comments VARCHAR(255) DEFAULT NULL , 
    rated_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY property_id REFERENCES listing(property_id),
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS image_upload_log(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    image_path  TEXT NOT NULL,
    uploaded_on TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);