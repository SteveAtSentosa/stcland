import { ParsedSpreadheetCallBack, WorksheetParseOptions } from '@stcland/spreadsheet-parser'
import {
  ArangoHostConfig,
  IfDbDoesNotExistOnGet, // IfDbExistsOnCreate,
  IfCollectionDoesNotExistOnGet,
  DataBaseUser as ArangoDataBaseUser
} from '../utils/ArangoUtilsTypes'
import { Database } from 'arangojs'

export const enum IfTargetDbDoesNotExist {
  ThrowError = IfDbDoesNotExistOnGet.ThrowError,
  Create =  IfDbDoesNotExistOnGet.Create
}

export const enum IfTargetCollectionDoesNotExist {
  ThrowError = IfCollectionDoesNotExistOnGet.ThrowError,
  Create = IfCollectionDoesNotExistOnGet.Create
}

export type DataBaseUser = Pick<ArangoDataBaseUser, 'username' | 'passwd'>

export interface LoadSpreadsheetDataOpts extends
  Pick<WorksheetParseOptions, 'reportProgress' | 'reportWarnings'> {
  ifTargetDbDoesNotExist?: IfTargetDbDoesNotExist
    // defaults to create
  dbUsers?: DataBaseUser[]
    // only needed if IfTargertDbDoesNotExist is Create
    // defaults to []
    ifTargetCollectionDoesNotEist?: IfTargetCollectionDoesNotExist
    // defaults to Append
}

export type LoadSpreadsheetData = (
  excelFilePath: string,
  arangoHostConfig: ArangoHostConfig,
  dbName: string,
  opts: LoadSpreadsheetDataOpts
) => Promise<number>;
    // number of records loaded

export type LoadWorksheetData = ParsedSpreadheetCallBack

export interface ArangoDataLoaderMeta {
  type: 'docCollection' | 'edgeCollection' | 'graph '
}

export interface ArangoDataLoaderClientData {
  db: Database
  ifTargetCollectionDoesNotEist: IfTargetCollectionDoesNotExist
}


export const ValidWorksheetTypes = [
  'docCollection',
  'edgeCollection',
  'graph'
]
