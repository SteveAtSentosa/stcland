import { ParsedSpreadheetCallBack, ParseOptions } from '@stcland/spreadsheet-parser'

import {
  IfCollectionDoesNotExistOnGet,
} from '../utils/ArangoUtilsTypes'

import type {
  IfDbDoesNotExistOnGet
} from '../utils/ArangoUtilsTypes'


import type {
  ArangoHostConfig,
  CreateDatabaseUser
} from '../utils/ArangoUtilsTypes'


import { Database } from 'arangojs'
import { CollectionType } from '../utils'

export type IfTargetDbDoesNotExist = IfDbDoesNotExistOnGet

export const enum IfTargetCollectionDoesNotExist {
  ThrowError = IfCollectionDoesNotExistOnGet.ThrowError,
  Create = IfCollectionDoesNotExistOnGet.Create
}

export { CreateDatabaseUser }

export interface LoadSpreadsheetDataOpts extends
  Pick<ParseOptions, 'reportProgress' | 'reportWarnings'> {
  ifTargetDbDoesNotExist?: IfTargetDbDoesNotExist
    // defaults to create
  dbUsers?: CreateDatabaseUser[]
    // only needed if IfTargertDbDoesNotExist is Create
    // defaults to []
  ifTargetCollectionDoesNotEist?: IfTargetCollectionDoesNotExist
    // defaults to Append
  validateEdgeTargets?: boolean
    // For edge collections, validate that the _from and _to docs exist
    // defaults to true
}

export type LoadSpreadsheetData = (
  excelFilePath: string,
  arangoHostConfig: ArangoHostConfig,
  dbName: string,
  loadDataOpts: LoadSpreadsheetDataOpts
) => Promise<number>;
    // number of records loaded

export type LoadWorksheetData = ParsedSpreadheetCallBack

export interface ArangoDataLoaderMeta {
  arangoType : 'docCollection' | 'edgeCollection' | 'graph'
  [key: string]: any
}

export interface ArangoDataLoaderClientData {
  db: Database
  loadDataOpts: LoadSpreadsheetDataOpts
}

export const ValidWorksheetTypes = [
  'docCollection', 'edgeCollection','graph'
]

export const collectionTypeMap: Record<'docCollection' | 'edgeCollection', CollectionType> = {
  docCollection: CollectionType.DOCUMENT_COLLECTION,
  edgeCollection: CollectionType.EDGE_COLLECTION,
}
