export const paths = {
  home: () => '/',
  admin: {
    forex: {
      currencyPair: (id: number) => `/admin/forex/currency-pairs/${id}`,
      currencyPairCreate: () => '/admin/forex/currency-pairs/new',
      currencyPairList: () => '/admin/forex/currency-pairs',
    },
  },
};
