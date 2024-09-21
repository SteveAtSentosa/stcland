import { Worksheet, Workbook, Row, CellValue } from 'exceljs'

import type { PredFn } from '@stcland/utils'


//--- common -------------------------------------------------------------=====

export type DataType =
  'string' | 'number' | 'boolean' | 'bigint' | 'date' | 'password' | 'json' | 'uuid';

export const validDataTypes: DataType[] = [
  'string', 'number', 'boolean', 'bigint', 'date', 'password', 'json', 'uuid'
]

export interface WorksheetMeta  {
  worksheetName: string
}
export interface RowMeta extends WorksheetMeta {
  rowNumber: number;
}

export interface CellMeta extends RowMeta {
  colNumber: number;
}

export interface DataCellMeta extends CellMeta {
  propName: string;
  propType: DataType;
}

export interface ParseOptions {
  reportProgress?: boolean
    // defaults to true
  reportWarnings?: boolean
    // defaults to true
  dataTerminationRow? : '---'
  // undefined means no termination data parsing on empty row or end of file
}

export type DataTypes = Record<string, DataType>
export type Meta = Record<string, any>
export type MetaTypes = Record<string, DataType>

//--- data layout -------------------------------------------------------------

export type DataLayout = 'dataList' | 'dataTable' | 'frontMatterOnly'

export const validDataLayouts: DataLayout[] = ['dataList', 'dataTable', 'frontMatterOnly']

export interface ParseDataLayoutResult {
  dataLayout: DataLayout
  nextRowNum: number
}

export type ParseDataLayout = (
  ws: Worksheet,
  rowNumber: number,
  parseOpts?: ParseOptions
) => ParseDataLayoutResult

export type Data = Record<string, any>

//--- front matter ------------------------------------------------------------

export interface ParseFrontMatterResult {
  meta?: Meta
  metaTypes?: MetaTypes
  nextRowNum: number
}

export type ParseFrontMatter = (
  ws: Worksheet,
  startingRowNum: number,
  parseOpts?: ParseOptions
) => ParseFrontMatterResult;


//--- data table --------------------------------------------------------------

// list of objects
export type DataTableData = Data[]

export interface ParseDataTableResult {
  data: DataTableData
  dataTypes: DataTypes
  numDataRowsParsed: number
}

export type ParseDataTable = (
  ws: Worksheet,
  startingRowNum: number,
  parseOpts?: ParseOptions
) => ParseDataTableResult;


// --- data list --------------------------------------------------------------

// object
export type DataListData = Data

export interface ParseDataListResult {
  data: DataListData | undefined
  dataTypes: DataTypes | undefined
  numDataRowsParsed: number
}

export type ParseDataList = (
  ws: Worksheet,
  startingRowNum: number,
  parseOpts?: ParseOptions
) => ParseDataListResult;


// --- worksheet parsing ------------------------------------------------------

export interface ParsedWorksheetResult {
  worksheetName: string,
  dataLayout: DataLayout,
  numDataRowsParsed: number,
  meta?: Meta
  metaTypes?: MetaTypes
  data?: DataListData | DataTableData
  dataTypes?: DataTypes
}

export type ParseWorksheet = (
  ws: Worksheet,
  parseOpts?: ParseOptions,
  startingRowNum?: number, // defaults to 1
) => ParsedWorksheetResult;

export type ParsedSpreadheetCallBack = (
  parsedWorksheet: ParsedWorksheetResult,
    // parsed worksheet data for your callback to proccess
  clientData?: any
    // data that you your cb may need
) => Promise<false | any>
    // client can return anything they want
    // client can return false if they want to stop the iteration

//--- spreadsheet (workbook) parsing -----------------------------------------

/**
 loads a spreadsheet from disk, iterates over each worksheet,
 and calls the callback for each parsed worksheet

 Throws Error if the spreadsheet does not exist
 */
export type ForEachSheet = (
  cb: ParsedSpreadheetCallBack,
    // called for each parsed worksheet, passed the parsed worksheet data
  spreadsheetPath: string,
    // path and filename for the spreadsheet to be parsed
  clientData?: any,
    // data that you your cb may need, will be passed as 2nd argument to cb
  parseOpts?: ParseOptions,
    // options to control parsing
  startingRowNum?: number,
    // if your data starts on a row other than 1
    // must the the same for all worksheets
) => Promise<void>

// TODO:
// - version of parseWorksheet that takes spreadsheet path and worksheet name
// - parseSpreadsheet by both spreadsheet path and workbook


// --- utility functions ------------------------------------------------------

/*
  Given a workbook, returns an array of worksheets that pass all filter functions
*/
export interface GetWorkSheetListOptions {
  wb: Workbook;
  filterFns?: PredFn<Worksheet>[];
}
export type GetWorkSheetList = (
  wb: Workbook,
  filterFns?: PredFn<Worksheet>[] // list of functions to filter unwante worksheets
) => Worksheet[];

export type GetPropTypesFromRow = (row: Row) => DataType[];

// Returnn values from a worksheet row
export type GetRowValues = (row: Row) => CellValue[];

