const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

///////////// DATABASES /////////////

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  "ab123": {
    id: "ab123",
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

///////////// /LOGIN ROUTES /////////////

app.post("/login", (req, res) => { //SET COOKIE FOR LOGIN
  console.log(req.body);
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

///////////// /LOGOUT ROUTES /////////////

app.post("/logout", (req, res) => { //DELETE COOKIE ONCE LOGGED OUT
  console.log(req.body);
  res.clearCookie("username", req.body.username);
  res.redirect("/urls");
});

///////////// /REGISTER ROUTES /////////////

app.get("/register", (req, res) => { //DISPLAY A REGISTRATION FORM
  const templateVars = {
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => { //ADD NEW USER OBJECT TO THE USERDATABASE
  const userId = generateRandomString(5); //generate a random 5 character long id
  const email = req.body.email;
  const password = req.body.password;
  const existingUser = findUserByEmail(email, userDatabase);
  if (email === "" || password === "") {
    res.status(400).send("400 error! Please ensure your information is correct.");
  }
  if (existingUser) {
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
  // console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString(6); //generate a random 6 character long id
  urlDatabase[shortURL] = req.body.longURL; //add data submission (long URL) to urlDatabase
  const templateVars = { id: shortURL, longURL: urlDatabase[shortURL] };
  res.redirect(`/urls/${templateVars.id}`); //redirect client to a new page that shows the new short url created
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

///////////// /URLS/NEW ROUTE /////////////

app.get("/urls/new", (req, res) => {
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
  // console.log(req.params.id);
  urlDatabase[req.params.id] = req.body.longURL; //assign new longURL to shortURL
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

///////////// /U/:ID /////////////

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
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