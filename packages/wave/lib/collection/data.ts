export type GenericModelTypes = String | Array<any> | Object;

export const ModelTypes = {
  PrimaryKey: 'PrimaryKey',
  Required: 'Required',
  Secret: 'Secret'
} as const;

export type ModelTypes = typeof ModelTypes[keyof typeof ModelTypes];

export class Data <DataType = any> {
  constructor (data) {

  }
}