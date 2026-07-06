export const platformOptions: string[] = ['Tradovate', 'Rithmic', 'MetaTrader 5', 'cTrader', 'DXtrade']

export const challengeTypeOptions: string[] = ['1-Phase', '2-Phase', 'Funded']

export const drawdownOptions: string[] = ['Trailing', 'Static', 'End-of-day']

export interface FilterState {
  platform: string
  challengeType: string
  drawdown: string
}
