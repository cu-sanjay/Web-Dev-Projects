import config from "../config/config";
import { Client, ID, Databases, Storage, Query, Permission, Role } from "appwrite";

export class Service {
    client = new Client();
    databases;
    bucket;

    constructor() {
        this.client
            .setEndpoint(config.appwrite)
            .setProject(config.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    async createPost({ title, slug, content, userId, status, featuredImage }) {
        try {
            return await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredImage,
                    status,
                    userId,
                }
            )
        } catch (error) {
            console.log("Appwrite createPost error::", error);
        }
    }

    async updatePost(slug, { title, content, status, featuredImage }) {
        try {
            return await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredImage,
                    status,

                }
            )
        } catch (error) {
            console.log("Appwrite :: updatepost error::", error);
        }
    }
    async deletePost(slug) {
        try {
            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                slug
            )
            return true;
        } catch (error) {
            console.log("Appwrite :: deletePost error::", error);
        }
        return false;
    }
    async getPost(slug) {
        try {
            return await this.databases.getDocument(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                slug
            )

        } catch (error) {
            console.log("Appwrite :: getPost error::", error);
            return false;
        }

    }

    async getPosts(queries = [Query.equal("status", "active")]) {
        try {
            return await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                queries
            )
        } catch (error) {
            console.log("Appwrite :: getPosts error::", error);
        }
    }
    // file upload
    async uploadFile(file) {
    try {
        return await this.bucket.createFile(
            config.appwriteBucketId,
            ID.unique(),
            file,
            [
                Permission.read(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        )
    } catch (error) {
        console.log("Appwrite :: uploadFile error::", error);
        return false;
    }
}


    async deleteFile(fileId) {
        try {
            await this.bucket.deleteFile(
                config.appwriteBucketId,
                fileId
            );
            return true;
        } catch (error) {
            console.log("appwrite error:: deleteFile error:", error);

        }
        return false;
    }
    getFileView(fileId) {
        return this.bucket.getFileView(
            config.appwriteBucketId,
            fileId
        )
    }
}

const service = new Service();

export default service;
