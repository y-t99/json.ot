import { IJOTAction } from 'jot/action';

export function invertComponent(action: IJOTAction) {
  const reversalAction: { [key: string]: any } = { p: action.p };

  if ('si' in action) reversalAction.sd = action.si;
  if ('sd' in action) reversalAction.si = action.sd;
  if ('oi' in action) reversalAction.od = action.oi;
  if ('od' in action) reversalAction.oi = action.od;
  if ('li' in action) reversalAction.ld = action.li;
  if ('ld' in action) reversalAction.li = action.ld;
  if ('na' in action) reversalAction.na = -action.na;

  if ('lm' in action) {
    reversalAction.lm = action.p[action.p.length - 1];
    reversalAction.p = action.p
      .slice(0, action.p.length - 1)
      .concat([action.lm]);
  }

  return reversalAction;
}
