// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const UserModel = require('./model/user.js');
var mongoose = require('mongoose');


const MongoClient = require('mongodb').MongoClient;
let cachedDb = null;

let response;
let conn = null;



/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    console.log('lambdaHandler ');
    return this.createUser(event,context); 
};

function getMessage() {
    try {
        
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'hello world',
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response;
}

const dbExecute = (db, fn) => db.then(fn).finally(() => db.close());

function dbConnectAndExecute(dbUrl, fn) {
  return dbExecute(mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }), fn);
}


const createErrorResponse = (statusCode, message) => ({
    statusCode: statusCode || 501,
    headers: { 'Content-Type': 'text/plain' },
    body: message || 'Incorrect id',
  });

module.exports.createUser = (event, context) => {
    const data = JSON.parse(event.body);
  
    console.log('createUser ', JSON.stringify(data));

    const user = new UserModel({
      firstname: data.firstname,
      lastname: data.lastname,
    });
    
    const dbUrl = process.env.MONGODB_URI;
    console.log('dburl ', dbUrl);

    //  dbConnectAndExecute(dbUrl, () => (
    //   user
    //     .save()
    //     .then(() => callback(null, { 'statusCode': 200, 'body': JSON.stringify('Ok') }))
    //     .catch(err => callback(null, createErrorResponse(err.statusCode, err.message)))
    // ));
   
         
   
    mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, res) {
        if (err) {
        console.log ('ERROR connecting to: ' + dbUrl + '. ' + err);
        } else {
        console.log ('Succeeded connected to: ' + dbUrl);
        }
      });
      user.save(function (err) {if (err) console.log ('Error on save!')});

       response = {
        'statusCode': 200,
        'body': JSON.stringify({
            message: 'hello world',
            // location: ret.data.trim()
        })};
    return response;


  };


  function connectToDatabase(uri) {
	console.log('=> connect to database');
	if (cachedDb) {
		console.log('=> using cached database instance');
		return Promise.resolve(cachedDb);
	}
    console.log('=>  created client proreass ');
	return MongoClient.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true } )
		.then(db => {
			cachedDb = db; //For mongo client before v3
			cachedDb = db.db("appmgmt"); //For mongo client v3,item is db i creted
            console.log('=>  created client ');
			return cachedDb;
		});
}

function queryDatabase(db) {
	console.log('=> query database');
	return db.collection('User').find({}).toArray()
		.then(() => {
			return {
				statusCode: 200,
				body: 'success'
			};
		})
		.catch(err => {
			console.log('=> an error occurred: ', err);
			return {
				statusCode: 500,
				body: 'error'
			};
		});
}

function save(db) {
    console.log('=> query database');
    const usr = { 'firstname': 'sai', 'lastname': 'sai'};
	return db.collection('User').save(usr)
		.then(() => {
			return {
				statusCode: 200,
				body: 'success'
			};
		})
		.catch(err => {
			console.log('=> an error occurred: ', err);
			return {
				statusCode: 500,
				body: 'error'
			};
		});
}

exports.userHandler = (event, context, callback) => {
	context.callbackWaitsForEmptyEventLoop = false;
	console.log('event: ', JSON.stringify(event.body));
    const dbUrl = process.env.MONGODB_URI;
    console.log('dburl ', dbUrl);



	connectToDatabase(dbUrl)
		.then(db => save(db))
		.then(result => {
			console.log('=> returning result: ', result);
			callback(null, result);
		})
		.catch(err => {
			console.log('=> an error occurred: ', err);
			callback(err);
    	});
    
    // response = {
    //     'statusCode': 200,
    //     'body': JSON.stringify({
    //         message: 'hello world',
    //         // location: ret.data.trim()
    //     })};

    // callback(null, response);
};