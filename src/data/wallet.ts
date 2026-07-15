import {
  getOfficialWalletItemById,
  getOfficialWalletItemsAsLegacy
} from '@/domain/mods/contentAccess'
import { WALLET_ITEMS as LEGACY_WALLET_ITEMS } from './walletDefinitions'
export { WALLET_ITEMS } from './walletDefinitions'

export const getWalletItems = () => getOfficialWalletItemsAsLegacy() ?? LEGACY_WALLET_ITEMS

export const getWalletItemById = (id: string) => {
  return getOfficialWalletItemById(id) ?? LEGACY_WALLET_ITEMS.find(w => w.id === id)
}
