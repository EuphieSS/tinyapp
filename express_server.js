const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
    password: "monkeytype",
  }
};

///////////// HELPER FUNCTIONS /////////////

const generateRandomString = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const findUserByEmail = (email, database) => {
  for (const id in database) {
    if (email === database[id].email) {
      return database[id];
    }
  }
  return null;
};

const urlsForUser = (id, database) => {
  const userURLs = {};
  for (const url in database) {
    if (id === database[url].userID) {
      userURLs[url] = database[url];
    }
  }
  return userURLs;
};

///////////// /LOGIN ROUTES /////////////

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const existingUser = findUserByEmail(email, userDatabase); //check if user already exist by email
  
  if (!existingUser) {
    res.status(403).send("403 error! Information entered is incorrect, please try again.");
  }
  
  if (password !== existingUser.password) { //if user exists but password does not match
    res.status(403).send("403 error! Information entered is incorrect, please try again.");
  } else {
    res.cookie("user_id", existingUser.id); //set cookie for login
    res.redirect("/urls");
  }

});

app.get("/login", (req, res) => { //DISPLAY A LOGIN FORM
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
    return;
  }
  
  const templateVars = {
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);

});

///////////// /LOGOUT ROUTES /////////////

app.post("/logout", (req, res) => { //DELETE COOKIE ONCE LOGGED OUT
  console.log(req.body);
  res.clearCookie("user_id", req.body.id);
  res.redirect("/login");
});

///////////// /REGISTER ROUTES /////////////

app.get("/register", (req, res) => { //DISPLAY A REGISTRATION FORM
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
    return;
  }
  
  const templateVars = {
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_registration", templateVars);

});

app.post("/register", (req, res) => { //ADD NEW USER OBJECT TO THE USERDATABASE
  const userId = generateRandomString(6); //generate a random 5 character long id
  const email = req.body.email;
  const password = req.body.password;
  const existingUser = findUserByEmail(email, userDatabase); //check if user already exist by email
  
  if (email === "" || password === "") {
    res.status(400).send("400 error! Please ensure your information is correct.");
  }
  
  if (existingUser) { //if user exists
    res.status(400).send("400 error! Invalid information, please try again.");
  } else {
    userDatabase[userId] = {
      id: userId,
      email,
      password
    }
    res.cookie("user_id", userId);
    res.redirect("/urls");
  }

});

///////////// /URLS ROUTES /////////////

app.post("/urls", (req, res) => { //GENERATE NEW SHORT URL
  if (!req.cookies["user_id"]) {
    res.send("Pleas log in first.");
    return;
  }

  const shortURL = generateRandomString(6); //generate a random 6 character long id
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"];
  urlDatabase[shortURL] = { longURL, userID }; //add data submission (long URL) and current user's id to urlDatabase
  const templateVars = { id: shortURL/*, longURL: urlDatabase[shortURL].longURL*/ };
  res.redirect(`/urls/${templateVars.id}`); //redirect client to a new page that shows the new short url created

});

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.send("Pleas log in or register first.");
    return;
  }

  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"], urlDatabase),
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);

});

///////////// /URLS/NEW ROUTE /////////////

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
    return;
  }
  
  const templateVars = {
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);

});

///////////// /URLS/:ID/DELETE ROUTE /////////////

app.post("/urls/:id/delete", (req, res) => { //post path === form action in urls_index.ejs
  delete urlDatabase[req.params.id];         //DELETE A SUBMISSION
  res.redirect("/urls");
});

///////////// /URLS/:ID ROUTE /////////////

app.post("/urls/:id", (req, res) => { //UPDATE EXISTING LONG URL
  urlDatabase[req.params.id].longURL = req.body.longURL; //assign new longURL to shortURL
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const currentUser = req.cookies["user_id"];
  const urlOwner = urlDatabase[req.params.id].userID;
  if (!currentUser) {
    res.send("Pleas log in or register first.");
    return;
  }

  if (currentUser !== urlOwner) {
    res.send("Sorry, information not accessible.");
    return;
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

///////////// /U/:ID /////////////

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("Short URL Id does not exist.");
    return;
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);

});

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});