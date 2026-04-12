const WITHDRAWAL_RULES = {
  BTC: {
    currency: 'BTC',
    network: 'BTC',
    networkLabel: 'Bitcoin',
    addressLabel: 'Bitcoin wallet address',
    hint: 'Use a native Bitcoin address that starts with 1, 3, or bc1.',
    validateAddress(address) {
      return /^(bc1[ac-hj-np-z02-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/i.test(address);
    },
  },
  ETH: {
    currency: 'ETH',
    network: 'ETH',
    networkLabel: 'Ethereum',
    addressLabel: 'Ethereum wallet address',
    hint: 'Use a native Ethereum address that starts with 0x.',
    validateAddress(address) {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    },
  },
  USDT: {
    currency: 'USDT',
    network: 'TRC20',
    networkLabel: 'TRON (TRC20)',
    addressLabel: 'USDT TRC20 wallet address',
    hint: 'Use a TRC20 USDT address that starts with T. ERC20 and BEP20 addresses are not supported.',
    validateAddress(address) {
      return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
    },
  },
};

export const SUPPORTED_WITHDRAWAL_OPTIONS = Object.values(WITHDRAWAL_RULES);

export function getWithdrawalRule(currency) {
  return WITHDRAWAL_RULES[String(currency || '').trim().toUpperCase()] || null;
}

export function validateWithdrawalForm(values) {
  const currency = String(values?.currency || '').trim().toUpperCase();
  const rule = getWithdrawalRule(currency);

  if (!rule) {
    return 'Withdrawals are only supported for BTC, ETH, and USDT on TRC20.';
  }

  const destinationAddress = String(values?.destinationAddress || '').trim();
  if (!destinationAddress) {
    return 'Destination wallet address is required.';
  }

  if (!rule.validateAddress(destinationAddress)) {
    return `Enter a valid ${rule.addressLabel.toLowerCase()}. ${rule.hint}`;
  }

  const amount = Number(values?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Enter a valid withdrawal amount greater than zero.';
  }

  return '';
}