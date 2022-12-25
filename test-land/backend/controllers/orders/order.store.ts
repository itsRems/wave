// @ts-nocheck
import { collection, data, utils } from '@itsrems/wave';
import { OrderBody } from './order.interfaces';

export const OrderCollection = collection<OrderBody>()
  .model({
    id: [String, data.PrimaryKey],
    item: [String, data.Required],
    authorId: [String, data.Required]
  })
  .defaults({
    id: utils.Snowflake
  })
  .cache(30);