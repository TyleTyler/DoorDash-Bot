const { Builder, By, until } = require("selenium-webdriver");
const fs = require('fs').promises;

const driver = new Builder().forBrowser("chrome").build();
const { getPhoneNumber, getVerificationCode } = require("./phoneFunction");
const getEmail = require("./tempMail");

const getHTMLElement = async (element) => {
    return driver.executeScript(`const elements = () => { return document.querySelector("${element}"); }; return elements()`);
};

const getHTMLElements = async (element) => {
    return driver.findElements(By.css(element));
};

const appendUserToFile = async (user) => {
    const filePath = 'users.txt';

    const createUserObject = (user) => ({
        first: user.fname,
        lastName: user.lname,
        email: user.email,
        password: user.password,
        number: user.number
    });

    try {
        // Check if the file exists, if not, create it
        await fs.access(filePath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`File '${filePath}' not found. Creating a new file.`);
            await fs.writeFile(filePath, '');
        } else {
            throw error;
        }
    }

    // Create the user object
    const userObject = createUserObject(user);

    // Convert the user object to JSON format
    const userJSON = JSON.stringify(userObject, null, 2); // Using 2 spaces for indentation

    // Append the user JSON to the file
    await fs.appendFile(filePath, `${userJSON}\n`);

    console.log(`User data appended to '${filePath}'`);
};

const makeAccount = async () => {
    try {
        let phoneNumber = await getPhoneNumber();
        phoneNumber = phoneNumber.phoneNum;
        const email = await getEmail();

        await driver.get("https://www.doordash.com/");
        const signUpButton = await getHTMLElement("a[data-anchor-id='signUpButton']");
        await driver.get(await signUpButton.getAttribute('href'));

        await driver.wait(until.elementLocated(By.css("input[autocomplete='given-name']")));
        let currentElement = await getHTMLElements("input");
        let user = await fetch("http://filltext.com/?rows=1&fname={firstName}&lname={lastName}&password={{string|10}}").then(res => res.json());
        user = user[0];
        currentElement[1].sendKeys(user.fname);
        currentElement[2].sendKeys(user.lname);
        currentElement[3].sendKeys(email);
        currentElement[4].sendKeys(phoneNumber);
        currentElement[5].sendKeys(user.password);
        currentElement = await getHTMLElement("#sign-up-submit-button");
        currentElement.click();
        await new Promise(r => setTimeout(r, 2000));        
        const verification = await getVerificationCode(phoneNumber);
        console.log(verification);
        await driver.wait(until.elementLocated(By.css("#FieldWrapper-6")));
        currentElement = await getHTMLElement("#FieldWrapper-6");
        currentElement.sendKeys(verification);
        currentElement = await getHTMLElement("#prism-modal-footer button")
        currentElement.click()

        // Save user information to a file
        await appendUserToFile({
            fname: user.fname,
            lname: user.lname,
            email: email,
            password: user.password,
            number: phoneNumber
        });
    } catch (error) {
        console.error("Error in making an account:", error);
    }
};

(async () => {
    await makeAccount();
})();
