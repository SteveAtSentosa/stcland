import { describe, test, expect, beforeEach, beforeAll, assert } from 'vitest'

import path from 'path'
import { fileURLToPath } from 'url'

import { pathExists } from 'path-exists'
import { any, keys, omit } from 'ramda'

import { Workbook, Worksheet } from 'exceljs'

import {  allDefinedOrAllUndefined, objectsHaveSameKeys, toJson } from '@stcland/utils'

import { expectedSpreadsheetResults } from './expectedParsedSpreadsheetResults'
import {
  DataType, ParsedWorksheetResult, ParseOptions, MetaTypeMap, DataTypeMap,
  DataTableData, DataListData, Meta, Data
} from '../src/SpreadsheetParserTypes'

import { getWorksheetList } from '../src/spreadsheetParseUtils'
import type { ValidateOpts } from './testUtils'
import { assertConsistentDefinedState, dataTypeToTestFns } from './testUtils'
import { forEachSheet } from '../src/parseSpreadsheet'
import { isUndefined } from 'ramda-adjunct'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const spreadsheetPath = path.join(__dirname, 'test-spreadsheet-parsing.xlsx')

let workbook: Workbook
let worksheets: Worksheet[] = []


beforeAll(async () => {
  const spreadsheetExists = await pathExists(spreadsheetPath)
  if (!spreadsheetExists)
    throw new Error(`Spreadsheet file not found: ${spreadsheetPath}`)
})


beforeEach(async () => {
  workbook = new Workbook()
  await workbook.xlsx.readFile(spreadsheetPath)
  worksheets = getWorksheetList(workbook)
})

//-------------------------------------------------------------------------

interface TestMeta { message: string }

const testMeta: TestMeta = { message: 'Im testing over here' }

describe('Test Spreadsheet Parser', () => {

  test('forEach worksheet', async () => {

    const parseOpts: ParseOptions = { reportProgress: true, reportWarnings: false  }
    await forEachSheet(assertParsedWorksheet, spreadsheetPath, testMeta, parseOpts)

  })
})

//-------------------------------------------------------------------------

const assertParsedWorksheet = async (
  parsedWorksheet: ParsedWorksheetResult,
  clientData: TestMeta
) => {

  const {
    worksheetName,
    dataLayout,
    numDataRowsParsed,
    data: parsedData,
    dataTypeMap: parsedDataTypeMap,
    meta: parsedMeta,
    metaTypeMap: parsedMetaTypeMap
  } = parsedWorksheet

  const expectedParsedWorksheet = expectedSpreadsheetResults[worksheetName]

  if (!expectedParsedWorksheet) {
    console.log(`    No expected data for worksheet: ${worksheetName} (skipping)`)
    return true
  }

  const {
    worksheetName: expectedSheetName,
    dataLayout: expectedDataLayout,
    numDataRowsParsed: expectedNumDataRowsParsed,
    data: expectedData,
    dataTypeMap: expectedDataTypeMap,
    meta: expectedMeta,
    metaTypeMap: expectedMetaTypeMap
  } = expectedParsedWorksheet

  expect(clientData.message).toEqual(testMeta.message)
  expect(worksheetName).toEqual(expectedSheetName)
  expect(dataLayout).toEqual(expectedDataLayout)
  expect(numDataRowsParsed).toEqual(expectedNumDataRowsParsed)

  assertParsedWorkSheetMetaTypeMaps(
    expectedMetaTypeMap, parsedMetaTypeMap, worksheetName
  )

  assertParsedWorkSheetMeta(
    expectedMeta, expectedMetaTypeMap, parsedMeta, parsedMetaTypeMap, worksheetName
  )

  assertParsedWorksheetDataTypeMaps(
    expectedDataTypeMap, parsedDataTypeMap, worksheetName
  )

  switch (dataLayout) {
  case 'dataList':
    assertParsedWorksheetListData(
      expectedData as DataListData,
      parsedData as DataListData,
      expectedDataTypeMap, parsedDataTypeMap, worksheetName
    )
    break
  case 'dataTable':
    assertParsedWorksheetTableData(
      expectedData as DataTableData,
      parsedData as DataTableData,
      expectedDataTypeMap, parsedDataTypeMap, worksheetName
    )
    break
  case 'frontMatterOnly':
    break // no data to check
  default:
    throw new Error(`Unknown data layout: ${dataLayout}`)
  }
}

//-------------------------------------------------------------------------

const assertParsedWorkSheetMetaTypeMaps = (
  expectedMetaTypeMap: MetaTypeMap | undefined,
  parsedMetaTypeMap: MetaTypeMap | undefined,
  worksheetName: string
) => {

  assertConsistentDefinedState(
    worksheetName, expectedMetaTypeMap, parsedMetaTypeMap, {
      firstDefinedButNotSecondMsg: 'expectedMetaTypeMap is defined but parsedMetaTypeMap is undefined',
      secondDefinedButNotFirstMsg: 'expectedMetaTypeMap is undefined but parsed MetaTypeMap is defined'
    })

  const expectedMetaTypeKeys = keys(expectedMetaTypeMap || {})
  const parsedMetaTypeKeys = keys(parsedMetaTypeMap  || {})

  expect(
    parsedMetaTypeKeys.length,
    `WS:${worksheetName}: \n` +
    `  Number of parsed metaType keys ${parsedMetaTypeKeys.length} does not match expected ${expectedMetaTypeKeys.length}\n` +
    `  Parsed keys: ${toJson(parsedMetaTypeKeys)}\n` +
    `  Expected keys: ${toJson(expectedMetaTypeKeys)}\n`
  ).toEqual(expectedMetaTypeKeys.length)

  for (const expectedKey of expectedMetaTypeKeys) {

    expect(
      parsedMetaTypeKeys,
      `WS:${worksheetName}: \n` +
      `  Expected MetaTypeMap key ${expectedKey} data is missing in from parsed MetaTypeMap`
    ).toContain(expectedKey)

    expect(
      parsedMetaTypeMap![expectedKey],
      `WS:${worksheetName}: \n` +
      `  Expected MetaTypeMap type for key ${expectedKey}: ${parsedMetaTypeMap![expectedKey]}\n` +
      `  does not match parsed metaType type: ${parsedMetaTypeMap![expectedKey]}`
    ).toEqual(expectedMetaTypeMap![expectedKey])
  }
}

//-------------------------------------------------------------------------

const assertParsedWorksheetDataTypeMaps = (
  expectedDataTypeMap: DataTypeMap | undefined,
  parsedDataTypeMap: DataTypeMap | undefined,
  worksheetName: string
) => {

  assertConsistentDefinedState(
    worksheetName, expectedDataTypeMap, parsedDataTypeMap, {
      firstDefinedButNotSecondMsg: 'expectedDataTypeMap is defined but parsedDataTypeMap is undefined',
      secondDefinedButNotFirstMsg: 'expectedDataTypeMap is undefined but parsed DataTypeMap is defined'
    })

  if (!expectedDataTypeMap) return

  const expectedDataKeys = keys(expectedDataTypeMap!)
  const parsedDataKeys = keys(parsedDataTypeMap!)

  expect(
    parsedDataKeys.length,
    `WS:${worksheetName}: \n` +
    `  Number of parsed dataType keys ${parsedDataKeys.length} does not match expected ${expectedDataKeys.length}\n` +
    `  Parsed keys: ${toJson(parsedDataKeys)}\n` +
    `  Expected keys: ${toJson(expectedDataKeys)}\n`
  ).toEqual(expectedDataKeys.length)

  for (const expectedKey of expectedDataKeys) {

    expect(
      parsedDataKeys,
      `WS:${worksheetName}: \n` +
      `  Expected data key ${expectedKey} data is missing in from parsed data`
    ).toContain(expectedKey)

    expect(
      parsedDataTypeMap![expectedKey],
      `WS:${worksheetName}: \n` +
      `  Expected data type for key ${expectedKey}: ${parsedDataTypeMap![expectedKey]}\n` +
      `  does not match parsed data type: ${parsedDataTypeMap![expectedKey]}`
    ).toEqual(expectedDataTypeMap![expectedKey])
  }
}

//-------------------------------------------------------------------------

const assertParsedWorkSheetMeta = (
  expectedMeta: Meta | undefined,
  expectedMetaTypeMap: MetaTypeMap | undefined,
  parsedMeta: Meta | undefined,
  parsedMetaTypeMap: MetaTypeMap | undefined,
  worksheetName: string
) => {


  assertConsistentDefinedState(
    worksheetName, expectedMeta, parsedMeta, {
      firstDefinedButNotSecondMsg: 'expectedMeta is defined but parsedMeta is undefined',
      secondDefinedButNotFirstMsg: 'expectedMeta is undefined but parsedMeta is defined'
    })

  assertConsistentDefinedState(
    worksheetName, expectedMetaTypeMap, parsedMetaTypeMap, {
      firstDefinedButNotSecondMsg: 'expectedMetaTypeMap is defined but parsedMetaTypeMap is undefined',
      secondDefinedButNotFirstMsg: 'expectedMetaTypeMap is undefined but parsedMetaTypeMap is defined'
    })

  // all inputs should be eithyer all defined or all undefined
  const testInputs = [expectedMeta, parsedMeta, expectedMetaTypeMap, parsedMetaTypeMap]
  if (!allDefinedOrAllUndefined(...testInputs)) {
    assert(false,
      `assertParsedWorkSheetMeta(): WS:${worksheetName}: \n` +
      'All expectedMeta, parsedMeta, expectedMetaTypeMap, parsedMetaTypeMap ' +
      'should be defined or all should be undefined')
  }

  if (!expectedMeta) return

  expect(
    objectsHaveSameKeys(expectedMeta!, parsedMeta!),
    `WS:${worksheetName}: \n` +
    '  Expected meta does not have same keys as parsed meta\n' +
    `  expected meta keys: ${toJson(keys(expectedMeta!))}` +
    `  parsed meta keys: ${toJson(keys(parsedMeta!))}`
  ).toEqual(true)

  const expectedMetaKeys = keys(expectedMeta!)
  const parsedMetaKeys = keys(parsedMeta || {})

  for (const expectedKey of expectedMetaKeys) {

    const dataType = parsedMetaTypeMap![expectedKey]
    const expectedVal = expectedMeta![expectedKey]
    const parsedVal = parsedMeta![expectedKey]

    const {
      validateFn, expectedValForLoggingFn, parsedValForLoggingFn
    } = dataTypeToTestFns(dataType)

    expect(
      validateFn(expectedVal, parsedVal),
      `\nWS:${worksheetName}, meta key: ${expectedKey}\n` +
      `  expected meta value: ${expectedValForLoggingFn(expectedVal)}\n` +
      `  parsed meta value: ${parsedValForLoggingFn(parsedVal)}`
    ).toEqual(true)
  }
}

//-------------------------------------------------------------------------

const assertParsedWorksheetTableData = (
  expectedData: DataTableData | undefined,
  pasredData: DataTableData | undefined,
  expectedDataTypeMap: DataTypeMap | undefined,
  parsedDataTypeMap: DataTypeMap | undefined,
  worksheetName: string
) => {

  assertConsistentDefinedState(
    worksheetName, expectedData, pasredData, {
      firstDefinedButNotSecondMsg: 'expectedData is defined but pasreedData is undefined',
      secondDefinedButNotFirstMsg: 'expectedData is undefined but pasreedData is defined'
    })

  assertConsistentDefinedState(
    worksheetName, expectedDataTypeMap, expectedDataTypeMap, {
      firstDefinedButNotSecondMsg: 'expectedDataTypeMap is defined but expectedDataTypeMap is undefined',
      secondDefinedButNotFirstMsg: 'expectedDataTypeMap is undefined but expectedDataTypeMap is defined'
    })

  // all inputs should be eithyer all defined or all undefined
  const testInputs = [expectedData, pasredData, expectedDataTypeMap, parsedDataTypeMap]
  if (!allDefinedOrAllUndefined(...testInputs)) {
    assert(false,
      `assertParsedWorksheetTableData(): WS:${worksheetName}: \n` +
      'All expectedMeta, parsedMeta, expectedMetaTypeMap, parsedMetaTypeMap ' +
      'should be defined or all should be undefined')
  }

  if (!expectedData) return

  expect(pasredData!.length).toEqual(expectedData.length)

  for (const [idx, expectedRowEntry] of expectedData.entries()) {

    const { expectAllUndefined, expectAllErrors } = expectedRowEntry
    const validateOpts: ValidateOpts = { expectAllUndefined,  expectAllErrors }

    const parsedRowData = pasredData![idx]
    const expectedRowData = omit(['expectAllUndefined', 'expectAllErrors'], expectedRowEntry)

    expect(
      objectsHaveSameKeys(expectedRowData, parsedRowData),
      `\nWS:${worksheetName}: Parsed data does not have same keys as expected\n` +
      `  expected data keys: ${toJson(keys(expectedRowData))}\n` +
      `  parsed data keys: ${toJson(keys(parsedRowData))}\n`

    ).toEqual(true)

    assertParsedData(
      parsedRowData, expectedRowData, expectedDataTypeMap, worksheetName, validateOpts
    )
  }
}

//-------------------------------------------------------------------------

const assertParsedData = (
  parsedRowData: Data | undefined,
  expectedRowData: Data | undefined,
  DataTypeMap: DataTypeMap | undefined,
  worksheetName: string,
  validateOpts: ValidateOpts,
) => {


  if (any(isUndefined, [parsedRowData, expectedRowData, DataTypeMap]))
    throw new Error('assertParsedRow(): All inputs should be defined')

  const entryKey = expectedRowData!.key

  // loop through each key in the expected data entry and validate the parsed data
  for (const propName of keys(expectedRowData!).map(String)) {

    const expectedProp = expectedRowData![propName]
    const parsedProp = parsedRowData![propName]

    const dataType = DataTypeMap![propName]
    const {
      validateFn, expectedValForLoggingFn, parsedValForLoggingFn
    } = dataTypeToTestFns(dataType, validateOpts)

    expect(
      validateFn(expectedProp, parsedProp),
      `\nWS:${worksheetName}, entry:${entryKey}, prop: ${propName}` +
      `\n  expected value: ${expectedValForLoggingFn(expectedProp)}` +
      `\n  parsed value: ${parsedValForLoggingFn(parsedProp)}\n`
    ).toEqual(true)
  }
}

//-------------------------------------------------------------------------

const assertParsedWorksheetListData = (
  expectedData: DataListData | undefined,
  parsedData: DataListData | undefined,
  expectedDataTypeMap: DataTypeMap | undefined,
  parsedDataTypeMap: DataTypeMap | undefined,
  worksheetName: string
) => {

  assertConsistentDefinedState(
    worksheetName, expectedData, parsedData, {
      firstDefinedButNotSecondMsg: 'expectedData is defined but pasreedData is undefined',
      secondDefinedButNotFirstMsg: 'expectedData is undefined but pasreedData is defined'
    })

  assertConsistentDefinedState(
    worksheetName, expectedDataTypeMap, expectedDataTypeMap, {
      firstDefinedButNotSecondMsg: 'expectedDataTypeMap is defined but expectedDataTypeMap is undefined',
      secondDefinedButNotFirstMsg: 'expectedDataTypeMap is undefined but expectedDataTypeMap is defined'
    })

  // all inputs should be either all defined or all undefined
  const testInputs = [expectedData, parsedData, expectedDataTypeMap, parsedDataTypeMap]
  if (!allDefinedOrAllUndefined(...testInputs)) {
    assert(false,
      `assertParsedWorksheetListData(): WS:${worksheetName}: \n` +
      'All expectedMeta, parsedMeta, expectedMetaTypeMap, parsedMetaTypeMap ' +
      'should be defined or all should be undefined')
  }

  if (!expectedData) return

  expect(
    objectsHaveSameKeys(expectedData, parsedData!),
    `\nWS:${worksheetName}: Parsed data does not have same keys as expected\n` +
    `  expected data keys: ${toJson(keys(expectedData))}\n` +
    `  parsed data keys: ${toJson(keys(parsedData!))}\n`
  ).toEqual(true)

  const { expectAllUndefined, expectAllErrors } = expectedData
  const validateOpts: ValidateOpts = { expectAllUndefined,  expectAllErrors }
  assertParsedData(
    parsedData, expectedData, expectedDataTypeMap, worksheetName, validateOpts
  )
}
