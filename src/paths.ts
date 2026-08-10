export const paths = {
  home: () => '/',
  crypto: {
    index: () => '/crypto',
  },
  forex: {
    index: () => '/forex',
  },
  phStocks: {
    index: () => '/ph-stocks',
  },
  admin: {
    forex: {
      currencyPair: (id: number) => `/admin/forex/currency-pairs/${id}`,
      currencyPairCreate: () => '/admin/forex/currency-pairs/new',
      currencyPairList: () => '/admin/forex/currency-pairs',
    },
    phStocks: {
      sector: (id: number) => `/admin/ph-stocks/sectors/${id}`,
      sectorCreate: () => '/admin/ph-stocks/sectors/new',
      sectorList: () => '/admin/ph-stocks/sectors',
    },
  },
};
