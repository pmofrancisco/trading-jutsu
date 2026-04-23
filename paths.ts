export const paths = {
  home: () => '/',
  crypto: {
    index: () => '/crypto',
  },
  forex: {
    index: () => '/forex',
  },
  pse: {
    index: () => '/pse',
  },
  admin: {
    forex: {
      currencyPair: (id: number) => `/admin/forex/currency-pairs/${id}`,
      currencyPairCreate: () => '/admin/forex/currency-pairs/new',
      currencyPairList: () => '/admin/forex/currency-pairs',
    },
    pse: {
      sectorList: () => '/admin/pse/sectors',
    },
  },
};
