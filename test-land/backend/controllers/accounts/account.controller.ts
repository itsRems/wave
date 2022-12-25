// @ts-nocheck
import { controller } from '@itsrems/wave';
import * as actions from './account.actions';
import {
  AccountCollection as collection
} from './account.store';

export const accounts = controller({
  collection
}).root(actions);