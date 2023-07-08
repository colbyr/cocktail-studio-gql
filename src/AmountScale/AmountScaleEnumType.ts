import { enumType } from 'nexus';
import { ZAmountScale } from './AmountScale';

export const AmountScaleEnumType = enumType({
  name: 'AmountScale',
  members: ZAmountScale.Values,
});
