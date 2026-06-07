import { Client, Account, ID } from "appwrite";
import config from "../config/config";

// Appwrite authentication example
// const client = new Client()
//     .setEndpoint(config.appwrite) 
//     .setProject();                 // Your project ID

// const account = new Account(client);

// const user = await account.create({
//     userId: ID.unique(), 
//     email: 'email@example.com', 
//     password: 'password'
// });

// Our own AuthService class to encapsulate Appwrite authentication logic - same as above
export class AuthService{
    client = new Client();
    account;

    constructor(){
        this.client
            .setEndpoint(config.appwrite)
            .setProject(config.appwriteProjectId);

        this.account = new Account(this.client);
    }

    async createAccount({email, password, name}){
        const userAccount = await this.account.create(ID.unique(), email, password, name);

        if(userAccount){
            // Call another method
            return this.login({email, password});
        }
        else{ return userAccount;}
    }
    async login({ email, password }) {
        return await this.account.createEmailPasswordSession(email, password);
}

    async getCurrentUser(){
        try {
            return await this.account.get();
        } catch (error) {
            console.log("Appwrite getCurrentUser error::", error);
        }
        return null;
    }
    async logout(){
        await this.account.deleteSessions();
    }
}

const authService = new AuthService();

export default authService;
