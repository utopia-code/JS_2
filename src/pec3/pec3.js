/**
 * User input readed from a web form
 */
export class UserForm {
  constructor(data) {
    /** The user's name */
    this.userName = data.username;
    /** The desired password */
    this.password = data.password;
    /** The confirmed password */
    this.confirmPassword = data.confirmPassword;
  }
}

/**
 * The data of a single user
 */
export class UserData {
  constructor(data) {
    /** The user's name */
    this.userName = data.username;
    /** The user's password */
    this.password = data.password;
    /** THe user's email */
    this.email = data.email;
  }
}

/**
 * Exercise 1, 1.5 points
 * 
 * @param {String[]|null} data
 * @param {(data,error)=>any} callback
 */
export function generateStats(data, callback) {
  if (Array.isArray(data) && data.every(element => typeof element === 'string' || element === null)) {
    const dataFilter = data.filter(item => item !== null);
    const dataObj = {};
    dataFilter.forEach(item => {
      dataObj[item] ? dataObj[item]++ : dataObj[item] = 1
    })
  
    return callback(dataObj, null)
  } else {
    return callback(null, 'Invalid input')
  }
  
}

/**
 * Exercise 2, 1.5 points
 * 
 * @param {Number} time
 * @param {Array} info
 * @param {(data:Array)=>any} callback 
 * @returns 
 */
export function callbackPromise(time, info, callback) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const arr = callback(info);
        if (!Array.isArray(arr) || 
            arr.length !== info.length) {
          reject(new Error('Error'));
        } 
        const newArr = info.map((value, index) => value + arr[index]);
        resolve(newArr);
      }
      catch (error){
        reject(error)
      }
    }, time);
  });
}

/**
 * Exercise 3, 1.5 points
 * 
 * @param {FormData} formData The user input data
 * @param {(name:String)=>Promise<Boolean>} userExists Function that takes an user name and
 * returns a promise that states whether the user exists or not.
 * 
 */
export function validateForm(formData, userExists) {
 return new Promise((resolve, reject) => {
    try {
      
      if (!formData.userName) {
        throw new Error('userName cannot be null');
      }
      if (!formData.password) {
        throw new Error('password cannot be null')
      }
      if (formData.confirmPassword !== formData.password) {
        throw new Error('passwords don\'t match')
      }

      userExists(formData.userName)
        .then((resultUserExists) => {
          if(resultUserExists) {
            throw new Error('userName already exists');
          } else {
            resolve(formData)
          }
        })
        .catch((e) => {
          reject(e.message);
        })
    }
    catch (e){
      reject(e.message);
    }

 });
}

/**
 * Exercise 4, 1.5 points
 * 
 * @param {()=>Promise<UserData>} getUserData Function that returns a promise with the user form data
 * @param {(data:UserData)=>Promise<Number>} validateData Validates user data and returns 
 * a promise with a validation number
 * @param {(data:UserData)=>Promise<String>} saveUserData Stores user data and returns the new record ID
 * @returns {Promise<{userData:UserData,validationCode:Number,userId:String}}
 */
export function registrationProcess(getUserData, validateData, saveUserData) {
  let userData;
  let validationCode;
  let userId;

  return getUserData()
    .then(data => {
      userData = data
      return validateData(userData)
      .then(data => {
        validationCode = data;
        return saveUserData(userData)
        .then((data) => {
          userId = data;
          return {
            userData: userData,
            validationCode: validationCode,
            userId: userId
          }
        }, () => { throw 'saveUserData' })
      }, () => { throw 'validateData' })
    }, () => {  throw 'getUserData' })
    .catch((e) => {
      throw `REGISTRATION FAILED: ${e}`
    })
}

/**
 * Exercise 5, 1.5 points
 */
export async function asyncProcess(times, produce, consume) {

  const result = [];

  for(let i = 0; i < times; i++) {
    try {
      const production = await produce()
      for(const item of production) {
        try {
          const consumeData = await consume(item)
          result.push(consumeData)
        }
        catch(e) {
          throw `error-at-${i}`
        }
      }      
    }
    catch(e) {
      throw new Error(`Error on iteration ${i}: ${e.message}`)
    }
  }

  return result
}
/**
 * Exercise 6, 1.5 points
 * 
 * @param {()=>Promise} produce 
 * @param {(data:any)=>Promise} consume
 * @returns 
 */
export function backgroundProcess(produce, consume) {

  let available = [];
  let totalProduced = 0;
  let status = 0;
  
  let iteration = setInterval( async () => {

    const product = await produce();
    if(product !== null) {
      status = 1
      totalProduced += product.length;
      
      for(const item of product) {
        try {
          await consume(item)
          available.push(item)
        }
        catch (e) {
          throw new Error(`Error type number: ${e}`)
        }
      }
    } else {
      status = 2
      clearInterval(iteration)
    }
  }, 100);

  return function getData() {
    const data = {
      available: available,
      status: status,
      totalProduced: totalProduced
    }

    available = []

    return data
  }

}