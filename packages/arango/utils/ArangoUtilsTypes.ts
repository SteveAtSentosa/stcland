import type { Database } from 'arangojs'
import { CreateDatabaseUser } from 'arangojs/database'
import {
  CollectionType,
  DocumentCollection,
  EdgeCollection
} from 'arangojs/collection'

export interface ArangoHostConfig {
  url: string
  username?: string
  password?: string
}

//*****************************************************************************
// General utils
//*****************************************************************************

// Fetch the arango system database, throws error if connection fails
export type GetSysDb = (
  hostConfig: ArangoHostConfig,
  opts?: { checkConnection: boolean }
) => Promise<Database>

export type CanConnectToDbServer = ( hostConfig: ArangoHostConfig ) => Promise<boolean>
export type CanNotConnectToDbServer = ( hostConfig: ArangoHostConfig ) => Promise<boolean>

//*****************************************************************************
// DB utils
//*****************************************************************************

export type DbIsConnected = ( db: Database ) => Promise<boolean>
export type DbIsNotConnected = ( db: Database ) => Promise<boolean>

export type DbExists = {
  (hostConfig: ArangoHostConfig, dbName: string): Promise<boolean>;
  (sysDb: Database, dbName: string): Promise<boolean>;
  }
export type DbDoesNotExist = DbExists

export type DataBaseUser = CreateDatabaseUser

export enum IfDbExists {
  ThrowError = 'throw-error',
  Overwrite = 'overwrite',
  ReturnExisting = 'return-existing',
}

// Create a new arango database, throws error if connection to db server fails
export type CreateDb = {
  ( hostConfig: ArangoHostConfig,
    dbName: string,
    dbUsers: CreateDatabaseUser[],
    ifDbExists: IfDbExists): Promise<Database>;
  ( sysDb: Database,
    dbName: string,
    dbUsers: CreateDatabaseUser[],
    ifDbExists: IfDbExists): Promise<Database>;
}

// if database does not exist, returns false
export type DropDb = {
  ( hostConfig: ArangoHostConfig, dbName: string ) : Promise<boolean>;
  ( sysDb: Database, dbName: string ) : Promise<boolean>;
}

// returns false if any errors occured during deletion
export type DropAllDatabases = {
  ( hostConfig: ArangoHostConfig) : Promise<boolean>;
  ( sysDb: Database ) : Promise<boolean>;
}

export type NonSystemDbsExists = {
  ( hostConfig: ArangoHostConfig ) : Promise<boolean>;
  ( sysDb: Database ) : Promise<boolean>;
}

//*****************************************************************************
// Collection utils
//*****************************************************************************

export type CollectionExists =  (db: Database, collectionName: string) => Promise<boolean>;
export type CollectionDoesNotExist = CollectionExists

export { CollectionType }

export enum IfCollectionExists {
  ThrowError = 'throw-error',
  Overwrite = 'overwrite',
  ReturnExisting = 'return-existing',
}

export interface CreateCollectionOpts {
  type?: CollectionType // defaults to EDGE_COLLECTION
  ifExists?: IfCollectionExists // defaults to ThrowError
}

// Create a new arango database, throws error if connection to db server fails
export type CreateCollection = (
  db: Database,
  collectionName: string,
  opts: CreateCollectionOpts
) => Promise<DocumentCollection | EdgeCollection>;

export type CreateDocumentCollection = (
  db: Database,
  collectionName: string,
  ifExists?: IfCollectionExists
) => Promise<DocumentCollection>;

export type CreateEdgeCollection = (
  db: Database,
  collectionName: string,
  ifExists?: IfCollectionExists
) => Promise<EdgeCollection>;

export type CollectionDocCount = (
  collection: DocumentCollection | EdgeCollection
) => Promise<number>
