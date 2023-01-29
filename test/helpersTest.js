const { assert } = require('chai');

const { findUserByEmail, urlsForUser } = require('../helpers.js');


///////////// TESTS FOR findUserByEmail /////////////

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined if email is not in database', function() {
    const user = findUserByEmail("user@random.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });

});


///////////// TESTS FOR urlsForUser /////////////

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

describe('urlsForUser', function() {
  it('should return a list of urls with valid user id', function() {
    const urls = urlsForUser("aJ48lW", testUrlDatabase);
    const expectedOutput = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
      },
    };
    assert.deepEqual(urls, expectedOutput);
  });

  it('should return an empty object if user id does not match', function() {
    const urls = urlsForUser("bS4el3", testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });

});