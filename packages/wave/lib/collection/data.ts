export type GenericModelTypes = String | Array<any> | Object;

export const ModelTypes = {
  PrimaryKey: 'PrimaryKey',
  Required: 'Required',
  Secret: 'Secret',
  Index: 'Index'
} as const;

export type ModelTypes = typeof ModelTypes[keyof typeof ModelTypes];

export class Data <DataType = any> {
  constructor (data) {

  }
}