require('events').EventEmitter.defaultMaxListeners = 50;
const { Builder, By, Key, until } = require("selenium-webdriver");


const getHTMLElement = async (driver, element)=>{
    return driver.executeScript(`const elements = () => { return document.querySelector("${element}"); }; return elements()`);
}
const getHTMLElements = async (driver, element)=>{
    return driver.executeScript(`const elements = () => { return document.querySelectorAll("${element}"); }; return elements()`);
}

const makeEmail = async ()=>{
    const driver = new Builder().forBrowser("chrome").build();
    try{
        await driver.get("https://generator.email/")
        await driver.wait(until.elementLocated(By.css("input#userName")))
        const username = await getHTMLElement(driver, "input#userName")
        const firstMail = await username.getAttribute('value')
        const domain = await getHTMLElement(driver, "input#domainName2")
        const secondMail = await domain.getAttribute('value')
        const fullMail = `${firstMail}@${secondMail}`
        return fullMail 
    }
    catch(error){
        console.log("Error in making an email:", error)
    // }finally{
    //     if(driver){
    //         await driver.quit()
    //     }
    }
}

// (async ()=>{
//     makeEmail()
// })();

module.exports = makeEmail