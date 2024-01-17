require("events").EventEmitter.defaultMaxListeners = 50;
const { Builder, By } = require("selenium-webdriver");

const getHTMLElement = async (driver, element)=>{
  return driver.executeScript(`const elements = () => { return document.querySelector("${element}"); }; return elements()`);
}
const getHTMLElements = async (driver, element)=>{
  return driver.executeScript(`const elements = () => { return document.querySelectorAll("${element}"); }; return elements()`);
}


const getPhoneNumber = async () => {
  let driver;
  try {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.get("https://freephonenum.com/us");

    let phone = await driver.executeScript(`
      let phoneElem = Array.from(document.querySelectorAll("a.numbers-btn:not(.disabled)"))
        .reduce((highest, current) => {
          const currentNumber = Number(current.querySelector(".sms-count").innerText.split(": ")[1]);
          if (!highest || currentNumber > Number(highest.querySelector(".sms-count").innerText.split(": ")[1])) return current;
          return highest;
        }, null);
      let phoneNum = phoneElem.href.split("receive-sms/")[1];
      let phoneUrl = phoneElem.href;
      return { phoneNum: phoneNum, phoneUrl: phoneUrl };
    `);

    console.log(phone);
    return phone;
  } catch (error) {
    console.error("Error in getting a phone number:", error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
};

const getVerificationCode = async (number) => {
  let driver;
  try {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.get(`https://freephonenum.com/us/receive-sms/${number}`);
    driver.navigate().refresh()
    const verificationBlock = await getHTMLElement(driver, "tbody tr td:nth-child(3)")
    let verificationMessage = await verificationBlock.getAttribute("textContent")
    verificationMessage = verificationMessage.substring(verificationMessage.indexOf("is") + 3, verificationMessage.indexOf("is") + 9)
    return verificationMessage
  } catch (error) {
    console.error("Error with retrieving verification code:", error);
  }finally{
    if(driver){
      await driver.quit()
    }
  }
};

// (async () => {
//   // const phoneNumber = await getPhoneNumber();
//   await getVerificationCode("8044064234");
// })();

module.exports = {getPhoneNumber, getVerificationCode};
