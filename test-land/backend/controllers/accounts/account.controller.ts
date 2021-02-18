// @ts-nocheck
import { controller } from '@pulsejs/wave';
import * as actions from './account.actions';
import {
  AccountCollection as collection
} from './account.store';

export const accounts = controller({
  actions,
  collection
});