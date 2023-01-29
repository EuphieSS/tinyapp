const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));

///////////// DATABASES /////////////

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const userDatabase = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("monkeytype", 10)
  }
};

///////////// HELPER FUNCTIONS /////////////

const { findUserByEmail, urlsForUser, generateRandomString } = require("./helpers");

///////////// /LOGIN ROUTES /////////////

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const existingUser = findUserByEmail(email, userDatabase); //check if user already exist by email
  
  if (!existingUser) {
    res.send("Information entered is incorrect, please try again.");
  }
  
  if (!bcrypt.compareSync(password, existingUser.password)) { //if user exists but password does not match
    res.send("Information entered is incorrect, please try again.");
  } else {
    req.session.user_id = existingUser.id; //set cookie for login
    res.redirect("/urls");
  }

});

app.get("/login", (req, res) => { //DISPLAY A LOGIN FORM
  if (req.session.user_id) { //if user is already logged in
    res.redirect("/urls");
    return;
  }
  
  const templateVars = {
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_login", templateVars);

});

///////////// /LOGOUT ROUTES /////////////

app.post("/logout", (req, res) => { //DELETE COOKIE ONCE LOGGED OUT
  req.session.user_id = null;
  res.redirect("/login");
});

///////////// /REGISTER ROUTES /////////////

app.get("/register", (req, res) => { //DISPLAY A REGISTRATION FORM
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  
  const templateVars = {
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_registration", templateVars);

});

app.post("/register", (req, res) => { //ADD NEW USER OBJECT TO THE USERDATABASE
  const userId = generateRandomString(6); //generate a random 5 character long id
  const email = req.body.email;
  const password = req.body.password;
  const existingUser = findUserByEmail(email, userDatabase); //check if user already exist by email
  
  if (email === "" || password === "") {
    res.send("Please ensure your information is correct.");
  }
  
  if (existingUser) { //if user exists
    res.send("Invalid information, please try again.");
  } else {
    userDatabase[userId] = {
      id: userId,
      email,
      password: bcrypt.hashSync(password, 10)
    };
    req.session.user_id = userId;
    res.redirect("/urls");
  }

});

///////////// /URLS ROUTES /////////////

app.post("/urls", (req, res) => { //GENERATE NEW SHORT URL
  if (!req.session.user_id) {
    res.send("Pleas log in first.");
    return;
  }

  const shortURL = generateRandomString(6); //generate a random 6 character long id
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = { longURL, userID }; //add data submission (long URL) and current user's id to urlDatabase
  const templateVars = { id: shortURL };
  res.redirect(`/urls/${templateVars.id}`); //redirect client to a new page that shows the new short url created

});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("Pleas log in or register first.");
    return;
  }

  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_index", templateVars);

});

///////////// /URLS/NEW ROUTE /////////////

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  
  const templateVars = {
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_new", templateVars);

});

///////////// /URLS/:ID/DELETE ROUTE /////////////

app.post("/urls/:id/delete", (req, res) => { //post path === form action in urls_index.ejs
  const existingURLId = urlDatabase[req.params.id];
  if (existingURLId === undefined) {
    res.send("Invalid URL.");
    return;
  }

  if (existingURLId.userID === req.session.user_id) {
    delete urlDatabase[req.params.id]; //DELETE A SUBMISSION
    res.redirect("/urls");
  } else {
    res.send("Access not permitted.");
  }

});

///////////// /URLS/:ID ROUTES /////////////

app.post("/urls/:id", (req, res) => { //UPDATE EXISTING LONG URL
  const existingURLId = urlDatabase[req.params.id];
  if (existingURLId === undefined) {
    res.send("Invalid URL.");
    return;
  }

  if (existingURLId.userID === req.session.user_id) {
    urlDatabase[req.params.id].longURL = req.body.longURL; //assign new longURL to shortURL
    res.redirect("/urls");
  } else {
    res.send("Access not permitted.");
  }

});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) { //check if user is logged in
    res.send("Please log in or register first.");
    return;
  }

  if (urlDatabase[req.params.id] === undefined) { //check if requested url is owned by user
    res.send("Sorry, information not accessible.");
    return;
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_show", templateVars);

});

///////////// /U/:ID ROUTE /////////////

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("Short URL Id does not exist.");
    return;
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);

});

///////////// / ROUTE /////////////

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }

  res.redirect("/urls");
});

///////////// PORT LISTENING /////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});